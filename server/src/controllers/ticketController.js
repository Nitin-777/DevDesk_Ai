const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const Ticket = require("../models/Ticket");
const User = require("../models/User");
const {
  createNotification,
  notifyAdmins,
} = require("../services/notificationService");

const getId = (value) => {
  if (!value) return null;
  return (value._id || value).toString();
};

const ownsResource = (user, owner) => {
  return getId(user) === getId(owner);
};

const canAccessTicket = (user, ticket) => {
  if (user.role === "admin") return true;

  if (user.role === "customer") {
    return ownsResource(user, ticket.customer);
  }

  if (user.role === "agent") {
    return ownsResource(user, ticket.assignedAgent);
  }

  return false;
};

const canReplyToTicket = (user, ticket) => {
  if (ticket.status === "closed") return false;
  return canAccessTicket(user, ticket);
};

const sendValidationErrors = (req, res) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) return false;

  res.status(400).json({
    success: false,
    message: "Validation failed",
    errors: errors.array(),
  });

  return true;
};

exports.createTicket = async (req, res) => {
  try {
    if (sendValidationErrors(req, res)) return;

    const { title, description, category, priority, tags } = req.body;

    const ticket = await Ticket.create({
      title,
      description,
      customer: req.user._id,
      category: category || "general",
      priority: priority || "medium",
      tags: Array.isArray(tags) ? tags : [],
    });

    await notifyAdmins({
      ticket,
      type: "ticket-created",
      message: `New ticket created: ${ticket.title}`,
    });

    const populatedTicket = await Ticket.findById(ticket._id).populate(
      "customer",
      "name email role"
    );

    res.status(201).json({
      success: true,
      message: "Ticket created successfully",
      ticket: populatedTicket,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Ticket creation failed",
      error: error.message,
    });
  }
};

exports.getMyTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ customer: req.user._id })
      .select("-replies")
      .populate("assignedAgent", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tickets.length,
      tickets,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch tickets",
      error: error.message,
    });
  }
};

exports.getAssignedTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({
      assignedAgent: req.user._id,
    })
      .populate("customer", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tickets.length,
      tickets,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch assigned tickets",
      error: error.message,
    });
  }
};

exports.getAllTickets = async (req, res) => {
  try {
    const {
      status,
      priority,
      category,
      assignedAgent,
      search = "",
      page = 1,
      limit = 10,
    } = req.query;

    const pageNumber = Math.max(Number.parseInt(page, 10) || 1, 1);
    const limitNumber = Math.min(
      Math.max(Number.parseInt(limit, 10) || 10, 1),
      50
    );

    const filter = {};

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;

    if (
      assignedAgent &&
      mongoose.Types.ObjectId.isValid(assignedAgent)
    ) {
      filter.assignedAgent = assignedAgent;
    }

    if (search.trim()) {
      const escapedSearch = search
        .trim()
        .slice(0, 100)
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      const searchRegex = new RegExp(escapedSearch, "i");

      filter.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { tags: searchRegex },
      ];
    }

    const [tickets, totalTickets] = await Promise.all([
      Ticket.find(filter)
        .select("-replies")
        .populate("customer", "name email role")
        .populate("assignedAgent", "name email role")
        .sort({ createdAt: -1 })
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber),

      Ticket.countDocuments(filter),
    ]);

    const totalPages = Math.max(
      Math.ceil(totalTickets / limitNumber),
      1
    );

    res.status(200).json({
      success: true,
      tickets,
      pagination: {
        currentPage: pageNumber,
        totalPages,
        totalTickets,
        limit: limitNumber,
        hasNextPage: pageNumber < totalPages,
        hasPreviousPage: pageNumber > 1,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch all tickets",
      error: error.message,
    });
  }
};

exports.getTicketById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket ID",
      });
    }

    const ticket = await Ticket.findById(req.params.id)
      .populate("customer", "name email role")
      .populate("assignedAgent", "name email role")
      .populate("replies.sender", "name email role");

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    if (!canAccessTicket(req.user, ticket)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to access this ticket",
      });
    }

    const safeTicket = ticket.toObject();

    if (req.user.role === "customer") {
      safeTicket.replies = safeTicket.replies.filter(
        (reply) => !reply.isInternalNote
      );
    }

    res.status(200).json({
      success: true,
      ticket: safeTicket,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch ticket",
      error: error.message,
    });
  }
};

exports.assignTicket = async (req, res) => {
  try {
    if (sendValidationErrors(req, res)) return;

    const { agentId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket ID",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(agentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid agent ID",
      });
    }

    const agent = await User.findById(agentId);

    if (!agent || agent.role !== "agent" || !agent.isActive) {
      return res.status(400).json({
        success: false,
        message: "Selected user is not an active agent",
      });
    }

    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      {
        assignedAgent: agentId,
        status: "assigned",
      },
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("customer", "name email role")
      .populate("assignedAgent", "name email role");

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    await createNotification({
      user: agent,
      ticket,
      type: "ticket-assigned",
      message: `Ticket assigned to you: ${ticket.title}`,
    });

    res.status(200).json({
      success: true,
      message: "Ticket assigned successfully",
      ticket,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Ticket assignment failed",
      error: error.message,
    });
  }
};

exports.updateTicketStatus = async (req, res) => {
  try {
    if (sendValidationErrors(req, res)) return;

    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket ID",
      });
    }

    const ticket = await Ticket.findById(req.params.id)
      .populate("customer", "name email role")
      .populate("assignedAgent", "name email role");

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    if (!canAccessTicket(req.user, ticket)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to update this ticket",
      });
    }

    if (req.user.role === "customer" && status !== "closed") {
      return res.status(403).json({
        success: false,
        message: "Customers can only close their own tickets",
      });
    }

    ticket.status = status;

    if (status === "resolved") {
      ticket.resolvedAt = new Date();
    }

    if (status === "closed") {
      ticket.closedAt = new Date();
    }

    await ticket.save();

    if (req.user.role === "customer") {
      if (ticket.assignedAgent) {
        await createNotification({
          user: ticket.assignedAgent,
          ticket,
          type: "status-updated",
          message: `Customer changed "${ticket.title}" to ${status}`,
        });
      }
    } else if (ticket.customer) {
      await createNotification({
        user: ticket.customer,
        ticket,
        type: "status-updated",
        message: `Ticket "${ticket.title}" changed to ${status}`,
      });
    }

    res.status(200).json({
      success: true,
      message: "Ticket status updated successfully",
      ticket,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Ticket status update failed",
      error: error.message,
    });
  }
};

exports.addReply = async (req, res) => {
  try {
    if (sendValidationErrors(req, res)) return;

    const { message } = req.body;
    const isInternalNote = req.body.isInternalNote === true;

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket ID",
      });
    }

    const ticket = await Ticket.findById(req.params.id)
      .populate("customer", "name email role")
      .populate("assignedAgent", "name email role")
      .populate("replies.sender", "name email role");

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    if (!canReplyToTicket(req.user, ticket)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to reply to this ticket",
      });
    }

    if (req.user.role === "customer" && isInternalNote) {
      return res.status(403).json({
        success: false,
        message: "Customers cannot create internal notes",
      });
    }

    ticket.replies.push({
      sender: req.user._id,
      message,
      isInternalNote,
    });

    if (
      ["open", "assigned"].includes(ticket.status) &&
      req.user.role !== "customer"
    ) {
      ticket.status = "in-progress";
    }

    await ticket.save();

    if (!isInternalNote) {
      if (req.user.role === "customer") {
        if (ticket.assignedAgent) {
          await createNotification({
            user: ticket.assignedAgent,
            ticket,
            type: "new-reply",
            message: `Customer replied to: ${ticket.title}`,
          });
        } else {
          await notifyAdmins({
            ticket,
            type: "new-reply",
            message: `Customer replied to unassigned ticket: ${ticket.title}`,
          });
        }
      } else if (ticket.customer) {
        await createNotification({
          user: ticket.customer,
          ticket,
          type: "new-reply",
          message: `Support replied to: ${ticket.title}`,
        });
      }
    }

    const updatedTicket = await Ticket.findById(ticket._id)
      .populate("customer", "name email role")
      .populate("assignedAgent", "name email role")
      .populate("replies.sender", "name email role");

    const safeTicket = updatedTicket.toObject();

    if (req.user.role === "customer") {
      safeTicket.replies = safeTicket.replies.filter(
        (reply) => !reply.isInternalNote
      );
    }

    res.status(201).json({
      success: true,
      message: isInternalNote
        ? "Internal note added successfully"
        : "Reply added successfully",
      ticket: safeTicket,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to add reply",
      error: error.message,
    });
  }
};
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const Ticket = require("../models/Ticket");
const User = require("../models/User");

const canAccessTicket = (user, ticket) => {
  if (user.role === "admin") return true;

  if (user.role === "customer") {
    return ticket.customer._id.toString() === user._id.toString();
  }

  if (user.role === "agent" && ticket.assignedAgent) {
    return ticket.assignedAgent._id.toString() === user._id.toString();
  }

  return false;
};

exports.createTicket = async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { title, description, category, priority, tags } = req.body;

    const ticket = await Ticket.create({
      title,
      description,
      customer: req.user._id,
      category: category || "general",
      priority: priority || "medium",
      tags: Array.isArray(tags) ? tags : [],
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
    const tickets = await Ticket.find({ assignedAgent: req.user._id })
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
    const { status, priority, category } = req.query;

    const filter = {};

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;

    const tickets = await Ticket.find(filter)
      .populate("customer", "name email role")
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
        message: "You are not allowed to access this ticket",
      });
    }

    res.status(200).json({
      success: true,
      ticket,
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

    if (!agent || agent.role !== "agent") {
      return res.status(400).json({
        success: false,
        message: "Selected user is not a valid agent",
      });
    }

    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      {
        assignedAgent: agentId,
        status: "assigned",
      },
      { new: true, runValidators: true }
    )
      .populate("customer", "name email role")
      .populate("assignedAgent", "name email role");

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

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
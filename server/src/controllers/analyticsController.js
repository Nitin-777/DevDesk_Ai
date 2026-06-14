const Ticket = require("../models/Ticket");
const User = require("../models/User");

exports.getOverviewStats = async (req, res) => {
  try {
    const [
      totalTickets,
      openTickets,
      assignedTickets,
      inProgressTickets,
      resolvedTickets,
      closedTickets,
      highPriorityTickets,
      urgentTickets,
      totalCustomers,
      totalAgents,
    ] = await Promise.all([
      Ticket.countDocuments(),
      Ticket.countDocuments({ status: "open" }),
      Ticket.countDocuments({ status: "assigned" }),
      Ticket.countDocuments({ status: "in-progress" }),
      Ticket.countDocuments({ status: "resolved" }),
      Ticket.countDocuments({ status: "closed" }),
      Ticket.countDocuments({ priority: "high" }),
      Ticket.countDocuments({ priority: "urgent" }),
      User.countDocuments({ role: "customer" }),
      User.countDocuments({ role: "agent" }),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalTickets,
        openTickets,
        assignedTickets,
        inProgressTickets,
        resolvedTickets,
        closedTickets,
        highPriorityTickets,
        urgentTickets,
        totalCustomers,
        totalAgents,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch overview stats",
      error: error.message,
    });
  }
};

exports.getTicketsByStatus = async (req, res) => {
  try {
    const data = await Ticket.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          status: "$_id",
          count: 1,
        },
      },
      {
        $sort: { status: 1 },
      },
    ]);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch tickets by status",
      error: error.message,
    });
  }
};

exports.getTicketsByPriority = async (req, res) => {
  try {
    const data = await Ticket.aggregate([
      {
        $group: {
          _id: "$priority",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          priority: "$_id",
          count: 1,
        },
      },
      {
        $sort: { priority: 1 },
      },
    ]);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch tickets by priority",
      error: error.message,
    });
  }
};

exports.getTicketsByCategory = async (req, res) => {
  try {
    const data = await Ticket.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          category: "$_id",
          count: 1,
        },
      },
      {
        $sort: { category: 1 },
      },
    ]);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch tickets by category",
      error: error.message,
    });
  }
};

exports.getAgentWorkload = async (req, res) => {
  try {
    const data = await Ticket.aggregate([
      {
        $match: {
          assignedAgent: { $ne: null },
        },
      },
      {
        $group: {
          _id: "$assignedAgent",
          totalAssigned: { $sum: 1 },
          openWork: {
            $sum: {
              $cond: [
                { $in: ["$status", ["assigned", "in-progress"]] },
                1,
                0,
              ],
            },
          },
          resolved: {
            $sum: {
              $cond: [{ $eq: ["$status", "resolved"] }, 1, 0],
            },
          },
          closed: {
            $sum: {
              $cond: [{ $eq: ["$status", "closed"] }, 1, 0],
            },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "agent",
        },
      },
      {
        $unwind: "$agent",
      },
      {
        $project: {
          _id: 0,
          agentId: "$agent._id",
          agentName: "$agent.name",
          agentEmail: "$agent.email",
          totalAssigned: 1,
          openWork: 1,
          resolved: 1,
          closed: 1,
        },
      },
      {
        $sort: { totalAssigned: -1 },
      },
    ]);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch agent workload",
      error: error.message,
    });
  }
};
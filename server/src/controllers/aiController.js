const mongoose = require("mongoose");
const Ticket = require("../models/Ticket");
const aiService = require("../services/aiService");

const canManageTicket = (user, ticket) => {
  if (user.role === "admin") return true;

  return (
    user.role === "agent" &&
    ticket.assignedAgent?._id.toString() === user._id.toString()
  );
};

exports.analyzeTicket = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket ID",
      });
    }

    const ticket = await Ticket.findById(req.params.id).populate(
      "assignedAgent",
      "name email role"
    );

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    if (!canManageTicket(req.user, ticket)) {
      return res.status(403).json({
        success: false,
        message: "You cannot analyze this ticket",
      });
    }

    const analysis = await aiService.analyzeTicket(ticket);

    const categories = [
      "technical",
      "billing",
      "account",
      "feature-request",
      "general",
    ];
    const priorities = ["low", "medium", "high", "urgent"];
    const sentiments = ["positive", "neutral", "negative", "frustrated"];

    ticket.category = categories.includes(analysis.category)
      ? analysis.category
      : ticket.category;

    ticket.priority = priorities.includes(analysis.priority)
      ? analysis.priority
      : ticket.priority;

    ticket.sentiment = sentiments.includes(analysis.sentiment)
      ? analysis.sentiment
      : ticket.sentiment;

    ticket.aiSummary = String(analysis.summary || "").slice(0, 250);
    ticket.tags = Array.isArray(analysis.tags)
      ? analysis.tags.slice(0, 5).map((tag) => String(tag).slice(0, 30))
      : ticket.tags;

    await ticket.save();

    res.status(200).json({
      success: true,
      message: "Ticket analyzed successfully",
      analysis,
      ticket,
    });
  } catch (error) {
    res.status(502).json({
      success: false,
      message: "AI analysis failed",
      error: error.message,
    });
  }
};

exports.suggestReply = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate("assignedAgent", "name email role")
      .populate("replies.sender", "name role");

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    if (!canManageTicket(req.user, ticket)) {
      return res.status(403).json({
        success: false,
        message: "You cannot generate a reply for this ticket",
      });
    }

    const result = await aiService.suggestReply(ticket);

    res.status(200).json({
      success: true,
      suggestedReply: result.suggestedReply,
    });
  } catch (error) {
    res.status(502).json({
      success: false,
      message: "AI reply generation failed",
      error: error.message,
    });
  }
};
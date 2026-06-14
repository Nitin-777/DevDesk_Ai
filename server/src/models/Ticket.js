const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Ticket title is required"],
      trim: true,
      minlength: [5, "Title must be at least 5 characters"],
      maxlength: [120, "Title cannot exceed 120 characters"],
    },
    description: {
      type: String,
      required: [true, "Ticket description is required"],
      trim: true,
      minlength: [10, "Description must be at least 10 characters"],
      maxlength: [5000, "Description cannot exceed 5000 characters"],
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedAgent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    category: {
      type: String,
      enum: ["technical", "billing", "account", "feature-request", "general"],
      default: "general",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["open", "assigned", "in-progress", "resolved", "closed"],
      default: "open",
    },
    sentiment: {
      type: String,
      enum: ["positive", "neutral", "negative", "frustrated"],
      default: "neutral",
    },
    aiSummary: {
      type: String,
      default: "",
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    resolvedAt: {
      type: Date,
      default: null,
    },
    closedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

ticketSchema.index({ customer: 1, createdAt: -1 });
ticketSchema.index({ assignedAgent: 1, status: 1 });
ticketSchema.index({ status: 1, priority: 1 });
ticketSchema.index({ category: 1 });

module.exports = mongoose.model("Ticket", ticketSchema);
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
      default: null,
    },
    type: {
      type: String,
      enum: [
        "ticket-created",
        "ticket-assigned",
        "new-reply",
        "status-updated",
      ],
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 250,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
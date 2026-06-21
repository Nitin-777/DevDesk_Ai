const Notification = require("../models/Notification");
const User = require("../models/User");

exports.createNotification = async ({
  user,
  ticket,
  type,
  message,
}) => {
  if (!user) return;

  try {
    await Notification.create({
      user: user._id || user,
      ticket: ticket._id || ticket,
      type,
      message,
    });
  } catch (error) {
    console.error("Notification creation failed:", error.message);
  }
};

exports.notifyAdmins = async ({ ticket, type, message }) => {
  try {
    const admins = await User.find({
      role: "admin",
      isActive: true,
    }).select("_id");

    if (!admins.length) return;

    await Notification.insertMany(
      admins.map((admin) => ({
        user: admin._id,
        ticket: ticket._id || ticket,
        type,
        message,
      }))
    );
  } catch (error) {
    console.error("Admin notification failed:", error.message);
  }
};
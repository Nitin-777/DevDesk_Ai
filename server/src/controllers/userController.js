const User = require("../models/User");

exports.getAgents = async (req, res) => {
  try {
    const agents = await User.find({ role: "agent", isActive: true })
      .select("name email role createdAt")
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: agents.length,
      agents,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch agents",
      error: error.message,
    });
  }
};
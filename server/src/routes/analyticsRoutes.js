const express = require("express");
const {
  getOverviewStats,
  getTicketsByStatus,
  getTicketsByPriority,
  getTicketsByCategory,
  getAgentWorkload,
} = require("../controllers/analyticsController");
const {
  protect,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);
router.use(authorizeRoles("admin"));

router.get("/overview", getOverviewStats);
router.get("/tickets-by-status", getTicketsByStatus);
router.get("/tickets-by-priority", getTicketsByPriority);
router.get("/tickets-by-category", getTicketsByCategory);
router.get("/agent-workload", getAgentWorkload);

module.exports = router;
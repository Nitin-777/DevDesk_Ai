const express = require("express");
const { param } = require("express-validator");
const {
  analyzeTicket,
  suggestReply,
} = require("../controllers/aiController");
const {
  protect,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);
router.use(authorizeRoles("agent", "admin"));

router.post(
  "/tickets/:id/analyze",
  param("id").isMongoId(),
  analyzeTicket
);

router.post(
  "/tickets/:id/suggest-reply",
  param("id").isMongoId(),
  suggestReply
);

module.exports = router;
const express = require("express");
const { getAgents } = require("../controllers/userController");
const {
  protect,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);
router.use(authorizeRoles("admin"));

router.get("/agents", getAgents);

module.exports = router;
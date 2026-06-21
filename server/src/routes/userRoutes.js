const express = require("express");
const { body } = require("express-validator");
const {
  createAgent,
  getAgents,
} = require("../controllers/userController");
const {
  protect,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);
router.use(authorizeRoles("admin"));

router.get("/agents", getAgents);

router.post(
  "/agents",
  [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Name is required")
      .isLength({ min: 2, max: 50 })
      .withMessage("Name must be between 2 and 50 characters"),

    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Valid email is required")
      .normalizeEmail(),

    body("password")
      .isString()
      .withMessage("Password must be a string")
      .isLength({ min: 8, max: 72 })
      .withMessage("Password must be between 8 and 72 characters"),
  ],
  createAgent
);

module.exports = router;
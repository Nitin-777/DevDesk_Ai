const express = require("express");
const { body } = require("express-validator");
const {
  register,
  login,
  getMe,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/register",
  [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Name is required")
      .isLength({ min: 2, max: 50 })
      .withMessage("Name must be between 2 and 50 characters"),

    body("email")
      .trim()
      .isEmail()
      .withMessage("Please provide a valid email")
      .normalizeEmail(),

    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),

    body("role")
      .optional()
      .isIn(["customer", "agent"])
      .withMessage("Role must be customer or agent"),
  ],
  register
);

router.post(
  "/login",
  [
    body("email")
      .trim()
      .isEmail()
      .withMessage("Please provide a valid email")
      .normalizeEmail(),

    body("password").notEmpty().withMessage("Password is required"),
  ],
  login
);

router.get("/me", protect, getMe);

module.exports = router;
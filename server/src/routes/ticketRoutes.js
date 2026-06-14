const express = require("express");
const { body, param } = require("express-validator");
const {
  createTicket,
  getMyTickets,
  getAssignedTickets,
  getAllTickets,
  getTicketById,
  assignTicket,
  updateTicketStatus,
} = require("../controllers/ticketController");
const {
  protect,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();

const ticketValidation = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 5, max: 120 })
    .withMessage("Title must be between 5 and 120 characters"),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ min: 10, max: 5000 })
    .withMessage("Description must be between 10 and 5000 characters"),

  body("category")
    .optional()
    .isIn(["technical", "billing", "account", "feature-request", "general"])
    .withMessage("Invalid category"),

  body("priority")
    .optional()
    .isIn(["low", "medium", "high", "urgent"])
    .withMessage("Invalid priority"),

  body("tags")
    .optional()
    .isArray()
    .withMessage("Tags must be an array"),
];

router.use(protect);

router.post("/", authorizeRoles("customer", "admin"), ticketValidation, createTicket);

router.get("/my", authorizeRoles("customer", "admin"), getMyTickets);

router.get("/assigned", authorizeRoles("agent"), getAssignedTickets);

router.get("/all", authorizeRoles("admin"), getAllTickets);

router.get(
  "/:id",
  [param("id").isMongoId().withMessage("Invalid ticket ID")],
  getTicketById
);

router.patch(
  "/:id/assign",
  authorizeRoles("admin"),
  [
    param("id").isMongoId().withMessage("Invalid ticket ID"),
    body("agentId").isMongoId().withMessage("Valid agent ID is required"),
  ],
  assignTicket
);

router.patch(
  "/:id/status",
  [
    param("id").isMongoId().withMessage("Invalid ticket ID"),
    body("status")
      .isIn(["open", "assigned", "in-progress", "resolved", "closed"])
      .withMessage("Invalid status"),
  ],
  updateTicketStatus
);

module.exports = router;
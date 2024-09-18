const router = require("express").Router();
const requireAuth = require("../middleware/requireAuth");
const csrfProtection = require("../middleware/csrfProtection");
const { body, validationResult } = require("express-validator"); // Corrected import

const {
  createPayment,
  getAllPayment,
  deletePayment,
  updatePayment,
  getTotalPaymentPerStore,
  getTotalPaymentForAdmin,
} = require("../controller/paymentController");

// Apply authentication to all routes
router.use(requireAuth);

// Create a new payment (state-changing, requires CSRF protection)
router.post("/add", csrfProtection, createPayment);

// Get all payments (read-only, no CSRF protection needed)
router.get("/", getAllPayment);

// Update a payment (state-changing, requires CSRF protection)
router.put("/update/", csrfProtection, updatePayment);

// Delete a payment (state-changing, requires CSRF protection)
router.delete("/delete/", csrfProtection, deletePayment);

// Get the total payments made to a specific store (read-only, no CSRF protection needed)
router.get("/getStoreTotal/:id", getTotalPaymentPerStore);

// Validation and sanitization middleware
router.patch(
  "/updatePaymentStatus",
  csrfProtection, // Ensure CSRF protection is applied
  [
    // Validate and sanitize paymentID
    body("paymentID")
      .isMongoId()
      .withMessage("Invalid payment ID")
      .trim()
      .escape(),

    // Validate and sanitize status
    body("status")
      .isIn(["pending", "completed", "failed"])
      .withMessage("Invalid status value")
      .trim()
      .escape(),
  ],
  async (req, res, next) => {
    // Handle validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Pass the sanitized data to the controller function
    next();
  },
  updatePayment
);

// Get the total payments for the admin (read-only, no CSRF protection needed)
router.get("/getAdminTotal", getTotalPaymentForAdmin);

module.exports = router;

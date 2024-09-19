const router = require("express").Router();
const requireAuth = require("../middleware/requireAuth");
const csrfProtection = require("../middleware/csrfProtection");
const logger = require("../logger.js"); // Import the logger

const {
  createPayment,
  getAllPayment,
  deletePayment,
  updatePayment,
  getTotalPaymentPerStore,
  getTotalPaymentForAdmin,
} = require("../controller/paymentController");

// Apply authentication to all routes
router.use((req, res, next) => {
  logger.info("Authentication required for route", { route: req.originalUrl });
  requireAuth(req, res, next);
});

// Create a new payment (state-changing, requires CSRF protection)
router.post("/add", csrfProtection, (req, res, next) => {
  logger.info("POST /add accessed", { route: req.originalUrl });
  createPayment(req, res, next);
});

// Get all payments (read-only, no CSRF protection needed)
router.get("/", (req, res, next) => {
  logger.info("GET / accessed", { route: req.originalUrl });
  getAllPayment(req, res, next);
});

// Delete a payment (state-changing, requires CSRF protection)
router.delete("/delete/", csrfProtection, (req, res, next) => {
  logger.info("DELETE /delete accessed", { route: req.originalUrl });
  deletePayment(req, res, next);
});

// Get the total payments made to a specific store (read-only, no CSRF protection needed)
router.get("/getStoreTotal/:id", (req, res, next) => {
  logger.info("GET /getStoreTotal/:id accessed", { route: req.originalUrl, storeID: req.params.id });
  getTotalPaymentPerStore(req, res, next);
});

// Update the payment status (state-changing, requires CSRF protection)
router.patch("/updatePaymentStatus", csrfProtection, (req, res, next) => {
  logger.info("PATCH /updatePaymentStatus accessed", { route: req.originalUrl });
  updatePayment(req, res, next);
});

// Get the total payments for the admin (read-only, no CSRF protection needed)
router.get("/getAdminTotal", (req, res, next) => {
  logger.info("GET /getAdminTotal accessed", { route: req.originalUrl });
  getTotalPaymentForAdmin(req, res, next);
});

module.exports = router;

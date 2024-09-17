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
  updatePaymentStatus,
  getTotalPaymentForAdmin,
} = require("../controller/paymentController");

// Middleware to log every incoming request
router.use((req, res, next) => {
  logger.info(`Incoming request: ${req.method} ${req.originalUrl}`);
  next();
});

// Apply authentication to all routes
router.use(requireAuth);

// Create a new payment (state-changing, requires CSRF protection)
router.post("/add", csrfProtection, async (req, res, next) => {
  try {
    await createPayment(req, res);
    logger.info("Payment created successfully", { userID: req.body.userID });
  } catch (error) {
    logger.error("Error creating payment", { error: error.message });
    next(error);
  }
});

// Get all payments (read-only, no CSRF protection needed)
router.get("/", async (req, res, next) => {
  try {
    await getAllPayment(req, res);
    logger.info("Fetched all payments");
  } catch (error) {
    logger.error("Error fetching payments", { error: error.message });
    next(error);
  }
});

// Update a payment (state-changing, requires CSRF protection)
router.put("/update/", csrfProtection, async (req, res, next) => {
  try {
    await updatePayment(req, res);
    logger.info("Payment updated", { paymentID: req.body.paymentID });
  } catch (error) {
    logger.error("Error updating payment", { error: error.message });
    next(error);
  }
});

// Delete a payment (state-changing, requires CSRF protection)
router.delete("/delete/", csrfProtection, async (req, res, next) => {
  try {
    await deletePayment(req, res);
    logger.info("Payment deleted", { paymentID: req.body.paymentID });
  } catch (error) {
    logger.error("Error deleting payment", { error: error.message });
    next(error);
  }
});

// Get the total payments made to a specific store (read-only, no CSRF protection needed)
router.get("/getStoreTotal/:id", async (req, res, next) => {
  try {
    await getTotalPaymentPerStore(req, res);
    logger.info("Fetched total payments for store", { storeID: req.params.id });
  } catch (error) {
    logger.error("Error fetching store total payments", { error: error.message });
    next(error);
  }
});

// Update the payment status (state-changing, requires CSRF protection)
router.patch("/updatePaymentStatus", csrfProtection, async (req, res, next) => {
  try {
    await updatePaymentStatus(req, res);
    logger.info("Payment status updated", { paymentID: req.body.paymentID });
  } catch (error) {
    logger.error("Error updating payment status", { error: error.message });
    next(error);
  }
});

// Get the total payments for the admin (read-only, no CSRF protection needed)
router.get("/getAdminTotal", async (req, res, next) => {
  try {
    await getTotalPaymentForAdmin(req, res);
    logger.info("Fetched total payments for admin");
  } catch (error) {
    logger.error("Error fetching admin total payments", { error: error.message });
    next(error);
  }
});

module.exports = router;

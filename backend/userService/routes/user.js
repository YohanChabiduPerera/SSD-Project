import { Router } from "express";
import {
  deleteUser,
  getAllUsers,
  getOneUser,
  getUserCount,
  updateUser,
  updateUserStore,
  userLogin,
  userSignUp,
} from "../controller/userController.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { csrfProtection } from "../middleware/csrfProtetion.js";
import { check, validationResult } from "express-validator"; // Import express-validator

// Create a new router instance
const router = Router();

// Basic validation for login
const validateUserLogin = [
  check('userName')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(), // Sanitize email input
  check('password')
    .notEmpty()
    .withMessage('Password is required') // Only check that a password is provided
    .trim().escape(),
  check('role')
    .isIn(['Admin', 'Buyer', 'Merchant'])
    .withMessage('Invalid role'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];


// Basic validation for signup
const validateUserSignUp = [
  check("userName")
    .isEmail()
    .withMessage("Please enter a valid email")
    .normalizeEmail(), // Sanitize email input
  check("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/\d/)
    .withMessage("Password must contain a number")
    .trim()
    .escape(), // Sanitize password input
  check("contact")
    .isNumeric()
    .withMessage("Contact must be numeric")
    .isLength({ min: 10, max: 10 })
    .withMessage("Contact must be exactly 10 digits")
    .trim(), // Sanitize contact input
  check("address")
    .isLength({ min: 10 })
    .withMessage("Address must be at least 10 characters long")
    .matches(/\d/)
    .withMessage("Address must contain a number")
    .matches(/[a-zA-Z]/)
    .withMessage("Address must contain letters")
    .trim()
    .escape(), // Sanitize address input
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

// User login route (no auth or CSRF protection needed)
router.post("/login", validateUserLogin, userLogin);

// User sign-up route (no auth or CSRF protection needed)
router.post("/signup", validateUserSignUp, userSignUp);

// Apply authentication middleware to all routes below
router.use(requireAuth);

// Routes that don't change state (no CSRF protection needed)
router.get("/", getAllUsers); // Get all users
router.get("/:id/:role", getOneUser); // Get one user by ID and role
router.get("/admin/usercount", getUserCount); // Get user count for admin

// Apply CSRF protection to state-changing routes
router.patch("/update", csrfProtection, updateUser); // Update user
router.patch("/updateUserStore", csrfProtection, updateUserStore); // Update user store
router.delete("/deleteUser/:id", csrfProtection, deleteUser); // Delete user by ID

// Export the router as the default export
export default router;

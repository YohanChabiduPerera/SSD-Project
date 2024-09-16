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
import requireAuth from "../../storeService/middleware/requireAuth.js";

// Create a new router instance
const router = Router();

// User login route
router.post("/login", userLogin);

// User sign up route
router.post("/signup", userSignUp);

// The below routes will be protected routes
router.use(requireAuth);

// Get all users route
router.get("/", getAllUsers);

// Update user route
router.patch("/update", updateUser);

// Get one user by ID route
router.get("/:id/:role", getOneUser);

// Update user store route
router.patch("/updateUserStore", updateUserStore);

// Get user count for admin route
router.get("/getUserCountForAdmin", getUserCount);

// Delete user by ID route
router.delete("/deleteUser/:id", deleteUser);

// Export the router as the default export
export default router;

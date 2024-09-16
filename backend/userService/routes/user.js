import { Router } from "express";
import {
  userLogin,
  userSignUp,
  updateUser,
  getOneUser,
  updateUserStore,
  getUserCount,
  getAllUsers,
  deleteUser,
} from "../controller/userController.js";

// Create a new router instance
const router = Router();

// User login route
router.post("/login", userLogin);

// User sign up route
router.post("/signup", userSignUp);

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

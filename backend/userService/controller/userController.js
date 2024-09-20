import jwt from "jsonwebtoken";
import userModel from "../models/User.js";
import crypto from "crypto";
import logger from "../logger.js"; // Import logger

// To generate a token
const createToken = (id) => {
  return jwt.sign({ id }, process.env.SECRET, { expiresIn: "3d" });
};

// To generate a CSRF token
const createCsrfToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

// User login function with Double Submit Cookie pattern
const userLogin = async (req, res) => {
  try {
    const { userName, password, role, image, googleAuthAccessToken } = req.body;
    let { loginType } = req.body;

    loginType = loginType || "systemLogin";

    logger.info("User login attempt", { userName, loginType });

    const user = await userModel.login(
      userName,
      password,
      role,
      loginType,
      image,
      googleAuthAccessToken
    );

    const token = createToken(user._id);
    const csrfToken = createCsrfToken();

    // Set the JWT as a HttpOnly cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days in milliseconds
    });

    // Set the CSRF token as a non-HttpOnly cookie
    res.cookie("csrfToken", csrfToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 3 * 24 * 60 * 60 * 1000,
    });

    logger.info("User login successful", { userID: user._id });
    res.status(200).json({ ...user.toObject() });
  } catch (err) {
    logger.error("User login failed", { error: err.message });
    res.status(401).json({ err: err.message });
  }
};

// Similar changes for sign-up
const userSignUp = async (req, res) => {
  const { userName, password, contact, address, role, image } = req.body;
  try {
    logger.info("User signup attempt", { userName, role });

    const user = await userModel.signup(
      userName,
      password,
      contact,
      address,
      image,
      role
    );

    const token = createToken(user._id);
    const csrfToken = createCsrfToken();

    // Set the JWT as a HttpOnly cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 3 * 24 * 60 * 60 * 1000,
    });

    // Set the CSRF token as a non-HttpOnly cookie
    res.cookie("csrfToken", csrfToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 3 * 24 * 60 * 60 * 1000,
    });

    logger.info("User signup successful", { userID: user._id });
    res.status(201).json({ ...user.toObject() });
  } catch (err) {
    logger.error("User signup failed", { error: err.message });
    res.status(400).json({ err: err.message });
  }
};

// Get all users
const getAllUsers = async (req, res) => {
  try {
    logger.info("Fetching all users");

    const users = await userModel.find().select("-image");
    logger.info("Users fetched successfully", { count: users.length });

    res.json({ users, userCount: users.length });
  } catch (err) {
    logger.error("Error fetching users", { error: err.message });
    res.send(err.message);
  }
};

// Update user function
const updateUser = async (req, res) => {
  const { userId, userName, image } = req.body;

  logger.info("Updating user", { userId });

  try {
    const user = await userModel.findOneAndUpdate(
      { _id: userId },
      { userName, image },
      { new: true }
    );
    logger.info("User updated successfully", { userId });
    res.json(user);
  } catch (err) {
    logger.error("Error updating user", { userId, error: err.message });
    res.send(err.message);
  }
};

// Delete user function
const deleteUser = async (req, res) => {
  try {
    logger.info("Deleting user", { userID: req.params.id });

    const data = await userModel.findByIdAndDelete(req.params.id);
    logger.info("User deleted successfully", { userID: req.params.id });
    res.json(data);
  } catch (err) {
    logger.error("Error deleting user", {
      userID: req.params.id,
      error: err.message,
    });
    res.send(err.message);
  }
};

// Get one user by ID and role
const getOneUser = async (req, res) => {
  const { id, role } = req.params;
  logger.info("Fetching user by ID and role", { userID: id, role });

  try {
    const user = await userModel.find({ _id: id, role });
    logger.info("User fetched successfully", { userID: id });
    res.status(200).json(user);
  } catch (err) {
    logger.error("Error fetching user", { userID: id, error: err.message });
    res.send(err.message);
  }
};

// Update user's store
const updateUserStore = async (req, res) => {
  const { userID, storeID } = req.body;
  logger.info("Updating user's store", { userID, storeID });

  try {
    const updatedUser = await userModel.findOneAndUpdate(
      { _id: userID },
      { storeID }
    );
    logger.info("User's store updated successfully", { userID, storeID });
    res.json(updatedUser);
  } catch (err) {
    logger.error("Error updating user's store", {
      userID,
      storeID,
      error: err.message,
    });
    res.json(err);
  }
};

// Get user count for admin
const getUserCount = async (_, res) => {
  logger.info("Fetching user count");

  try {
    const data = await userModel.find();
    logger.info("User count retrieved successfully", { count: data.length });
    res.json({ userCount: data.length });
  } catch (err) {
    logger.error("Error fetching user count", { error: err.message });
    res.send(err.message);
  }
};

const retrieveGoogleAccessToken = async (req, res) => {
  try {
    const { userName, role } = req.params; // Extract userName and role from path parameters

    // Fetch the googleAuthAccessToken for the user with the given userName and role
    const user = await userModel.findOne(
      { userName, role }, // Query by userName and role
      { googleAuthAccessToken: 1 } // Only return googleAuthAccessToken field
    );

    if (user) {
      logger.info("Fetched Google Account Access Token for user", {
        userName,
        role,
      });

      // Return only the googleAuthAccessToken
      res
        .status(200)
        .json({ googleAuthAccessToken: user.googleAuthAccessToken });
    } else {
      logger.error("User not found", { userName, role });
      res.status(404).json({ message: "User not found" });
    }
  } catch (err) {
    logger.error("Error fetching Access Token", { error: err.message });
    res.status(500).json({ error: err.message });
  }
};

const setGoogleAccessToken = async (req, res) => {
  const { userName, role, googleAuthAccessToken } = req.body;

  try {
    logger.info("Attempting to update Google Account Access Token", {
      userName,
      role,
    });

    // Find the user by userName and role
    const user = await userModel.findOneAndUpdate(
      { userName, role },
      { googleAuthAccessToken },
      { new: true }
    );

    if (user) {
      logger.info("Successfully updated Google Account Access Token for user", {
        userID: user._id,
        userName,
        role,
      });
      res.status(200).json(user);
    } else {
      logger.error(
        "Failed to update Google Account Access Token - User not found",
        { userName, role }
      );
      res.status(404).json({ message: "User not found" });
    }
  } catch (err) {
    logger.error("Error occurred while updating Google Account Access Token", {
      userName,
      role,
      error: err.message,
    });
    res.status(500).json({ error: err.message });
  }
};

// Export functions for use in other files
export {
  userLogin,
  userSignUp,
  getAllUsers,
  updateUser,
  getOneUser,
  deleteUser,
  getUserCount,
  updateUserStore,
  retrieveGoogleAccessToken,
  setGoogleAccessToken,
};

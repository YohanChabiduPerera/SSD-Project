import jwt from "jsonwebtoken";
import userModel from "../models/User.js";
import crypto from "crypto";
import logger from "../logger.js";  // Import the logger

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
    const { userName, password, role } = req.body;
    const user = await userModel.login(userName, password, role);
    const token = createToken(user._id);
    const csrfToken = createCsrfToken();

    // Set the JWT as a HttpOnly cookie
    res.cookie("token", token, {
      httpOnly: true, // Prevents JavaScript access
      secure: process.env.NODE_ENV === "production", // Only send over HTTPS in production
      sameSite: "Strict", // Prevents CSRF attacks
      maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days in milliseconds
    });

    // Set the CSRF token as a non-HttpOnly cookie
    res.cookie("csrfToken", csrfToken, {
      httpOnly: false, // Must be accessible by JavaScript
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 3 * 24 * 60 * 60 * 1000,
    });

    logger.info(`User logged in successfully: ${userName}`);
    res.status(200).json({ ...user.toObject() });
  } catch (err) {
    logger.error(`Login failed for ${req.body.userName}: ${err.message}`);
    res.status(401).json({ err: err.message });
  }
};

// User sign-up function
const userSignUp = async (req, res) => {
  const { userName, password, contact, address, role, image } = req.body;
  try {
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

    logger.info(`User signed up successfully: ${userName}`);
    res.status(201).json({ ...user.toObject() });
  } catch (err) {
    logger.error(`Signup failed for ${userName}: ${err.message}`);
    res.status(400).json({ err: err.message });
  }
};

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await userModel.find().select("-image");
    logger.info(`Retrieved all users. Count: ${users.length}`);
    res.json({ users, userCount: users.length });
  } catch (err) {
    logger.error(`Error fetching users: ${err.message}`);
    res.send(err.message);
  }
};

// Update user
const updateUser = async (req, res) => {
  const { userId, userName, image } = req.body;
  try {
    const user = await userModel.findOneAndUpdate(
      { _id: userId },
      { userName, image },
      { new: true }
    );
    logger.info(`User updated successfully: ${userId}`);
    return res.json(user);
  } catch (err) {
    logger.error(`Error updating user ${userId}: ${err.message}`);
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const data = await userModel.findByIdAndDelete(req.params.id);
    logger.info(`User deleted: ${req.params.id}`);
    res.json(data);
  } catch (err) {
    logger.error(`Error deleting user ${req.params.id}: ${err.message}`);
    res.send(err.message);
  }
};

// Get one user by ID and role
const getOneUser = async (req, res) => {
  const { id, role } = req.params;
  try {
    const user = await userModel.find({ _id: id, role });
    logger.info(`User found: ${id}`);
    res.status(200).json(user);
  } catch (err) {
    logger.error(`Error fetching user ${id}: ${err.message}`);
  }
};

// Update user's store
const updateUserStore = async (req, res) => {
  const { userID, storeID } = req.body;
  try {
    const updatedUser = await userModel.findOneAndUpdate(
      { _id: userID },
      { storeID }
    );
    logger.info(`User's store updated: ${userID}`);
    res.json(updatedUser);
  } catch (err) {
    logger.error(`Error updating user's store ${userID}: ${err.message}`);
    res.json(err);
  }
};

// Get user count for admin
const getUserCount = async (_, res) => {
  try {
    const data = await userModel.find();
    logger.info(`Total user count: ${data.length}`);
    res.json({ userCount: data.length });
  } catch (err) {
    logger.error(`Error fetching user count: ${err.message}`);
    res.send(err.message);
  }
};

export {
  userLogin,
  userSignUp,
  getAllUsers,
  updateUser,
  getOneUser,
  deleteUser,
  getUserCount,
  updateUserStore,
};

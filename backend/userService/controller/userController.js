import jwt from "jsonwebtoken";
import userModel from "../models/User.js";
import crypto from "crypto";

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

    // Send back user data (without token)
    res.status(200).json({ ...user.toObject() });
  } catch (err) {
    console.log(err.message);
    res.status(401).json({ err: err.message });
  }
};

// Similar changes for sign-up
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
      httpOnly: false, // Accessible to client-side JavaScript
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 3 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({ ...user.toObject() });
  } catch (err) {
    console.log(err.message);
    res.status(400).json({ err: err.message });
  }
};

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await userModel.find().select("-image");
    res.json({ users, userCount: users.length });
  } catch (err) {
    res.send(err.message);
  }
};

// Update user function
const updateUser = async (req, res) => {
  const { userId, userName, image } = req.body;
  try {
    const user = await userModel.findOneAndUpdate(
      { _id: userId },
      { userName, image },
      { new: true }
    );
    return res.json(user);
  } catch (err) {
    console.log(err.message);
  }
};

// Delete user function
const deleteUser = async (req, res) => {
  try {
    const data = await userModel.findByIdAndDelete(req.params.id);
    res.json(data);
  } catch (err) {
    console.log(err.message);
    res.send(err.message);
  }
};

// Get one user by ID and role
const getOneUser = async (req, res) => {
  const { id, role } = req.params;
  try {
    const user = await userModel.find({ _id: id, role });
    res.status(200).json(user);
  } catch (err) {
    console.log(err.message);
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
    res.json(updatedUser);
  } catch (err) {
    console.log(err);
    res.json(err);
  }
};

// Get user count for admin
const getUserCount = async (req, res) => {
  try {
    const data = await userModel.find();
    res.json({ userCount: data.length });
  } catch (err) {
    res.send(err.message);
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
};

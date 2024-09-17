import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import logger from "../logger.js";  // Import the logger

const { Schema } = mongoose;

const userSchema = new Schema({
  userName: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  contact: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  role: {
    type: String,
    required: true,
  },
  storeID: String,
});

// Creating User schema functions
userSchema.statics.signup = async function (
  userName,
  password,
  contact,
  address,
  image,
  role
) {
  try {
    const exist = await this.find({ userName });

    if (!userName || !password || !contact || !address) {
      logger.error("Signup failed: Missing required fields");
      throw Error("Please fill all fields");
    }
    if (!validator.isEmail(userName)) {
      logger.error(`Signup failed: Invalid email (${userName})`);
      throw Error("Email is invalid");
    }
    if (exist.length === 1 && exist[0].role === role) {
      logger.error(`Signup failed: Email ${userName} is already in use`);
      throw Error("Email is already in use");
    }
    if (exist.length > 1) {
      logger.error(`Signup failed: Email ${userName} is already in use`);
      throw Error("Email is already in use");
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const signedUser = await this.create({
      userName,
      password: hash,
      contact,
      address,
      image,
      role,
    });

    logger.info(`User signed up successfully: ${userName}`);
    return signedUser; // To return a signed-up new user object
  } catch (error) {
    logger.error(`Signup error for ${userName}: ${error.message}`);
    throw error;
  }
};

userSchema.statics.login = async function (userName, password, role) {
  try {
    if (!userName || !password) {
      logger.error("Login failed: Missing required fields");
      throw Error("Please fill all fields");
    }

    const user = await this.findOne({ userName, role });
    if (!user) {
      logger.error(`Login failed: User ${userName} doesn't exist`);
      throw Error("User Name doesn't exist");
    }

    const match = await bcrypt.compare(password, user.password); // returns true or false

    if (!match) {
      logger.error(`Login failed: Incorrect password for ${userName}`);
      throw Error("Incorrect Password");
    }

    logger.info(`User logged in successfully: ${userName}`);
    return user;
  } catch (error) {
    logger.error(`Login error for ${userName}: ${error.message}`);
    throw error;
  }
};

// Export the Mongoose model as default export
export default mongoose.model("User", userSchema);

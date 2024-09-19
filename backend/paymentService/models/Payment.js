const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const logger = require("../logger.js"); // Import the logger

const paymentSchema = new Schema({
  amount: {
    type: Number,
    required: [true, "Amount is required"],
    min: [0, "Amount must be a positive number"], // Ensure amount is positive
  },
  itemList: [
    {
      type: mongoose.Schema.Types.ObjectId, // Reference to the Items model
      ref: "Items", // Name of the model being referenced
      required: [true, "Item list cannot be empty"],
      validate: {
        validator: function (v) {
          return v.length > 0; // Ensure itemList contains at least one item
        },
        message: "The item list must contain at least one item",
      },
    },
  ],
  userID: {
    type: mongoose.Schema.Types.ObjectId, // Validate userID as ObjectId
    required: [true, "User ID is required"],
    ref: "User", // Reference to the User model
  },
  status: {
    type: String,
    enum: {
      values: ["Processing", "Pending", "Delivered", "Dispatch"], // Allowed status values
      message: "{VALUE} is not a valid status", // Custom error message for invalid status
    },
    default: "Processing", // Default status
    required: [true, "Status is required"],
  },
  date: {
    type: Date,
    default: Date.now,
    required: [true, "Date is required"],
  },
});

// Middleware to log before saving a payment
paymentSchema.pre("save", function (next) {
  logger.info("Attempting to save payment", { payment: this });
  next();
});

// Middleware to log after saving a payment
paymentSchema.post("save", function (doc) {
  logger.info("Payment saved successfully", { paymentID: doc._id });
});

// Middleware to log errors during save
paymentSchema.post("save", function (error, doc, next) {
  if (error) {
    logger.error("Error occurred while saving payment", { error: error.message });
  }
  next();
});

// Middleware to log before updating a payment
paymentSchema.pre("findOneAndUpdate", function (next) {
  logger.info("Attempting to update payment", { update: this.getUpdate() });
  next();
});

// Middleware to log after updating a payment
paymentSchema.post("findOneAndUpdate", function (doc) {
  logger.info("Payment updated successfully", { paymentID: doc._id });
});

// Middleware to log errors during update
paymentSchema.post("findOneAndUpdate", function (error, doc, next) {
  if (error) {
    logger.error("Error occurred while updating payment", { error: error.message });
  }
  next();
});

// Middleware to log before deleting a payment
paymentSchema.pre("findByIdAndDelete", function (next) {
  logger.info("Attempting to delete payment", { paymentID: this.getQuery()._id });
  next();
});

// Middleware to log after deleting a payment
paymentSchema.post("findByIdAndDelete", function (doc) {
  if (doc) {
    logger.info("Payment deleted successfully", { paymentID: doc._id });
  }
});

// Middleware to log errors during delete
paymentSchema.post("findByIdAndDelete", function (error, doc, next) {
  if (error) {
    logger.error("Error occurred while deleting payment", { error: error.message });
  }
  next();
});

module.exports = mongoose.model("Payment", paymentSchema);

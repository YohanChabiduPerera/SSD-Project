const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const logger = require("../logger.js"); // Importing the logger

const paymentSchema = new Schema({
  amount: {
    type: Number,
    required: true,
  },
  itemList: {
    type: Array,
    default: [],
  },
  userID: { type: String, required: true },
  status: {
    type: String,
    default: "Processing",
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
    required: true,
  },
});

// Middleware to log when a payment is created (saved)
paymentSchema.pre("save", function (next) {
  logger.info("Creating a new payment", {
    amount: this.amount,
    userID: this.userID,
    status: this.status,
  });
  next();
});

// Middleware to log when a payment is updated
paymentSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();
  logger.info("Updating payment", { update });
  next();
});

// Middleware to log after a payment is updated
paymentSchema.post("findOneAndUpdate", function (result) {
  if (result) {
    logger.info("Payment updated successfully", { paymentID: result._id });
  }
});

// Middleware to log when a payment is deleted
paymentSchema.pre("findOneAndDelete", function (next) {
  logger.info("Deleting payment", { paymentID: this._conditions._id });
  next();
});

// Middleware to log after a payment is deleted
paymentSchema.post("findOneAndDelete", function (result) {
  if (result) {
    logger.info("Payment deleted successfully", { paymentID: result._id });
  }
});

module.exports = mongoose.model("Payment", paymentSchema);

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

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

module.exports = mongoose.model("Payment", paymentSchema);

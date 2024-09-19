const Payment = require("../models/Payment");
const mongoose = require("mongoose");
const logger = require("../logger.js");

// This function creates a new payment and saves it to the database
const createPayment = async (req, res) => {
  const { amount, itemList, userID } = req.body;

  logger.info("Creating a new payment", { userID, amount });

  const newPayment = new Payment({
    amount,
    itemList,
    userID,
  });

  try {
    const data = await newPayment.save();
    logger.info("Payment created successfully", { paymentID: data._id });
    res.status(201).json(data); // 201 status code for successful creation
  } catch (err) {
    logger.error("Error creating payment", { error: err.message });
    if (err.name === "ValidationError") {
      res.status(400).json({ error: err.message }); // Return validation errors
    } else {
      res.status(500).json({ error: err.message });
    }
  }
};

// This function retrieves all payments from the database
const getAllPayment = async (req, res) => {
  logger.info("Retrieving all payments");

  try {
    const payments = await Payment.find().populate("itemList"); // Populate item details
    logger.info("Payments retrieved successfully", { count: payments.length });
    res.status(200).json(payments);
  } catch (err) {
    logger.error("Error retrieving payments", { error: err.message });
    res.status(500).json({ error: err.message });
  }
};

// This function updates a payment's status
const updatePayment = async (req, res) => {
  const { paymentID, status } = req.body;

  logger.info("Updating payment", { paymentID, status });

  if (!mongoose.Types.ObjectId.isValid(paymentID)) {
    logger.warn("Invalid payment ID", { paymentID });
    return res.status(400).json({ error: "Invalid payment ID" });
  }

  try {
    const updatedPayment = await Payment.findOneAndUpdate(
      { _id: paymentID },
      { status },
      { new: true, runValidators: true } // Apply validators during the update
    );

    if (!updatedPayment) {
      logger.warn("Payment not found", { paymentID });
      return res.status(404).json({ error: "Payment not found" });
    }

    logger.info("Payment updated successfully", { paymentID });
    res.status(200).json(updatedPayment);
  } catch (err) {
    logger.error("Error updating payment", { paymentID, error: err.message });
    res.status(500).json({ error: err.message });
  }
};

// This function deletes a payment from the database
const deletePayment = async (req, res) => {
  const { paymentID } = req.body;

  logger.info("Deleting payment", { paymentID });

  if (!mongoose.Types.ObjectId.isValid(paymentID)) {
    logger.warn("Invalid payment ID", { paymentID });
    return res.status(400).json({ error: "Invalid payment ID" });
  }

  try {
    const deletedPayment = await Payment.findByIdAndDelete(paymentID);

    if (!deletedPayment) {
      logger.warn("Payment not found", { paymentID });
      return res.status(404).json({ error: "Payment not found" });
    }

    logger.info("Payment deleted successfully", { paymentID });
    res.status(200).json({ status: "Payment deleted" });
  } catch (err) {
    logger.error("Error deleting payment", { paymentID, error: err.message });
    res.status(500).json({ error: err.message });
  }
};

// This function calculates the total payment amount for a particular store and the number of orders
const getTotalPaymentPerStore = async (req, res) => {
  const storeID = req.params.id;

  logger.info("Calculating total payment for store", { storeID });

  if (!mongoose.Types.ObjectId.isValid(storeID)) {
    logger.warn("Invalid store ID", { storeID });
    return res.status(400).json({ error: "Invalid store ID" });
  }

  try {
    const results = await Payment.aggregate([
      { $unwind: "$itemList" },
      {
        $lookup: {
          from: "items", // Items collection
          localField: "itemList",
          foreignField: "_id",
          as: "itemDetails",
        },
      },
      { $unwind: "$itemDetails" },
      { $match: { "itemDetails.storeID": storeID } },
      {
        $group: {
          _id: null,
          totalAmount: {
            $sum: {
              $multiply: ["$itemDetails.price", "$itemDetails.quantity"],
            },
          },
          orderCount: { $sum: 1 },
        },
      },
    ]);

    if (!results || results.length === 0) {
      logger.warn("No payments found for store", { storeID });
      return res.status(404).json({ total: 0, orderCount: 0 });
    }

    const { totalAmount, orderCount } = results[0];
    logger.info("Total payment calculated successfully", { storeID, totalAmount, orderCount });
    res.status(200).json({ total: totalAmount, orderCount });
  } catch (err) {
    logger.error("Error calculating total payment for store", { storeID, error: err.message });
    res.status(500).json({ error: err.message });
  }
};

// This function retrieves total payments for admin
const getTotalPaymentForAdmin = async (req, res) => {
  logger.info("Calculating total payment for admin");

  try {
    const result = await Payment.aggregate([
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
        },
      },
      {
        $project: {
          _id: 0,
          amountForStore: { $multiply: ["$totalAmount", 0.15] },
        },
      },
    ]);

    if (!result || result.length === 0) {
      logger.warn("No payment data available for admin");
      return res.status(404).json({ error: "No payment data available for admin" });
    }

    logger.info("Total payment for admin calculated", { totalAmount: result[0].totalAmount });
    res.status(200).json(result[0]);
  } catch (err) {
    logger.error("Error calculating total payment for admin", { error: err.message });
    res.status(500).json({ error: err.message });
  }
};

// Exporting the functions to be used in other modules
module.exports = {
  createPayment,
  getAllPayment,
  updatePayment,
  deletePayment,
  getTotalPaymentPerStore,
  getTotalPaymentForAdmin,
};

// Importing the Payment model
const Payment = require("../models/Payment");
const mongoose = require("mongoose");

// Create a new payment
const createPayment = async (req, res) => {
  const { amount, itemList, userID, storeID } = req.body;

  const newPayment = new Payment({
    amount: Number(amount),
    itemList,
    userID,
    storeID,
  });

  try {
    const data = await newPayment.save();
    res.json(data);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// Get all payments
const getAllPayment = async (req, res) => {
  try {
    const payments = await Payment.find();
    res.json(payments);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// Update payment status
const updatePayment = async (req, res) => {
  const { paymentID, status } = req.body;

  try {
    const updatedPayment = await Payment.findOneAndUpdate(
      { _id: paymentID },
      { status },
      { new: true }
    );
    if (!updatedPayment) return res.status(404).send("Payment not found");
    res.json(updatedPayment);
  } catch (err) {
    res.status(500).send({ status: "Error updating data", error: err.message });
  }
};

// Delete a payment
const deletePayment = async (req, res) => {
  const { paymentID } = req.body;

  try {
    const deletedPayment = await Payment.findByIdAndDelete(paymentID);
    if (!deletedPayment) return res.status(404).send("Payment not found");
    res.status(200).send({ status: "Payment Deleted" });
  } catch (err) {
    res
      .status(500)
      .send({ status: "Error deleting payment", error: err.message });
  }
};

const getTotalPaymentPerStore = async (req, res) => {
  const storeID = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(storeID)) {
    return res.status(400).json({ error: "Invalid store ID" });
  }

  try {
    const results = await Payment.aggregate([
      { $unwind: "$itemList" },
      { $match: { "itemList.storeID": storeID } }, // Match items by store ID
      {
        $group: {
          _id: "$_id", // Group by the payment/order ID to get unique orders
          totalAmount: {
            $sum: {
              $multiply: ["$itemList.itemPrice", "$itemList.itemQuantity"],
            },
          },
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$totalAmount" },
          orderCount: { $addToSet: "$_id" }, // Use $addToSet to ensure unique order IDs
        },
      },
      {
        $project: {
          totalAmount: 1,
          orderCount: { $size: "$orderCount" }, // Count the number of unique orders
        },
      },
    ]);

    if (results.length > 0) {
      const { totalAmount, orderCount } = results[0];
      res.json({ total: totalAmount, orderCount });
    } else {
      res.json({ total: 0, orderCount: 0 });
    }
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

// Update payment status (simplified)
const updatePaymentStatus = async (req, res) => {
  const { paymentID, status } = req.body;

  try {
    const data = await Payment.findByIdAndUpdate(
      paymentID,
      { status },
      { new: true }
    );
    if (!data) return res.status(404).send("Payment not found");
    res.json(data);
  } catch (err) {
    res
      .status(500)
      .send({ error: "Error updating payment", details: err.message });
  }
};

// Calculate total payment for admin (store commission)
const getTotalPaymentForAdmin = async (req, res) => {
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
          amountForStore: { $multiply: ["$totalAmount", 0.15] }, // Admin commission of 15%
        },
      },
    ]);

    res.json(result[0] || { amountForStore: 0 }); // Return result or default value
  } catch (err) {
    res
      .status(500)
      .send({ error: "Error calculating admin total", details: err.message });
  }
};

// Exporting the functions to be used in other modules
module.exports = {
  createPayment,
  getAllPayment,
  updatePayment,
  deletePayment,
  getTotalPaymentPerStore,
  updatePaymentStatus,
  getTotalPaymentForAdmin,
};

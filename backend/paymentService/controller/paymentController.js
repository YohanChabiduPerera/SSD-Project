let Payment = require("../models/Payment");
const mongoose = require("mongoose"); // Ensure mongoose is imported

// This function retrieves all payments from the database
const getAllPayment = async (req, res) => {
  try {
    const payments = await Payment.find();
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// This function creates a new payment and saves it to the database
const createPayment = async (req, res) => {
  const amount = Number(req.body.amount);
  const { itemList, userID, storeID } = req.body;

  // Input validation for amount, userID, storeID (ensure no invalid data is passed)
  if (
    isNaN(amount) ||
    !Array.isArray(itemList) ||
    !mongoose.Types.ObjectId.isValid(userID) ||
    !mongoose.Types.ObjectId.isValid(storeID)
  ) {
    return res.status(400).json({ error: "Invalid input data" });
  }

  // Optional: Add further validation for itemList structure
  if (
    !itemList.every(
      (item) =>
        typeof item.itemPrice === "number" &&
        typeof item.itemQuantity === "number"
    )
  ) {
    return res.status(400).json({ error: "Invalid itemList structure" });
  }

  const newPayment = new Payment({ amount, itemList, userID, storeID });

  try {
    const data = await newPayment.save();
    res.status(201).json(data); // Use 201 status code for successful creation
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updatePayment = async (req, res) => {
  const { paymentID, status } = req.body;

  if (!mongoose.Types.ObjectId.isValid(paymentID)) {
    return res.status(400).json({ error: "Invalid payment ID" });
  }

  try {
    const updatedPayment = await Payment.findOneAndUpdate(
      { _id: paymentID },
      { status },
      { new: true }
    );

    if (!updatedPayment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    res.status(200).json(updatedPayment);
  } catch (err) {
    res.status(500).json({ error: "Error updating payment" });
  }
};

const deletePayment = async (req, res) => {
  const { paymentID } = req.body;

  if (!mongoose.Types.ObjectId.isValid(paymentID)) {
    return res.status(400).json({ error: "Invalid payment ID" });
  }

  try {
    const deletedPayment = await Payment.findByIdAndDelete(paymentID);

    if (!deletedPayment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    res.status(200).json({ status: "Payment deleted" });
  } catch (err) {
    res.status(500).json({ error: "Error deleting payment" });
  }
};

const getTotalPaymentPerStore = async (req, res) => {
  const storeID = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(storeID)) {
    return res.status(400).json({ error: "Invalid store ID" });
  }

  try {
    const results = await Payment.aggregate([
      { $match: { "itemList.storeID": storeID } },
      { $unwind: "$itemList" },
      { $match: { "itemList.storeID": storeID } },
      {
        $group: {
          _id: "$_id",
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
          orderCount: { $sum: 1 },
        },
      },
    ]);

    if (!results || results.length === 0) {
      return res.status(404).json({ total: 0, orderCount: 0 });
    }

    const { totalAmount, orderCount } = results[0];
    res.json({ total: totalAmount, orderCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updatePaymentStatus = async (req, res) => {
  const { paymentID, status } = req.body;

  if (!mongoose.Types.ObjectId.isValid(paymentID)) {
    return res.status(400).json({ error: "Invalid payment ID" });
  }

  try {
    const updatedPayment = await Payment.findByIdAndUpdate(
      paymentID,
      { status },
      { new: true }
    );

    if (!updatedPayment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    res.json(updatedPayment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

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
          amountForStore: { $multiply: ["$totalAmount", 0.15] },
        },
      },
    ]);

    if (!result || result.length === 0) {
      return res.status(404).json({ error: "No data available" });
    }

    res.json(result[0]);
  } catch (err) {
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
  updatePaymentStatus,
  getTotalPaymentForAdmin,
};

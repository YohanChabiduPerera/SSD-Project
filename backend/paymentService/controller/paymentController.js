// Importing the Payment model and logger
let Payment = require("../models/Payment");
let logger = require("../logger.js");

// This function creates a new payment and saves it to the database
const createPayment = async (req, res) => {
  const amount = Number(req.body.amount);
  const { itemList, userID, storeID } = req.body;

  logger.info("Creating a new payment", { userID, storeID, amount });

  // Creating a new payment object
  const newPayment = new Payment({
    amount,
    itemList,
    userID,
    storeID,
  });

  try {
    const data = await newPayment.save();
    logger.info("Payment created successfully", { paymentID: data._id });
    res.json(data);
  } catch (err) {
    logger.error("Error creating payment", { error: err.message });
    res.send(err.message);
  }
};

// This function retrieves all payments from the database
const getAllPayment = async (req, res) => {
  logger.info("Retrieving all payments");

  await Payment.find()
    .then((payment) => {
      logger.info("Payments retrieved successfully", { count: payment.length });
      res.json(payment);
    })
    .catch((err) => {
      logger.error("Error retrieving payments", { error: err.message });
      res.send(err.message);
    });
};

// This function updates a payment's status
const updatePayment = async (req, res) => {
  const { paymentID, status } = req.body;
  logger.info("Updating payment", { paymentID, status });

  try {
    const update = await Payment.findOneAndUpdate(
      { _id: paymentID },
      { status },
      { new: true }
    );
    logger.info("Payment updated successfully", { paymentID });
    res.status(200).json(update);
  } catch (err) {
    logger.error("Error updating payment", { paymentID, error: err.message });
    res.status(500).send({ status: "Error updating data" });
  }
};

// This function deletes a payment from the database
const deletePayment = async (req, res) => {
  const { paymentID } = req.body;
  logger.info("Deleting payment", { paymentID });

  try {
    await Payment.findByIdAndDelete(paymentID);
    logger.info("Payment deleted successfully", { paymentID });
    res.status(200).send({ status: "Payment Deleted" });
  } catch (err) {
    logger.error("Error deleting payment", { paymentID, error: err.message });
    res.status(500).send({ status: "Error...." });
  }
};

// This function calculates the total payment amount for a particular store and the number of orders
const getTotalPaymentPerStore = async (req, res) => {
  const storeID = req.params.id;
  logger.info("Calculating total payment for store", { storeID });

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

    if (results.length > 0) {
      const { totalAmount, orderCount } = results[0];
      logger.info("Total payment calculated successfully", { storeID, totalAmount, orderCount });
      res.send({ total: totalAmount, orderCount });
    } else {
      logger.warn("No payments found for store", { storeID });
      res.send({ total: 0, orderCount: 0 });
    }
  } catch (err) {
    logger.error("Error calculating total payment for store", { storeID, error: err.message });
    res.json(err.message);
  }
};

const updatePaymentStatus = async (req, res) => {
  const { paymentID, status } = req.body;
  logger.info("Updating payment status", { paymentID, status });

  try {
    const data = await Payment.findByIdAndUpdate(
      paymentID,
      { status },
      { new: true }
    );
    logger.info("Payment status updated successfully", { paymentID });
    res.json(data);
  } catch (err) {
    logger.error("Error updating payment status", { paymentID, error: err.message });
    res.send(err.message);
  }
};

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

    logger.info("Total payment for admin calculated", { totalAmount: result[0].totalAmount });
    res.json(result[0]);
  } catch (err) {
    logger.error("Error calculating total payment for admin", { error: err.message });
    res.send(err.message);
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

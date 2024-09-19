let Order = require("../models/Order");
let logger = require("../logger.js"); // Import the logger

// Create a new order
const createOrder = async (req, res) => {
  const { userID, storeID, paymentID, itemList } = req.body;
  logger.info("Creating a new order", { userID, storeID, paymentID });


  const newOrder = new Order({
    userID,
    paymentID,
    storeID,
    itemList,
  });

  try {
    const data = await newOrder.save(); // Save the new order to the database
    logger.info("Order created successfully", { orderID: data._id });
    res.json(data); // Send a JSON response containing the newly created order data
  } catch (err) {
    logger.error("Error creating order", { error: err.message });
    res.json(err.message); // Send a JSON response with the error message if there was an error saving the order
  }
};

// Get all orders
const getAllOrder = async (req, res) => {
  logger.info("Fetching all orders");

  try {
    const data = await Order.find(); // Find all orders in the database
    logger.info("All orders retrieved successfully", { count: data.length });
    res.json(data); // Send a JSON response containing all the orders
  } catch (err) {
    logger.error("Error fetching all orders", { error: err.message });
    res.send(err.message); // Send a response with the error message if there was an error getting the orders
  }
};

// Update an order
const updateOrder = async (req, res) => {
  const { orderID, status } = req.body;

  logger.info("Updating order", { orderID, status });

  try {
    const updateStore = { status };
    const update = await Order.findByIdAndUpdate(orderID, updateStore, {
      new: true,
    }); // Find the order by ID and update its status
    logger.info("Order updated successfully", { orderID });
    res.status(200).send({ Status: "Order updated", order: update }); // Send a success response with the updated order data
  } catch (err) {
    logger.error("Error updating order", { orderID, error: err.message });
    res.status(500).send({ status: "Error with updating data" }); // Send an error response if there was an error updating the order
  }
};

// Get a single order by ID
const getOneOrder = async (req, res) => {
  logger.info("Fetching order by ID", { orderID: req.params.id });

  try {
    const order = await Order.findById(req.params.id); // Find the order by ID
    logger.info("Order retrieved successfully", { orderID: req.params.id });
    res.status(200).send(order); // Send a JSON response with the order data
  } catch (err) {
    logger.error("Error fetching order", { orderID: req.params.id, error: err.message });
    res
      .status(500)
      .send({ status: "Error Fetching Order", error: err.message }); // Send an error response if there was an error getting the order
  }
};

// Get all orders for a specific store
const getAllOrderPerStore = async (req, res) => {
  logger.info("Fetching all orders for store", { storeID: req.params.id });

  try {
    // Find all orders for the specified store, excluding the itemImage field
    const orders = await Order.find({ storeID: req.params.id }).select(
      "-itemList.itemImage"
    );

    const result = orders.map((order) => ({
      ...order.toObject(),
      totalAmount: order.itemList.reduce(
        (total, item) => total + item.itemPrice * item.itemQuantity,
        0
      ),
    }));

    logger.info("Orders retrieved successfully for store", { storeID: req.params.id });
    res.json(result); // Send a JSON response containing all the orders for the specified store
  } catch (error) {
    logger.error("Error fetching orders for store", { storeID: req.params.id, error: error.message });
    res.status(500).json({ error: "Failed to get orders for store" }); // Send an error response if there was an error getting the orders for the store
  }
};

// Update the order status
const updateOrderStatus = async (req, res) => {
  const { orderID, status } = req.body;

  logger.info("Updating order status", { orderID, status });

  try {
    const data = await Order.findByIdAndUpdate(
      orderID,
      { status },
      { new: true }
    );
    logger.info("Order status updated successfully", { orderID });
    res.json(data);
  } catch (err) {
    logger.error("Error updating order status", { orderID, error: err.message });
    res.send(err.message);
  }
};

// Get the count of all orders for the admin dashboard
const getOrderCountForAdmin = async (req, res) => {
  logger.info("Fetching order count for admin");

  try {
    const orderCount = await Order.countDocuments();
    logger.info("Order count retrieved successfully", { count: orderCount });
    res.json({ orderCount });
  } catch (err) {
    logger.error("Error fetching order count for admin", { error: err.message });
    res.send(err.message);
  }
};

// Get all orders for all stores
const getAllStoreOrders = async (req, res) => {
  logger.info("Fetching all orders for all stores");

  try {
    const data = await Order.find().select("-itemList.itemImage"); // Get all orders from MongoDB database using Mongoose, excluding the itemImage field
    logger.info("All store orders retrieved successfully", { count: data.length });
    res.json(data); // Send orders in response
  } catch (err) {
    logger.error("Error fetching all store orders", { error: err.message });
    res.send(err.message);
  }
};

// Get all orders for a particular user
const getAllUserOrders = async (req, res) => {
  logger.info("Fetching all orders for user", { userID: req.params.id });

  try {
    const data = await Order.find({ userID: req.params.id });
    logger.info("Orders retrieved successfully for user", { userID: req.params.id, count: data.length });
    res.json(data);
  } catch (err) {
    logger.error("Error fetching user orders", { userID: req.params.id, error: err.message });
    res.send(err.message);
  }
};

// Set the reviewed status of an order
const setReviewStatus = async (req, res) => {
  logger.info("Setting review status for order", { orderID: req.params.id });

  try {
    const data = await Order.findByIdAndUpdate(req.params.id, {
      reviewed: true,
    });
    logger.info("Review status set successfully for order", { orderID: req.params.id });
    res.json(data);
  } catch (err) {
    logger.error("Error setting review status for order", { orderID: req.params.id, error: err.message });
    res.send(err.message);
  }
};

module.exports = {
  createOrder,
  getAllOrder,
  updateOrder,
  getOneOrder,
  getAllUserOrders,
  getAllStoreOrders,
  getAllOrderPerStore,
  updateOrderStatus,
  setReviewStatus,
  getOrderCountForAdmin,
};

const Order = require("../models/Order");
const logger = require("../logger"); // Import logger

// Create a new order
const createOrder = async (req, res) => {
  const { userID, storeID, paymentID, address, itemList } = req.body;

  const newOrder = new Order({
    userID,
    paymentID,
    address,
    storeID,
    itemList,
  });

  try {
    const data = await newOrder.save();
    logger.info("Order created successfully", { orderID: data._id, userID });
    res.json(data);
  } catch (err) {
    logger.error("Error creating order", { error: err.message, userID });
    res.json(err.message);
  }
};

// Get all orders
const getAllOrder = async (req, res) => {
  try {
    const data = await Order.find();
    logger.info("Fetched all orders successfully");
    res.json(data);
  } catch (err) {
    logger.error("Error fetching orders", { error: err.message });
    res.send(err.message);
  }
};

// Update an order
const updateOrder = async (req, res) => {
  const { orderID, status } = req.body;

  try {
    const updatedOrder = await Order.findByIdAndUpdate(orderID, { status }, { new: true });
    logger.info("Order updated successfully", { orderID, status });
    res.status(200).send({ Status: "Order updated", order: updatedOrder });
  } catch (err) {
    logger.error("Error updating order", { orderID, error: err.message });
    res.status(500).send({ status: "Error with updating data" });
  }
};

// Get a single order by ID
const getOneOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    logger.info("Fetched order successfully", { orderID: req.params.id });
    res.status(200).send(order);
  } catch (err) {
    logger.error("Error fetching order", { orderID: req.params.id, error: err.message });
    res.status(500).send({ status: "Error Fetching Order", error: err.message });
  }
};

// Get all orders for a specific store
const getAllOrderPerStore = async (req, res) => {
  try {
    const orders = await Order.find({ storeID: req.params.id }).select("-itemList.itemImage");
    const result = orders.map((order) => ({
      ...order.toObject(),
      totalAmount: order.itemList.reduce(
        (total, item) => total + item.itemPrice * item.itemQuantity,
        0
      ),
    }));
    logger.info("Fetched orders for store successfully", { storeID: req.params.id });
    res.json(result);
  } catch (error) {
    logger.error("Error fetching orders for store", { storeID: req.params.id, error: error.message });
    res.status(500).json({ error: "Failed to get orders for store" });
  }
};

// Update the status of an order
const updateOrderStatus = async (req, res) => {
  const { orderID, status } = req.body;

  try {
    const data = await Order.findByIdAndUpdate(orderID, { status }, { new: true });
    logger.info("Order status updated", { orderID, status });
    res.json(data);
  } catch (err) {
    logger.error("Error updating order status", { orderID, error: err.message });
    res.send(err.message);
  }
};

// Get order count for admin dashboard
const getOrderCountForAdmin = async (req, res) => {
  try {
    const orderCount = await Order.countDocuments();
    logger.info("Fetched order count for admin", { orderCount });
    res.json({ orderCount });
  } catch (err) {
    logger.error("Error fetching order count", { error: err.message });
    res.send(err.message);
  }
};

// Get all orders for all stores
const getAllStoreOrders = async (req, res) => {
  try {
    const data = await Order.find().select("-itemList.itemImage");
    logger.info("Fetched all store orders successfully");
    res.json(data);
  } catch (err) {
    logger.error("Error fetching all store orders", { error: err.message });
    res.send(err.message);
  }
};

// Get all orders for a particular user
const getAllUserOrders = async (req, res) => {
  try {
    const data = await Order.find({ userID: req.params.id });
    logger.info("Fetched all orders for user", { userID: req.params.id });
    res.json(data);
  } catch (err) {
    logger.error("Error fetching orders for user", { userID: req.params.id, error: err.message });
    res.send(err.message);
  }
};

// Set reviewed status of an order
const setReviewStatus = async (req, res) => {
  try {
    const data = await Order.findByIdAndUpdate(req.params.id, { reviewed: true });
    logger.info("Order review status updated", { orderID: req.params.id });
    res.json(data);
  } catch (err) {
    logger.error("Error updating review status", { orderID: req.params.id, error: err.message });
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

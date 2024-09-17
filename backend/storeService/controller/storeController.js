// Importing Store model
let Store = require("../models/Store");
let logger = require('../logger');

// Creating a new store in the database
const createStore = async (req, res) => {
  const { storeName, location, merchantID } = req.body;

  // Creating a new Store object with the provided data
  const newStore = new Store({
    storeName,
    merchantID,
    location,
  });

  // Saving the new store to the database
  await newStore
    .save()
    .then(() => {
      logger.info(`Store created successfully: ${newStore}`);
      // Sending the newly created store object as response
      res.json(newStore);
    })
    .catch((err) => {
      // If there is an error, logging the error message and sending it as response
      logger.error(`Error creating store: ${err.message}`);
      res.send(err.message);
    });
};

// Getting all stores from the database
const getAllStore = async (req, res) => {
  await Store.find()
    .then((store) => {
      logger.info('All stores retrieved successfully.');
      // Sending all store objects as response
      res.json(store);
    })
    .catch((err) => {
      logger.error(`Error retrieving stores: ${err.message}`);
      // If there is an error, sending the error message as response
      res.send(err.message);
    });
};

// Updating basic store info details
const updateStore = async (req, res) => {
  const { storeName, location, storeID } = req.body;

  // Creating an object with the updated values
  const updateStore = {
    storeName,
    location,
  };

  try {
    // Finding the store by the given ID and updating the store details with the new values
    const updatedStore = await Store.findOneAndUpdate(
      { _id: storeID },
      updateStore,
      { new: true }
    );
    logger.info(`Store updated successfully: ${updatedStore}`);
    // Sending the updated store object as response
    res.send(updatedStore);
  } catch (err) {
    logger.error(`Error updating store: ${err.message}`);
    // If there is an error, sending the error message as response
    res.send(err.message);
  }
};

// Deleting a store from the database
const deleteStore = async (req, res) => {
  try {
    // Finding the store by the given ID and deleting it from the database
    const data = await Store.findByIdAndDelete(req.params.id);
    logger.info(`Store deleted successfully: ${data}`);
    // Sending the deleted store object as response
    res.json(data);
  } catch (err) {
    logger.error(`Error deleting store: ${err.message}`);
    // If there is an error, sending the error message as response
    res.send(err.message);
  }
};

// Getting a store by ID
const getOneStore = async (req, res) => {
  const id = req.params.id;

  try {
    // Finding the store by the given ID, excluding the image field
    const data = await Store.findById(id).select("-storeItem.image");
    logger.info(`Store retrieved by ID: ${data}`);
    res.json(data);
  } catch (err) {
    logger.error(`Error retrieving store by ID: ${err.message}`);
    // If there is an error, sending the error message as response
    res.send(err.message);
  }
};

// Getting the description of a store by ID
const getStoreDescription = async (req, res) => {
  try {
    // Finding the store by the given ID and selecting the 'description' field
    const data = await Store.findById(req.params.id, { description });
    logger.info(`Store description retrieved successfully: ${data}`);
    // Sending the store's description as response
    res.json(data);
  } catch (err) {
    logger.error(`Error retrieving store description: ${err.message}`);
    // If there is an error, sending the error message as response
    res.send(err.message);
  }
};

// Get the item count from the store
const getStoreItemCount = async (req, res) => {
  const storeID = req.params.id;

  try {
    // Find the store with the specified ID, excluding the itemImage field
    const data = await Store.findOne({ _id: storeID }).select(
      "-storeItem.itemImage"
    );

    logger.info(`Store item count retrieved successfully: ${data.storeItem.length}`);
    res.json({ itemCount: data.storeItem.length });
  } catch (err) {
    logger.error(`Error retrieving store item count: ${err.message}`);
    res.send(err.message);
  }
};

// Add items to store
const addStoreItem = async (req, res) => {
  const { item, storeID } = req.body;

  try {
    const store = await Store.findOne({ _id: storeID });

    var itemArray = store.storeItem;

    itemArray.push(item);

    const updatedStore = await Store.findOneAndUpdate(
      { _id: storeID },
      { storeItem: itemArray },
      { new: true }
    );

    logger.info(`Item added to store successfully: ${updatedStore}`);
    res.send(updatedStore);
  } catch (err) {
    logger.error(`Error adding item to store: ${err.message}`);
    res.send(err.message);
  }
};

// Modify the items in the store
const modifyStoreItem = async (req, res) => {
  const { item, storeID } = req.body;

  try {
    const store = await Store.findOne({ _id: storeID });

    var itemArray = store.storeItem;

    var itemArray = itemArray.map((itm) => {
      if (itm._id === item._id) {
        // Replace elements in itm with elements from item
        return Object.assign({}, itm, item);
      } else {
        // Return original object
        return itm;
      }
    });

    const updatedStore = await Store.findOneAndUpdate(
      { _id: storeID },
      { storeItem: itemArray },
      { new: true }
    );

    logger.info(`Store item modified successfully: ${updatedStore}`);
    res.send(updatedStore);
  } catch (err) {
    logger.error(`Error modifying store item: ${err.message}`);
    res.send(err.message);
  }
};

// Delete item from store
const deleteStoreItem = async (req, res) => {
  const { storeID, itemID } = req.body;

  try {
    const store = await Store.findOne({ _id: storeID });

    const itemArray = store.storeItem;

    var newArray = itemArray.filter((itm) => itm._id !== itemID);

    const updatedStore = await Store.findOneAndUpdate(
      { _id: storeID },
      { storeItem: newArray },
      { new: true }
    );

    logger.info(`Item deleted from store successfully: ${updatedStore}`);
    res.send(updatedStore);
  } catch (err) {
    logger.error(`Error deleting item from store: ${err.message}`);
    res.send(err.message);
  }
};

// Add store review
const addReview = async (req, res) => {
  // To this data is just passed through the body (all of them)
  const { review, storeID, userID, userName, rating } = req.body; //_id is userID

  try {
    const insertReview = async (callback) => {
      const store = await Store.findOne({ _id: storeID });
      if (store) await callback(store.reviews); //item.reviews is an array
    };

    await insertReview(callBack);

    async function callBack(descArr) {
      //an array is passed in the parameter

      descArr.push({ userID, userName, rating, review });

      const data = await Store.findOneAndUpdate(
        { _id: storeID },
        { reviews: descArr }
      );
      logger.info(`Review added successfully: ${data}`);
      res.json(data);
    }
  } catch (err) {
    logger.error(`Error adding review: ${err.message}`);
    res.json(err.message);
  }
};

// Exporting necessary functions to be used in the route file
module.exports = {
  createStore,
  getAllStore,
  updateStore,
  addReview,
  deleteStore,
  getOneStore,
  getStoreItemCount,
  addStoreItem,
  deleteStoreItem,
  modifyStoreItem,
};

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const logger = require("../logger"); // Import logger

const itemsSchema = new Schema({
  itemName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  storeID: {
    type: String,
    required: true,
  },
  storeName: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  discount: {
    type: Number,
    required: true,
  },
  reviews: {
    type: Array,
    default: [],
  },
});

// Pre-save middleware to log before an item is saved
itemsSchema.pre("save", function (next) {
  logger.info("A new item is being saved", {
    itemName: this.itemName,
    storeID: this.storeID,
  });
  next();
});

// Post-save middleware to log after an item is saved
itemsSchema.post("save", function (doc) {
  logger.info("Item saved successfully", {
    itemID: doc._id,
    itemName: doc.itemName,
    storeID: doc.storeID,
  });
});

// Pre-remove middleware to log before an item is removed
itemsSchema.pre("remove", function (next) {
  logger.info("An item is being removed", {
    itemID: this._id,
    itemName: this.itemName,
  });
  next();
});

// Post-remove middleware to log after an item is removed
itemsSchema.post("remove", function (doc) {
  logger.info("Item removed successfully", {
    itemID: doc._id,
    itemName: doc.itemName,
  });
});

// Pre-update middleware to log before an item is updated
itemsSchema.pre("findOneAndUpdate", function (next) {
  logger.info("An item is being updated", {
    query: this.getQuery(),
    update: this.getUpdate(),
  });
  next();
});

// Post-update middleware to log after an item is updated
itemsSchema.post("findOneAndUpdate", function (doc) {
  logger.info("Item updated successfully", {
    itemID: doc._id,
    itemName: doc.itemName,
  });
});

module.exports = mongoose.model("Items", itemsSchema);

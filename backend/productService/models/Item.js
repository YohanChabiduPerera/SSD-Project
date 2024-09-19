const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const itemsSchema = new Schema({
  itemName: {
    type: String,
    required: [true, "Item name is required"],
    minlength: [3, "Item name must be at least 3 characters long"],
    maxlength: [100, "Item name cannot exceed 100 characters"],
    trim: true, // Trims whitespace from the input
  },
  description: {
    type: String,
    required: [true, "Description is required"],
    minlength: [4, "Description must be at least 10 characters long"],
    maxlength: [500, "Description cannot exceed 500 characters"],
    trim: true,
  },
  image: {
    type: String,
    required: [true, "Image is required"],
  },
  storeID: {
    type: mongoose.Schema.Types.ObjectId, // StoreID should ideally be an ObjectId referring to the Store model
    required: [true, "Store ID is required"],
  },
  storeName: {
    type: String,
    required: [true, "Store name is required"],
  },
  price: {
    type: Number,
    required: [true, "Price is required"],
    min: [0, "Price must be a positive number"],
  },
  totalPrice: {
    type: Number,
    required: [true, "Total price is required"],
    min: [0, "Total price must be a positive number"],
    validate: {
      validator: function (v) {
        return v >= this.price; // Total price should not be less than the price
      },
      message: "Total price cannot be less than the item price",
    },
  },
  quantity: {
    type: Number,
    required: [true, "Quantity is required"],
    min: [1, "Quantity must be at least 1"],
  },
  discount: {
    type: Number,
    required: [true, "Discount is required"],
    min: [0, "Discount must be a positive number"],
    max: [100, "Discount cannot exceed 100%"],
  },
  reviews: {
    type: Array,
    default: [],
    validate: {
      validator: function (arr) {
        return arr.every(
          (review) =>
            typeof review === "object" &&
            review.rating >= 0 &&
            review.rating <= 5
        ); // Check that all reviews have ratings between 0 and 5
      },
      message: "All reviews must have a rating between 0 and 5",
    },
  },
});

module.exports = mongoose.model("Items", itemsSchema);

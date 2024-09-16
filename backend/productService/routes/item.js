const router = require("express").Router();
const requireAuth = require("../middleware/requireAuth");

const {
  postItem,
  addReview,
  getAllItems,
  modifyReview,
  deleteReview,
  updateItem,
  getOneItem,
  deleteItem,
  deleteAllItemsFromStore,
  getAllItemsWithPagination,
} = require("../controller/itemController");

// Route for getting all items
router.get("/", getAllItems);

// Route for getting a specific item by ID
router.get("/findOne", getOneItem);

// This will now handle pagination (page and limit)
router.get("/pagination", getAllItemsWithPagination);

// Use the middleware function to ensure access control
router.use(requireAuth);

// Route for adding a new item
router.post("/addItem", postItem);

// Route for adding a new review to an item
router.patch("/addReview", addReview);

// Route for modifying an existing review for an item
router.patch("/modifyReview", modifyReview);

// Route for deleting a review for an item
router.patch("/deleteReview", deleteReview);

// Route for deleting an item
router.delete("/deleteItem/:id", deleteItem);

// Route for updating an item
router.patch("/updateItem", updateItem);

// Route for deleting all items for a specific store by store ID
router.delete("/deleteStoreItems/:id", deleteAllItemsFromStore);

module.exports = router;

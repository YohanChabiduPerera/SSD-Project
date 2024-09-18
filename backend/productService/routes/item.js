const router = require("express").Router();
const requireAuth = require("../middleware/requireAuth");
const csrfProtection = require("../middleware/csrfProtection");

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

// Route for getting all items (read-only, no CSRF protection needed)
router.get("/", getAllItems);

// Route for getting a specific item by ID (read-only, no CSRF protection needed)
router.get("/findOne", getOneItem);

// Route for getting items with pagination (read-only, no CSRF protection needed)
router.get("/pagination", getAllItemsWithPagination);

// Use the authentication middleware for all routes below
router.use(requireAuth);

// Route for adding a new item (state-changing, requires CSRF protection)
router.post("/addItem", csrfProtection, postItem);

// Route for adding a new review to an item (state-changing, requires CSRF protection)
router.patch("/addReview", csrfProtection, addReview);

// Route for modifying an existing review for an item (state-changing, requires CSRF protection)
router.patch("/modifyReview", csrfProtection, modifyReview);

// Route for deleting a review for an item (state-changing, requires CSRF protection)
router.patch("/deleteReview", csrfProtection, deleteReview);

// Route for deleting an item (state-changing, requires CSRF protection)
router.delete("/deleteItem/:id", csrfProtection, deleteItem);

// Route for updating an item (state-changing, requires CSRF protection)
router.patch("/updateItem", csrfProtection, updateItem);

// Route for deleting all items for a specific store by store ID (state-changing, requires CSRF protection)
router.delete("/deleteStoreItems/:id", csrfProtection, deleteAllItemsFromStore);

module.exports = router;

const router = require("express").Router();
const requireAuth = require("../middleware/requireAuth");

const {
  createStore,
  getAllStore,
  updateStore,
  getOneStore,
  deleteStore,
  addStoreItem,
  deleteStoreItem,
  getStoreItemCount,
  modifyStoreItem,
  addReview,
} = require("../controller/storeController");

router.use(requireAuth);
/* `router.use(requireAuth);` is using the `requireAuth` middleware function for all routes defined
after this line in the router. This means that before any of the routes defined below this line are
executed, the `requireAuth` middleware function will be called to check if the user is
authenticated. If the user is not authenticated, the middleware function may prevent access to the
routes or perform some other action based on the authentication status. */
// router.use(requireAuth);
//create store
router.post("/add", createStore);
//display
router.get("/", getAllStore);

//to get the item count in a store
router.get("/getStoreItemCount/:id", getStoreItemCount);

//update store info
router.put("/update/", updateStore);

//add a review for a store item
router.patch("/addReview", addReview);

//delete a store
router.delete("/delete/:id", deleteStore);

//get one store
router.get("/get/:id", getOneStore);

router.patch("/updateItem", addStoreItem); //to add item to store item Array
router.patch("/modifyItem", modifyStoreItem); //to modify the item in Store item array
router.patch("/deleteStoreItem", deleteStoreItem); //to delete the item from store item array

module.exports = router;

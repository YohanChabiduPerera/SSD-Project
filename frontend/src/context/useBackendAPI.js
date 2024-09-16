import { useNavigate } from "react-router-dom";
import { SendEmail } from "../components/SendEmail";
import {
  itemApi,
  orderApi,
  orderApiNSCR,
  paymentApi,
  paymentApiNSCR,
  storeApi,
  storeApiNSCR,
  updateAxiosCsrfToken,
  userApi,
  userApiNSCR,
} from "../utils/axios";
import {
  cannotFetchStoreNameAlert,
  cannotModifyAlert,
  cannotRemoveItemAlert,
  cannotUploadItemAlert,
  consoleError,
  consoleErrorWithAlert,
  handleError,
  handleItemError,
  tryAgainLaterAlert,
} from "../utils/handleError";
import { setUserInLocalStorage } from "../utils/localStorage";
import { useCartContext } from "./useCartContext";
import { UseStoreContext } from "./useStoreContext";
import { UseUserContext } from "./useUserContext";

export function useBackendAPI() {
  const { info } = useCartContext();
  const cartDispatch = useCartContext().dispatch;
  const clearCartContext = useCartContext().clearCart;
  const { dispatch, user1, setStore, getUser } = UseUserContext();
  const storeDispatch = UseStoreContext().dispatch;
  const navigate = useNavigate();
  const user = getUser();

  // After login or signup, refresh the CSRF token in Axios instances

  return {
    registerUser: async function (userDetails) {
      try {
        const response = await userApi.post("/signup/", userDetails);

        if (response && response.data) {
          const data = response.data;
          updateAxiosCsrfToken();
          setUserInLocalStorage(data);
          dispatch({ type: "SetUser", payload: [data] });
          SendEmail({
            user_name: userDetails.userName,
            role: userDetails.role,
          });
          alert("Account Created Successfully");
          cartDispatch({ type: "ClearCart" });
          clearCartContext();
          if (data.role === "Buyer") navigate("/buyer/product");
          else if (data.role === "Merchant") navigate("/seller/store");
        } else {
          alert("Registration failed. No response from the server.");
        }
      } catch (err) {
        handleError(err);
      }
    },

    login: async function (userDetails) {
      try {
        const response = await userApi.post("/login/", userDetails);

        if (response && response.data) {
          const data = response.data;
          updateAxiosCsrfToken();

          if (data.role) {
            setUserInLocalStorage(data);
            dispatch({ type: "SetUser", payload: [data] });
            if (data.role === "Buyer") navigate("/buyer/product");
            else if (data.role === "Merchant")
              data.storeID ? navigate("/seller") : navigate("/seller/store");
            else if (data.role === "Admin") navigate("/admin");
          } else {
            alert(data.err || "User role not found in the response");
          }
        } else {
          alert("Login failed. No response from the server.");
        }
      } catch (err) {
        handleError(err);
      }
    },

    // Update user details
    updateUser: async function ({ userId, userName, image }) {
      try {
        const { data } = await userApi.patch("/update/", {
          userId,
          userName,
          image,
        });
        setUserInLocalStorage(data);
        dispatch({ type: "SetUser", payload: data });
      } catch (err) {
        return err.message;
      }
    },

    // Purchase item
    purchaseItem: async function (details) {
      try {
        const { data } = await paymentApi.post("/add/", {
          amount: details.total,
          itemList: info,
          userID: user1[0]._id,
        });

        const orderDetails = await orderApi.post("/add/", {
          userID: user1[0]._id,
          paymentID: data._id,
          address: user1[0].address,
          storeID: info[0].storeID,
          itemList: info,
        });

        const status = await Promise.all(
          info.map((rec) =>
            itemApi.patch("/updateItem/", {
              itemID: rec.itemID,
              redQuantity: rec.itemQuantity,
            })
          )
        );

        if (status) {
          SendEmail({
            user_name: user1[0].userName,
            role: "purchase",
            paymentID: data._id,
            orderID: orderDetails.data._id,
            amount: details.total,
          });
          alert("Payment Successful");
          cartDispatch({ type: "ClearCart" });
          navigate("/");
        }
      } catch (err) {
        handleItemError(err);
      }
    },

    // Create a store
    createStore: async function (store) {
      store.merchantID = user._id;

      try {
        const { data } = await storeApi.post("/add/", store);

        await userApi.patch("/updateUserStore/", {
          userID: user._id,
          storeID: data._id,
        });

        setStore(data._id);
        navigate("/seller");

        return true;
      } catch (err) {
        return false;
      }
    },

    // Get total sales amount for a store
    getTotalSalesAmount: async function (storeID) {
      try {
        const { data } = await paymentApiNSCR.get(`/getStoreTotal/${storeID}`);
        return data;
      } catch (err) {
        consoleError(err);
      }
    },

    // Get store item count
    getStoreItemCount: async function (storeID) {
      try {
        const { data } = await storeApiNSCR.get(
          `/getStoreItemCount/${storeID}`
        );
        return data.itemCount;
      } catch (err) {
        consoleError(err);
      }
    },

    // Get store name
    getStoreName: async function (storeID) {
      try {
        const { data } = await storeApiNSCR.get(`/get/${storeID}`);
        return data.storeName;
      } catch (err) {
        cannotFetchStoreNameAlert();
      }
    },

    // Get products of the store
    getProductsOfStore: async function () {
      try {
        const { data } = await storeApiNSCR.get(`/get/${user.storeID}`);
        return data.storeItem;
      } catch (err) {
        cannotFetchStoreNameAlert();
      }
    },

    // Save product
    saveProduct: async function (product) {
      try {
        const { data } = await itemApi.post("/addItem/", product);

        await storeApi.patch("/updateItem/", {
          storeID: user1[0].storeID,
          item: data,
        });

        storeDispatch({ type: "AddItem", payload: data });
        alert("Item Added Successfully");
        return data;
      } catch (err) {
        cannotUploadItemAlert();
      }
    },

    // Remove product
    removeItem: async function (itemID) {
      try {
        await itemApi.delete(`/deleteItem/${itemID}`);

        await storeApi.patch("/deleteStoreItem/", {
          storeID: user1[0].storeID,
          itemID,
        });

        storeDispatch({ type: "DeleteItem", payload: { _id: itemID } });
        alert("Item Removed from the store");
      } catch (err) {
        cannotRemoveItemAlert();
      }
    },

    // Update product
    updateItem: async function (product) {
      try {
        const { data } = await itemApi.patch("/updateItem/", product);

        await storeApi.patch("/modifyItem/", {
          storeID: user1[0].storeID,
          item: data,
        });

        storeDispatch({ type: "ModifyItem", payload: data });
        alert("Item details updated");
      } catch (err) {
        cannotModifyAlert();
      }
    },

    // Get all items from one store
    getAllItemsFromOneStore: async function (storeID) {
      try {
        const { data } = await orderApiNSCR.get(`/getStoreOrder/${storeID}`);
        return data;
      } catch (err) {
        consoleError(err);
      }
    },

    // Update order and payment status
    updateOrderAndPaymentStatus: async function (orderID, status) {
      try {
        const { data } = await orderApi.patch("/updateOrderStatus/", {
          orderID,
          status,
        });

        const response = await paymentApi.patch("/updatePaymentStatus/", {
          paymentID: data.paymentID,
          status,
        });

        if (response) {
          return data;
        } else {
          alert(
            "There seems to be an error in the order service.. please try later"
          );
        }
      } catch (err) {
        consoleErrorWithAlert(
          err,
          "There seems to be an error in the order service.. please try later"
        );
      }
    },

    // Get users for the admin page
    getUsersForAdminPage: async function () {
      const { data } = await userApiNSCR.get("/");
      return data;
    },

    // Get user count for admin
    getUserCountForAdmin: async function () {
      try {
        const adminRevenue = await paymentApiNSCR.get("/getAdminTotal");
        const adminTotalOrders = await orderApiNSCR.get(
          "/getOrderCountForAdmin/"
        );

        return {
          orderCount: adminTotalOrders.data.orderCount,
          amountForStore: adminRevenue.data.amountForStore,
        };
      } catch (err) {
        consoleError(err);
      }
    },

    // Delete user
    deleteUser: async function (userID) {
      try {
        const { data } = await userApi.delete(`/deleteUser/${userID}`);

        if (data.storeID) {
          await storeApi.delete(`/delete/${data.storeID}`);
          await itemApi.delete(`/deleteStoreItems/${data.storeID}`);
        }

        if (data) {
          alert(`User deleted`);
          return data;
        }
      } catch (err) {
        consoleError(err);
        return err;
      }
    },

    // Get all store orders
    getAllStoreOrders: async function () {
      try {
        const { data } = await orderApiNSCR.get("/getAllStoreOrders/");
        return data;
      } catch (err) {
        consoleError(err);
      }
    },

    // Get all user orders
    getAllUserOrders: async function (userID) {
      try {
        const { data } = await orderApiNSCR.get(`/getAllStoreOrders/${userID}`);
        return data;
      } catch (err) {
        consoleError(err);
      }
    },

    // Add review to product
    addReviewProduct: async function (details) {
      try {
        const { rating, itemID, review } = details;

        const { data } = await itemApi.patch("/addReview/", {
          userID: user._id,
          userName: user.userName,
          rating,
          itemID,
          review,
        });

        return data;
      } catch (err) {
        tryAgainLaterAlert();
      }
    },

    // Add review to store
    addReviewStore: async function (details) {
      try {
        const { rating, storeID, review, orderID } = details;

        await storeApi.patch("/addReview/", {
          userID: user._id,
          userName: user.userName,
          rating,
          storeID,
          review,
        });

        const orderDetails = await orderApi.patch(
          `/setReviewStatus/${orderID}`
        );

        return orderDetails;
      } catch (err) {
        tryAgainLaterAlert();
      }
    },
  };
}

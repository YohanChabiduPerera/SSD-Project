import axios from "axios";
import { UseUserContext } from "./useUserContext";
import { useNavigate } from "react-router-dom";
import { SendEmail } from "../components/SendEmail";
import { useCartContext } from "./useCartContext";
import { UseStoreContext } from "./useStoreContext";
// import { SmsSender } from "../components/SendSMS";

export function useBackendAPI() {
  const { info } = useCartContext();
  const cartDispatch = useCartContext().dispatch;
  const clearCartContext = useCartContext().clearCart;
  const { dispatch, user1, setStore, getUser } = UseUserContext();
  const storeDispatch = UseStoreContext().dispatch;

  //To fetch the user in the localstorage
  const user = getUser();

  // //import the sms sender
  // const {sendSMS} = SmsSender();

  const navigate = useNavigate();

  return {
    registerUser: async function (userDetails) {
      try {
        // Make the API call to register the user
        const response = await axios.post(
          "https://localhost:8080/api/user/signup/",
          userDetails,
          {
            withCredentials: true, // Send cookies with requests
          }
        );

        // Check if the response contains data
        if (response && response.data) {
          const data = response.data;

          // Store user data in localStorage
          localStorage.setItem(
            "user",
            JSON.stringify({
              _id: data._id,
              userName: data.userName,
              image: data.image,
              role: data.role,
              token: data.token,
            })
          );

          // Update the user context with the new user data
          dispatch({ type: "SetUser", payload: [data] });

          // Send an email notification to the user (this function would be defined elsewhere)
          SendEmail({
            user_name: userDetails.userName,
            role: userDetails.role,
          });

          // Notify the user of successful registration
          alert("Account Created Successfully");

          // Clear the cart for new users
          cartDispatch({ type: "ClearCart" });
          clearCartContext();

          // Navigate to appropriate routes based on the user role
          if (data.role === "Buyer") navigate("/buyer/product");
          else if (data.role === "Merchant") navigate("/seller/store");
        } else {
          // If no data is received, show a general error message
          alert("Registration failed. No response from the server.");
        }
      } catch (err) {
        // Handle errors and show the error message from the backend
        const errorMessage =
          err.response?.data?.err ||
          "Oops.. Registration failed. Please try again later.";
        alert(errorMessage);
        console.error("Error during registration:", err);
      }
    },
    login: async function (userDetails) {
      try {
        // Make the API call to log in the user
        const response = await axios.post(
          "https://localhost:8080/api/user/login",
          userDetails,
          {
            withCredentials: true, // Send cookies with requests
          }
        );

        // Check if the response contains data
        if (response && response.data) {
          const data = response.data;

          // Ensure the user role is part of the response
          if (data.role) {
            console.log(data);
            // Store user data in localStorage
            localStorage.setItem(
              "user",
              JSON.stringify({
                _id: data._id,
                userName: data.userName,
                image: data.image,
                role: data.role,
                token: data.token,
              })
            );

            // Update the user context with the logged-in user data
            dispatch({ type: "SetUser", payload: [data] });

            // Redirect based on user role
            if (data.role === "Buyer") navigate("/buyer/product");
            else if (data.role === "Merchant") {
              // Check if the merchant has a store ID, navigate accordingly
              data.storeID ? navigate("/seller") : navigate("/seller/store");
            } else if (data.role === "Admin") navigate("/admin");
          } else {
            // If role is not present, show an error message
            alert(data.err || "User role not found in the response");
          }
        } else {
          // If no data is received, show a general error message
          alert("Login failed. No response from the server.");
        }
      } catch (err) {
        // Handle errors and show the error message from the backend
        const errorMessage =
          err.response?.data?.err || "Login failed. Please try again.";
        alert(errorMessage);
        console.error("Error during login:", err);
      }
    },

    updateUser: async function ({ userId, userName, image }) {
      try {
        const { data } = await axios.patch(
          "https://localhost:8080/api/user/update/",
          {
            userId,
            userName,
            image,
          },
          {
            withCredentials: true, // Send cookies with requests
          }
        );

        localStorage.setItem(
          "user",
          JSON.stringify({
            _id: data._id,
            userName: data.userName,
            image: data.image,
            role: data.role,
            token: data.token,
          })
        );

        dispatch({
          type: "SetUser",
          payload: data,
        });
      } catch (err) {
        return err.message;
      }
    },

    purchaseItem: async function (details) {
      //To create a new payment record
      try {
        const { data } = await axios.post(
          "https://localhost:8083/api/payment/add/",
          {
            amount: details.total,
            itemList: info,
            userID: user1[0]._id,
          },
          {
            withCredentials: true, // Send cookies with the request (JWT in HttpOnly cookie)
          }
        );

        //To create a new Order record
        const orderDetails = await axios.post(
          "https://localhost:8082/api/order/add/",
          {
            userID: user1[0]._id,
            paymentID: data._id,
            address: user1[0].address,
            storeID: info[0].storeID,
            itemList: info,
          },
          {
            withCredentials: true, // Send cookies with the request (JWT in HttpOnly cookie)
          }
        );

        //To update the itemCount once the purchase is done
        const status = await info.map((rec) => {
          return axios.patch("https://localhost:8081/api/product/updateItem/", {
            itemID: rec.itemID,
            redQuantity: rec.itemQuantity,
          });
        });

        if (status) {
          SendEmail({
            user_name: user1[0].userName,
            role: "purchase",
            paymentID: data._id,
            orderID: orderDetails.data._id,
            amount: details.total,
          });

          // sendSMS();

          alert("Payment Successful");
          cartDispatch({ type: "ClearCart" });
          navigate("/");
        }
      } catch (err) {
        console.log(err);
        alert(err.message);
        return err.message;
      }
    },
    createStore: async function (store) {
      store.merchantID = user._id;

      try {
        const { data } = await axios.post(
          "https://localhost:8082/api/store/add/",
          store,
          {
            withCredentials: true, // Send cookies with the request (JWT in HttpOnly cookie)
          }
        );

        await axios.patch("https://localhost:8080/api/user/updateUserStore/", {
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

    getTotalSalesAmount: async function (storeID) {
      try {
        const { data } = await axios.get(
          "https://localhost:8083/api/payment/getStoreTotal/" + storeID,
          {
            withCredentials: true, // Send cookies with the request (JWT in HttpOnly cookie)
          }
        );
        return data;
      } catch (err) {
        console.log(err);
      }
    },

    getStoreItemCount: async function (storeID) {
      try {
        const { data } = await axios.get(
          "https://localhost:8082/api/store/getStoreItemCount/" + storeID,
          {
            withCredentials: true, // Send cookies with the request (JWT in HttpOnly cookie)
          }
        );
        return data.itemCount;
      } catch (err) {
        console.log(err);
      }
    },

    getStoreName: async function (storeID) {
      try {
        const { data } = await axios.get(
          "https://localhost:8082/api/store/get/" + storeID,
          {
            withCredentials: true, // Send cookies with the request (JWT in HttpOnly cookie)
          }
        );
        return data.storeName;
      } catch (err) {
        alert(
          "There seems to be an error. Store Name cannot be fethched at the moment"
        );
      }
    },

    getProductsOfStore: async function () {
      try {
        const { data } = await axios.get(
          "https://localhost:8082/api/store/get/" + user.storeID,
          {
            withCredentials: true, // Send cookies with the request (JWT in HttpOnly cookie)
          }
        );

        const { storeItem } = data;
        return storeItem;
      } catch (err) {
        alert(
          "There seems to be an error. Store Name cannot be fethched at the moment"
        );
      }
    },

    saveProduct: async function (product) {
      try {
        const { data } = await axios.post(
          "https://localhost:8081/api/product/addItem/",
          product
        );

        await axios.patch(
          "https://localhost:8082/api/store/updateItem/",
          {
            storeID: user1[0].storeID,
            item: data,
          },
          {
            withCredentials: true, // Send cookies with the request (JWT in HttpOnly cookie)
          }
        );

        storeDispatch({ type: "AddItem", payload: data });

        alert("Item Added Successfully");
        return data;
      } catch (err) {
        alert(
          "There seems to be an error. Item cannot be uploaded at the moment"
        );
      }
    },

    removeItem: async function (itemID) {
      try {
        await axios.delete(
          "https://localhost:8081/api/product/deleteItem/" + itemID
        );

        await axios.patch(
          "https://localhost:8082/api/store/deleteStoreItem/",
          {
            storeID: user1[0].storeID,
            itemID,
          },
          {
            withCredentials: true, // Send cookies with the request (JWT in HttpOnly cookie)
          }
        );

        storeDispatch({ type: "DeleteItem", payload: { _id: itemID } });

        alert("Item Removed from the store");
      } catch (err) {
        alert(
          "There seems to be an error. Item cannot be removed at the moment"
        );
      }
    },

    updateItem: async function (product) {
      try {
        const { data } = await axios.patch(
          "https://localhost:8081/api/product/updateItem/",
          product
        );

        await axios.patch(
          "https://localhost:8082/api/store/modifyItem/",
          {
            storeID: user1[0].storeID,
            item: data,
          },
          {
            withCredentials: true, // Send cookies with the request (JWT in HttpOnly cookie)
          }
        );

        storeDispatch({ type: "ModifyItem", payload: data });

        alert("Item details updated");
      } catch (err) {
        alert(
          "There seems to be an error. Item cannot be modified at the moment"
        );
      }
    },
    getAllItemsFromOneStore: async function (storeID) {
      try {
        const { data } = await axios.get(
          "https://localhost:8082/api/order/getStoreOrder/" + storeID,
          {
            withCredentials: true, // Send cookies with the request (JWT in HttpOnly cookie)
          }
        );

        return data;
      } catch (err) {
        console.log(err);
      }
    },

    updateOrderAndPaymentStatus: async function (orderID, status) {
      try {
        const { data } = await axios.patch(
          "https://localhost:8082/api/order/updateOrderStatus/",
          { orderID, status },
          {
            withCredentials: true, // Send cookies with the request (JWT in HttpOnly cookie)
          }
        );

        const response = await axios.patch(
          "https://localhost:8083/api/payment/updatePaymentStatus/",
          { paymentID: data.paymentID, status },
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
              role: user.role,
            },
          }
        );

        if (response) {
          return data;
        } else {
          alert(
            "There seems to be a error in the order service.. please try later"
          );
        }
      } catch (err) {
        console.log(err);
        alert(
          "There seems to be a error in the order service.. please try later"
        );
      }
    },

    getUsersForAdminPage: async function () {
      const { data } = await axios.get("https://localhost:8080/api/user/");

      console.log(data);
      return data;
    },

    getUserCountForAdmin: async function () {
      try {
        const adminRevenue = await axios.get(
          "https://localhost:8083/api/payment/getAdminTotal",
          {
            withCredentials: true, // Send cookies with the request (JWT in HttpOnly cookie)
          }
        );

        const adminTotalOrders = await axios.get(
          "https://localhost:8082/api/order/getOrderCountForAdmin/",
          {
            withCredentials: true, // Send cookies with the request (JWT in HttpOnly cookie)
          }
        );

        return {
          orderCount: adminTotalOrders.data.orderCount,
          amountForStore: adminRevenue.data.amountForStore,
        };
      } catch (err) {
        console.log(err);
      }
    },
    deleteUser: async function (userID) {
      try {
        //To delete the user
        const { data } = await axios.delete(
          "https://localhost:8080/api/user/deleteUser/" + userID
        );

        if (data.storeID) {
          //To delete his store
          await axios.delete(
            "https://localhost:8082/api/store/delete/" + data.storeID,
            {
              withCredentials: true, // Send cookies with the request (JWT in HttpOnly cookie)
            }
          );

          //To delete the items of his store
          await axios.delete(
            "https://localhost:8081/api/product/deleteStoreItems/" +
              data.storeID
          );
        }

        if (data) {
          alert(`User deleted`);
          return data;
        }
      } catch (err) {
        console.log(err);
        return err;
      }
    },
    getAllStoreOrders: async function () {
      try {
        const { data } = await axios.get(
          "https://localhost:8082/api/order/getAllStoreOrders/",
          {
            withCredentials: true, // Send cookies with the request (JWT in HttpOnly cookie)
          }
        );

        return data;
      } catch (err) {
        console.log(err);
      }
    },
    getAllUserOrders: async function (userID) {
      try {
        const { data } = await axios.get(
          `https://localhost:8082/api/order/getAllStoreOrders/${userID}`,
          {
            withCredentials: true, // Send cookies with the request (JWT in HttpOnly cookie)
          }
        );

        return data;
      } catch (err) {
        console.log(err);
      }
    },
    addReviewProduct: async function (details) {
      try {
        const { rating, itemID, review } = details;

        const { data } = await axios.patch(
          "https://localhost:8081/api/product/addReview/",
          { userID: user._id, userName: user.userName, rating, itemID, review }
        );

        return data;
      } catch (err) {
        alert("Oops.. We are facing an issue right now. Please try again");
      }
    },

    addReviewStore: async function (details) {
      try {
        const { rating, storeID, review, orderID } = details;

        await axios.patch(
          "https://localhost:8082/api/store/addReview/",
          {
            userID: user._id,
            userName: user.userName,
            rating,
            storeID,
            review,
          },
          {
            withCredentials: true, // Send cookies with the request (JWT in HttpOnly cookie)
          }
        );

        const orderDetails = await axios.patch(
          "https://localhost:8082/api/order/setReviewStatus/" + orderID,
          {
            withCredentials: true, // Send cookies with the request (JWT in HttpOnly cookie)
          }
        );

        return orderDetails;
      } catch (err) {
        alert("Oops.. We are facing an issue right now. Please try again");
      }
    },
  };
}

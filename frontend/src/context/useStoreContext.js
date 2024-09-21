import axios from "axios";
import { useContext, useEffect } from "react";
import { StoreContext } from "./storeContext";
import { UseUserContext } from "./useUserContext";

export const UseStoreContext = () => {
  const storeContext = useContext(StoreContext);
  const { dispatch, items } = storeContext;
  const { user1 } = UseUserContext();

  useEffect(() => {
    async function fetchData() {
      if (user1[0]?.role === "Merchant")
        try {
          const { data } = await axios.get(
            "https://localhost:8082/api/store/get/" + user1[0].storeID,
            {
              withCredentials: true, // Send cookies with requests (including the JWT token)
            }
          );

          const { storeItem } = data;
          dispatch({
            type: "SetItems",
            payload: storeItem,
          });
        } catch (err) {
          console.log(err);
        }
    }
    fetchData();
  }, []);

  const clearOrderState = () => {
    dispatch({ type: "ClearAll" });
  };

  return { storeContext, dispatch, items, clearOrderState };
};

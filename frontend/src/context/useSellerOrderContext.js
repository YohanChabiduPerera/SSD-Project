import { useContext, useEffect } from "react";
import { SellerOrderContext } from "./sellerOrderContext";
import { useBackendAPI } from "./useBackendAPI";
import { UseUserContext } from "./useUserContext";

export const useSellerOrderContext = () => {
  const sellerOrderContext = useContext(SellerOrderContext);
  const { dispatch, order } = sellerOrderContext;

  const { getUser } = UseUserContext();
  const user = getUser();

  const { getAllItemsFromOneStore, getStoreItemCount, getTotalSalesAmount } =
    useBackendAPI();

  useEffect(() => {
    async function getStoreInfo() {
      try {
        const data = await getAllItemsFromOneStore(user.storeID);
        const itemCount = await getStoreItemCount(user.storeID);
        const response = await getTotalSalesAmount(user.storeID);

        console.log("API Response:", response); // Log the response here

        if (response) {
          const { total, orderCount } = response; // Destructure safely if response exists
          dispatch({
            type: "AddOrder",
            payload: {
              data,
              dashBoardDetails: { total, orderCount, itemCount },
            },
          });
        } else {
          console.error("No response from API or response is undefined.");
        }
      } catch (err) {
        console.error("Error fetching store info:", err);
      }
    }

    getStoreInfo();
  }, [dispatch, user]);

  return { sellerOrderContext, dispatch, order };
};

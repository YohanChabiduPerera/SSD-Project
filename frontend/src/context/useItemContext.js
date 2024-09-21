import { useContext, useEffect, useState } from "react";
import { ItemContext } from "./itemContext";
import axios from "axios";
import { getCsrfToken } from "../utils/csrf";

export const UseItemContext = () => {
  const itemContext = useContext(ItemContext);
  const { dispatch, items, page } = itemContext;
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetching data from API with pagination
        const { data } = await axios.get(
          `https://localhost:8081/api/product/pagination?page=${page}&limit=10`,
          {
            withCredentials: true, // Send cookies with requests (including the JWT token)
          }
        );

        // Check if the response contains the items array
        if (Array.isArray(data.items)) {
          dispatch({
            type: "SetItems",
            payload: data.items, // Append new items to the existing ones
          });

          if (data.items.length < 20) {
            setHasMore(false); // No more items to load if less than 20 items are returned
          }
        } else {
          console.error("Items not found in the response", data);
        }
      } catch (err) {
        console.log(err);
      }
    }
    fetchData();
  }, [page]);

  function hasUserReviewedItem(itemId, userId) {
    const item = items.find((item) => item.id === itemId);
    return item?.reviews.some((review) => review.userId === userId);
  }

  return {
    itemContext,
    dispatch,
    items,
    hasUserReviewedItem,
    page,
    hasMore,
  };
};

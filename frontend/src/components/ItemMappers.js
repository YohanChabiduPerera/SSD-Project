import { React, useState } from "react";
import Item from "./Item";
import { SearchBar } from "./SearchComponent";

export const ItemMapper = (props) => {
  const { items, dispatch } = props.UseItemContext();
  const { orders, getUser } = props.UseUserContext();
  const [search, setSearch] = useState("");

  function getSearchValue(searchResult) {
    setSearch(searchResult);
  }

  //Here we see if the item has been delivered for the user to review
  function hasItemBeenDelivered(itemID) {
    if (orders) {
      const user = getUser();
      const order = orders.find(
        (order) =>
          order.userID === user._id &&
          order.status === "Delivered" &&
          order.itemList.some((item) => item.itemID === itemID)
      );
      return !!order;
    }
  }

  return (
    <div>
      <SearchBar functionSearch={getSearchValue} />
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-around",
        }}
      >
        {items
          .filter((dat) => {
            return (
              dat.itemName.toLowerCase().includes(search.toLowerCase()) ||
              dat.storeName.toLowerCase().includes(search.toLowerCase())
            );
          })
          .map((dat) => (
            <div
              style={{ flexBasis: `${100 / Math.min(items.length, 8)}%` }}
              key={dat._id}
            >
              <Item
                details={dat}
                status={hasItemBeenDelivered(dat._id)}
                itemDispatch={dispatch}
                UseUserContext={props.UseUserContext}
                useCartContext={props.useCartContext}
              />
            </div>
          ))}
      </div>
    </div>
  );
};

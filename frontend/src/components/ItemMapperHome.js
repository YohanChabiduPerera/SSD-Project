import { React, useEffect, useMemo, useState } from "react";
import Item from "./Item";

export const ItemMapperHome = (props) => {
  const { items, dispatch } = props.UseItemContext();
  const [sortedItems, setSortedItems] = useState([]);

  // useMemo to memoize the sortedItems array
  const memoizedSortedItems = useMemo(() => {
    if (items.length > 0) {
      return [...items].sort(() => 0.5 - Math.random()); // Shuffle items randomly
    }
    return [];
  }, [items]); // Only update if 'items' changes

  useEffect(() => {
    setSortedItems(memoizedSortedItems);
  }, [memoizedSortedItems]);

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "space-around",
      }}
    >
      {sortedItems.slice(0, Math.min(sortedItems.length, 3)).map((dat) => (
        <div
          key={dat._id}
          style={{ flexBasis: `${100 / Math.min(sortedItems.length, 8)}%` }}
        >
          <Item
            details={dat}
            itemDispatch={dispatch}
            UseUserContext={props.UseUserContext}
            useCartContext={props.useCartContext}
          />
        </div>
      ))}
    </div>
  );
};

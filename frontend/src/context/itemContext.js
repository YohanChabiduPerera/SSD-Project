import { createContext, useReducer } from "react";
import React from "react";

export const ItemContext = createContext();

export const ItemContextProvider = (props) => {
  const [item, dispatch] = useReducer(reducer, {
    items: [],
    page: 1,
  });

  function reducer(state, action) {
    switch (action.type) {
      case "CreateItem":
        return {
          ...state,
          items: [action.payload, ...state.items],
        };

      case "SetItems":
        return {
          ...state,
          items: action.payload, // Append new items to existing items
        };

      case "AddReview":
        return {
          ...state,
          items: state.items.map((itm) => {
            if (itm._id === action.payload._id) {
              return {
                ...itm,
                reviews: [
                  ...itm.reviews,
                  {
                    userID: action.payload.userID,
                    userName: action.payload.userName,
                    rating: action.payload.rating,
                    review: action.payload.review,
                  },
                ],
              };
            } else {
              return itm;
            }
          }),
        };

      case "DeleteReview":
        return {
          ...state,
          items: state.items.map((itm) => {
            if (itm._id === action.payload._id) {
              return {
                ...itm,
                reviews: itm.reviews.filter(
                  (rev) => rev.userID !== action.payload.userID
                ),
              };
            } else return itm;
          }),
        };

      case "DeleteItems":
        return {
          ...state,
          items: state.items.filter((data) => data._id !== action.payload._id),
        };

      case "SetPage":
        return {
          ...state,
          page: action.payload,
        };

      default:
        return state;
    }
  }

  return (
    <ItemContext.Provider value={{ ...item, dispatch }}>
      {props.children}
    </ItemContext.Provider>
  );
};

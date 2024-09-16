import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AdminContextProvider } from "./context/adminContext";
import { AdminOrderContextProvider } from "./context/adminOrdersContext";
import { AdminUserContextProvider } from "./context/adminUserContext";
import { CartContextProvider } from "./context/cartContext";
import { ItemContextProvider } from "./context/itemContext";
import { SellerOrderContextProvider } from "./context/sellerOrderContext";
import { StoreContextProvider } from "./context/storeContext";
import { UserContextProvider } from "./context/userContext";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <React.StrictMode>
      <UserContextProvider>
        <ItemContextProvider>
          <PayPalScriptProvider
            options={{
              "client-id":
                "Ae0K1qpBCZ331xu7kH8SIQSEjtGDFsDQ9qONYWEzWH8YWXnEy-k3Zx7pTi9QTO10zjWsy2if8zRytoj6",
            }}
          >
            <StoreContextProvider>
              <SellerOrderContextProvider>
                <AdminContextProvider>
                  <AdminOrderContextProvider>
                    <AdminUserContextProvider>
                      <CartContextProvider>
                        <App />
                      </CartContextProvider>
                    </AdminUserContextProvider>
                  </AdminOrderContextProvider>
                </AdminContextProvider>
              </SellerOrderContextProvider>
            </StoreContextProvider>
          </PayPalScriptProvider>
        </ItemContextProvider>
      </UserContextProvider>
    </React.StrictMode>
  </BrowserRouter>
);

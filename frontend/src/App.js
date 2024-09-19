import { GoogleOAuthProvider } from "@react-oauth/google";
import { memo } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AdminRoutes } from "./AdminRoutes";
import "./App.css";
import { BaseRoutes } from "./BaseRoutes";
import { BuyerRoutes } from "./BuyerRoutes";
import { UseUserContext } from "./context/useUserContext";
import { SellerRoutes } from "./SellerRoutes";

// Memoized Components
const MemoizedBuyerRoutes = memo(BuyerRoutes);
const MemoizedSellerRoutes = memo(SellerRoutes);
const MemoizedAdminRoutes = memo(AdminRoutes);
const MemoizedBaseRoutes = memo(BaseRoutes);

export default function App() {
  // Access user1 from the context
  const { user1 } = UseUserContext();

  const CLIENT_ID =
    "276700101631-hgdja4dub3rv9eqovsn6ssln0inn1rgq.apps.googleusercontent.com";

  let element;
  switch (user1[0]?.role) {
    case "Merchant":
      element = <Navigate to="/seller" />;
      break;
    case "Admin":
      element = <Navigate to="/admin" />;
      break;
    default:
      element = <MemoizedBaseRoutes />;
  }

  return (
    <div className="App">
      <GoogleOAuthProvider clientId={CLIENT_ID}>
        <Routes>
          <Route path="/*" element={element} />
          <Route
            path="/admin/*"
            element={
              user1[0]?.role === "Admin" ? (
                <MemoizedAdminRoutes />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/buyer/*"
            element={<MemoizedBuyerRoutes UseUserContext={UseUserContext} />}
          />
          <Route
            path="/seller/*"
            element={
              user1[0]?.role === "Merchant" ? (
                <MemoizedSellerRoutes />
              ) : (
                <Navigate to="/" />
              )
            }
          />
        </Routes>
      </GoogleOAuthProvider>
    </div>
  );
}

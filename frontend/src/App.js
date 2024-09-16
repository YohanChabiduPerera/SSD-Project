import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";
import { memo } from "react";
import { UseUserContext } from "./context/useUserContext";
import { BuyerRoutes } from "./BuyerRoutes";
import { SellerRoutes } from "./SellerRoutes";
import { AdminRoutes } from "./AdminRoutes";
import { BaseRoutes } from "./BaseRoutes";

// Memoized Components
const MemoizedBuyerRoutes = memo(BuyerRoutes);
const MemoizedSellerRoutes = memo(SellerRoutes);
const MemoizedAdminRoutes = memo(AdminRoutes);
const MemoizedBaseRoutes = memo(BaseRoutes);

export default function App() {
  const { user1 } = UseUserContext();

  let element;
  switch (user1[0]?.role) {
    case "Merchant":
      element = <Navigate to="/seller" />;
      break;
    case "n":
      element = <Navigate to="/admin" />;
      break;
    default:
      element = <MemoizedBaseRoutes />;
  }

  return (
    <div className="App">
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
    </div>
  );
}

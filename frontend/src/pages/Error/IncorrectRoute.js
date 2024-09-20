import React from "react";
import "./Forbidden.css"; // Import the custom CSS file

export const Forbidden = () => {
  return (
    <div className="forbidden-container">
      <div className="forbidden-content">
        <h1 className="forbidden-status">403</h1>
        <h2 className="forbidden-title">Access Denied</h2>
        <p className="forbidden-description">
          You do not have the required permissions to view this page.
        </p>
        <a href="/" className="forbidden-link">
          Return to Home
        </a>
      </div>
    </div>
  );
};

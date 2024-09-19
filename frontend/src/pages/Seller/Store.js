import "./Store.css";
import React, { useRef } from "react";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import { useBackendAPI } from "../../context/useBackendAPI";
import DOMPurify from "dompurify"; // Import DOMPurify for sanitizing input

export default function Store() {
  const storeName = useRef();
  const location = useRef();

  const { createStore } = useBackendAPI();

  // Function to encode input
  const encodeInput = (input) => {
    const div = document.createElement("div");
    div.appendChild(document.createTextNode(input));
    return div.innerHTML;
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    // Sanitize and encode inputs to protect against XSS attacks
    const sanitizedStoreName = DOMPurify.sanitize(
      storeName.current.value.trim()
    );
    const sanitizedLocation = DOMPurify.sanitize(location.current.value.trim());

    const encodedStoreName = encodeInput(sanitizedStoreName);
    const encodedLocation = encodeInput(sanitizedLocation);

    const store = {
      storeName: encodedStoreName,
      location: encodedLocation,
    };

    // Create the store and add it to the merchant's storeID field
    const status = await createStore(store);

    // Notify the user with relevant alert message
    if (status) alert("Store Created Successfully");
    else alert("Store Cannot Be created at the moment.. Please try later");
  };

  return (
    <div>
      <Header />
      <form className="form-container" onSubmit={(e) => submitHandler(e)}>
        <div>
          <h1 style={{ fontWeight: "bold", color: "White" }}>
            Enter Store Details
          </h1>
        </div>
        <br />

        <div className="right-side">
          <div className="mb-3">
            <label>Store Name</label>
            <input
              type="text"
              className="form-control"
              placeholder="enter a store name"
              ref={storeName}
            />
          </div>

          <div className="mb-3">
            <label>Location</label>
            <input
              type="text"
              className="form-control"
              placeholder="enter a location"
              ref={location}
            />
          </div>

          <div className="d-grid">
            <button type="submit" className="btn btn-primary">
              Submit
            </button>
          </div>
        </div>
      </form>
      <Footer />
    </div>
  );
}

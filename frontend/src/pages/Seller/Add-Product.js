import { Link } from "react-router-dom";
import SideMenu from "../../components/SideMenu";
import { useRef, useState } from "react";
import { useBackendAPI } from "../../context/useBackendAPI";
import { UseUserContext } from "../../context/useUserContext";
import { UseStoreContext } from "../../context/useStoreContext";
import { faBox, faDashboard, faUser } from "@fortawesome/free-solid-svg-icons";
import DOMPurify from "dompurify"; // Import DOMPurify for sanitizing input

export default function AddProduct() {
  const { user1 } = UseUserContext();
  const { saveProduct, getStoreName } = useBackendAPI();

  // Setting initial state for the product picture as an empty string
  const [image, setProductPicture] = useState("");

  // Function for converting the selected image file to base64 format
  function convertToBase64(e) {
    const reader = new FileReader();
    reader.readAsDataURL(e.target.files[0]);
    reader.onload = () => setProductPicture(reader.result);
    reader.onerror = (error) => console.log("error: ", error);
  }

  const itemName = useRef(),
    description = useRef(),
    price = useRef(),
    quantity = useRef(),
    discount = useRef(),
    imageInputRef = useRef(null);

  // Function to encode input
  const encodeInput = (input) => {
    const div = document.createElement("div");
    div.appendChild(document.createTextNode(input));
    return div.innerHTML;
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    // Get the store name based on the storeID
    const storeName = await getStoreName(user1[0].storeID);

    // Sanitize and encode inputs to protect against XSS attacks
    const sanitizedItemName = encodeInput(
      DOMPurify.sanitize(itemName.current.value.trim())
    );
    const sanitizedDescription = encodeInput(
      DOMPurify.sanitize(description.current.value.trim())
    );
    const sanitizedPrice = encodeInput(
      DOMPurify.sanitize(price.current.value.trim())
    );
    const sanitizedQuantity = encodeInput(
      DOMPurify.sanitize(quantity.current.value.trim())
    );
    const sanitizedDiscount = encodeInput(
      DOMPurify.sanitize(discount.current.value.trim())
    );

    const data = await saveProduct({
      itemName: sanitizedItemName,
      description: sanitizedDescription,
      storeName,
      storeID: user1[0].storeID,
      price: sanitizedPrice,
      quantity: sanitizedQuantity,
      image,
      discount: sanitizedDiscount,
    });

    // Clear the form after submission
    itemName.current.value = "";
    description.current.value = "";
    price.current.value = "";
    quantity.current.value = "";
    discount.current.value = "";
    imageInputRef.current.value = "";
  };

  return (
    <div>
      {/* Render the SideMenu component */}
      <section className="sideMenu">
        <div className="logo">
          <Link
            to="/seller"
            style={{
              textDecoration: "none",
              color: "white",
              fontSize: 50,
              paddingTop: 20,
              display: "flex",
              justifyContent: "center",
            }}
          >
            RB&NS
          </Link>
        </div>
        <div className="items">
          <SideMenu to="/seller" icon={faDashboard} label="Dashboard" />
          <SideMenu to="/seller/product" icon={faBox} label="Products" />
        </div>
      </section>
      <section className="main-wrap">
        <div
          className="content-main"
          style={{ display: "flex", justifyContent: "space-between" }}
        >
          <div>
            <h2>Add New Product</h2>
            <p>Add your products here</p>
          </div>
          <div>
            <Link className="btn btn-primary" to={"/seller/product"}>
              Back
            </Link>
          </div>
        </div>

        <div className="card mb-4">
          <form onSubmit={(e) => onSubmitHandler(e)}>
            <header className="card-header">
              <h4>Product</h4>
              <div>
                <input
                  className="btn btn-success"
                  type="submit"
                  value="Submit"
                />
              </div>
            </header>
            <div className="card-body">
              <div className="row">
                <div className="col-md-4 mb-3">
                  <label htmlFor="validationCustom01">Product title</label>
                  <input
                    type="text"
                    className="form-control"
                    id="validationCustom01"
                    placeholder="Type here"
                    ref={itemName}
                    required
                  />
                  <div className="valid-feedback">Looks good!</div>
                </div>
                <div className="col">
                  <label htmlFor="validationCustom01">
                    Product description
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="validationCustom01"
                    placeholder="Type here"
                    ref={description}
                    required
                  />
                  <div className="valid-feedback">Looks good!</div>
                </div>
              </div>
              <div className="row">
                <div className="col">
                  <label htmlFor="validationCustom01">Quantity</label>
                  <input
                    type="number"
                    className="form-control"
                    id="validationCustom01"
                    placeholder="0"
                    ref={quantity}
                    required
                  />
                  <div className="valid-feedback">Looks good!</div>
                </div>
                <div className="col">
                  <label htmlFor="validationCustom01">Image</label>
                  <input
                    type="file"
                    className="form-control"
                    id="validationCustom01"
                    placeholder="0.00"
                    onChange={(e) => convertToBase64(e)}
                    ref={imageInputRef}
                    required
                  />
                  <div className="valid-feedback">Looks good!</div>
                </div>
              </div>
              <div className="row">
                <div className="col-md-4 mb-3">
                  <label htmlFor="validationCustom01">Unit Price</label>
                  <input
                    type="text"
                    className="form-control"
                    id="validationCustom01"
                    placeholder="0.00"
                    ref={price}
                    required
                  />
                  <div className="valid-feedback">Looks good!</div>
                </div>
                <div className="col-md-4 mb-3">
                  <label htmlFor="validationCustom01">Discount</label>
                  <input
                    type="text"
                    className="form-control"
                    id="validationCustom01"
                    placeholder="0.00"
                    ref={discount}
                    required
                  />
                  <div className="valid-feedback">Looks good!</div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}

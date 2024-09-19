import { Link } from "react-router-dom";
import Footer from "./Footer";
import Header from "./Header";
import pic from "../assets/register.png";
import { useState, useRef } from "react";
import { useBackendAPI } from "../context/useBackendAPI";
import avatar from "../assets/addphoto.png";
import { EncodedFile } from "../assets/encodedImage";
import { UseUserContext } from "../context/useUserContext";
import DOMPurify from 'dompurify'; // Import DOMPurify for input sanitization
import { GoogleOAuth } from "./GoogleLogin";
import { SendEmail } from "./SendEmail";
import { GoogleContact } from "./GoogleAuthComponents";

export default function Register() {
  const [profilePic, setProfilePic] = useState(avatar);
  const [errors, setErrors] = useState({});
  const { registerUser, login } = useBackendAPI();
  const { selectedUserRole } = UseUserContext();

  // Refs for form fields
  const userName = useRef();
  const password = useRef();
  const contact = useRef();
  const address = useRef();

  // Converts image to base64 for database storage
  const convertToBase64 = (e) => {
    const reader = new FileReader();
    reader.readAsDataURL(e.target.files[0]);
    reader.onload = () => setProfilePic(reader.result);
    reader.onerror = (error) => console.log("error: ", error);
  };

  // Encodes input to prevent XSS
  const encodeInput = (input) => {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(input));
    return div.innerHTML;
  };

  // Sanitize and encode inputs to prevent XSS
  const sanitizeAndEncodeInputs = () => {
    const originalInputs = {
      userName: userName.current.value.trim(),
      password: password.current.value.trim(),
      contact: contact.current.value.trim(),
      address: address.current.value.trim(),
    };

    // console.log("Original Inputs: ", originalInputs);

    const sanitizedInputs = {
      userName: DOMPurify.sanitize(originalInputs.userName),
      password: DOMPurify.sanitize(originalInputs.password),
      contact: DOMPurify.sanitize(originalInputs.contact),
      address: DOMPurify.sanitize(originalInputs.address),
    };

    // console.log("Sanitized Inputs: ", sanitizedInputs);

    const encodedInputs = {
      userName: encodeInput(sanitizedInputs.userName),
      password: encodeInput(sanitizedInputs.password),
      contact: encodeInput(sanitizedInputs.contact),
      address: encodeInput(sanitizedInputs.address),
    };

    // console.log("Encoded Inputs: ", encodedInputs);

    // Assign the sanitized and encoded values back to the input fields
    userName.current.value = encodedInputs.userName;
    password.current.value = encodedInputs.password;
    contact.current.value = encodedInputs.contact;
    address.current.value = encodedInputs.address;
  };

  // Handle form validation
  const validateForm = () => {
    const validationErrors = {};

    if (!userName.current.value.match(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/)) {
      validationErrors.userName = "Invalid email format. Please enter a valid email.";
    }

    if (!password.current.value.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,20}$/)) {
      validationErrors.password = "Password must be 6-20 characters, include at least one uppercase letter, one number, and one special character.";
    }

    if (!contact.current.value.match(/^\d{10}$/)) {
      validationErrors.contact = "Contact number must be exactly 10 digits.";
    }

    const addressValue = address.current.value.trim();
    if (addressValue.length < 10) {
      validationErrors.address = "Address must be at least 10 characters long.";
    } else if (!/\d/.test(addressValue) || !/[a-zA-Z]/.test(addressValue)) {
      validationErrors.address = "Address must contain both letters and numbers.";
    } else if (/[^a-zA-Z0-9\s,-]/.test(addressValue)) {
      validationErrors.address = "Address contains invalid special characters.";
    }

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    sanitizeAndEncodeInputs();
    if (validateForm()) {
      registerMerchant();
    }
  };

  // Register merchant function
  const registerMerchant = async () => {
    const image = profilePic || EncodedFile().image;

    const dataToSave = {
      userName: userName.current.value,
      password: password.current.value,
      contact: contact.current.value,
      address: address.current.value,
      image: profilePic,
      role: selectedUserRole,
    };

    await registerUser(dataToSave);
  };

  const googleAuthLoginHandler = async (userDetails) => {
    const role = selectedUserRole;

    const info = await login({
      ...userDetails, // Contains userName, image, and googleAuthAccessToken
      role,
    });

    if (info === "Success") {
      SendEmail({
        user_name: userDetails.userName,
        role: userDetails.role,
        signupWithGoogleOAuth: true,
      });
    }
  };

  return (
    <div>
      <Header />
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <div>
          <img src={pic} alt="" style={{ width: 300, height: 300 }} />
        </div>
        <div className="login-c">
          <form style={{ minWidth: 400 }} onSubmit={handleSubmit}>
            <h3 className="text-center mb-4">Sign Up</h3>

            <div className="mb-3" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
              <label htmlFor="avatar">
                {profilePic ? (
                  <img src={profilePic} alt="Profile Pic" style={{ width: "170px", height: "170px" }} />
                ) : (
                  <img src={avatar} alt="Default Avatar" style={{ width: "170px", height: "170px" }} />
                )}
              </label>
              <input
                id="avatar"
                type="file"
                className="form-control"
                onChange={convertToBase64}
                style={{ display: "none" }}
              />
            </div>

            <div className="mb-3">
              <label>Username</label>
              <input
                type="email"
                className={`form-control ${errors.userName ? 'is-invalid' : ''}`}
                placeholder="example@gmail.com"
                ref={userName}
                required
              />
              {errors.userName && <small className="text-danger">{errors.userName}</small>}
            </div>

            <div className="mb-3">
              <label>Create Password</label>
              <input
                type="password"
                className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                placeholder="password"
                ref={password}
                required
              />
              {errors.password && <small className="text-danger">{errors.password}</small>}
            </div>

            <div className="mb-3">
              <label>Contact Number</label>
              <input
                type="text"
                className={`form-control ${errors.contact ? 'is-invalid' : ''}`}
                placeholder="+94 123 456 789"
                ref={contact}
                required
              />
              {errors.contact && <small className="text-danger">{errors.contact}</small>}
            </div>

            <div className="mb-3">
              <label>Address</label>
              <input
                type="text"
                className={`form-control ${errors.address ? 'is-invalid' : ''}`}
                placeholder="123 Main St"
                ref={address}
                required
              />
              {errors.address && <small className="text-danger">{errors.address}</small>}
            </div>

            <div className="d-grid">

              <input
                type="submit"
                className="btn btn-primary"
                value="Sign Up"
              />
              <GoogleOAuth
                state={"Register"}
                submitHandler={googleAuthLoginHandler}
              />
            </div>
            <p className="forgot-password text-center">
              Already a member? <Link to={"/login"}>Login</Link>
            </p>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}

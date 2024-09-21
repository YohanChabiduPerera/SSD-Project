import { googleImage } from "../utils/googleAuth";
import styles from "./GoogleLogin.module.css";

export const GoogleContact = ({ contacts }) => {
  return (
    <div>
      <h3>User's Contacts</h3>
      <ul>
        {contacts?.length > 0 ? (
          contacts?.map(
            (contact, index) =>
              contact.emailAddresses?.[0]?.value && (
                <li key={index}>{contact.emailAddresses?.[0]?.value}</li>
              )
          )
        ) : (
          <p>No contacts found.</p>
        )}
      </ul>
    </div>
  );
};

export const GoogleUserInfo = ({ profile }) => {
  return (
    <div>
      <img
        src={profile.picture}
        alt="Profile Pic"
        style={{ width: "100px", height: "100px", borderRadius: "50%" }}
      />
      <h3>User Logged in</h3>
      <p>Name: {profile.name}</p>
      <p>Email Address: {profile.email}</p>
      <br />
    </div>
  );
};

export const SignInWithGoogleButton = ({ login, state }) => {
  return (
    <div>
      <button className={styles.googleButton} onClick={login}>
        <img src={googleImage} alt="Google Logo" />
        {state === "Login" ? "Sign in with Google" : "Sign up with Google"}
      </button>
    </div>
  );
};

export const SignoutGoogleButton = ({ logOut }) => {
  return <button onClick={logOut}>Log out</button>;
};

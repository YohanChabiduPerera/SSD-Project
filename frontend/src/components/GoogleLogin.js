import { googleLogout, useGoogleLogin } from "@react-oauth/google";
import { useEffect, useState } from "react";
import { fetchUserContacts, fetchUserProfile } from "../utils/googleApi";
import { scope } from "../utils/googleAuth";
import {
  GoogleContact,
  GoogleUserInfo,
  SignInWithGoogleButton,
  SignoutGoogleButton,
} from "./GoogleAuthComponents";

export const GoogleOAuth = () => {
  const [user, setUser] = useState(null); // Initialize as null
  const [profile, setProfile] = useState(null); // Initialize as null
  const [contacts, setContacts] = useState([]); // Initialize contacts as an empty array

  const login = useGoogleLogin({
    onSuccess: (codeResponse) => setUser(codeResponse),
    onError: (error) => alert("Login Failed:", error),
    scope,
  });

  // Log out function to log the user out of Google and set the profile to null
  const logOut = () => {
    googleLogout();
    setProfile(null);
    setContacts([]); // Reset contacts on logout
  };

  useEffect(() => {
    if (user && user.access_token) {
      fetchUserProfile(user.access_token)
        .then((res) => setProfile(res.data))
        .catch((err) => console.log(err));

      fetchUserContacts(user.access_token)
        .then((res) => {
          if (res.data.connections) {
            setContacts(res.data.connections); // Set contacts if data exists
          } else {
            setContacts([]); // Set an empty array if no connections found
          }
        })
        .catch((err) => console.log(err));
    }
  }, [user]);

  return (
    <div>
      {profile ? (
        <div>
          <GoogleUserInfo profile={profile} />
          <SignoutGoogleButton logOut={logOut} />
          <GoogleContact contacts={contacts || []} />
        </div>
      ) : (
        <SignInWithGoogleButton login={login} />
      )}
    </div>
  );
};

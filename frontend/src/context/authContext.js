import axios from "axios";
import { createContext, useCallback, useEffect, useState } from "react";

// Ensures cookie is sent
axios.defaults.withCredentials = true;

const serverUrl = process.env.REACT_APP_SERVER_URL;

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [loggedIn, setLoggedIn] = useState(null);
  const [user, setUser] = useState(null);

  // const checkLoginState = useCallback(async () => {
  //   try {
  //     const {
  //       data: { loggedIn: logged_in, user },
  //     } = await axios.get(`${serverUrl}/auth/logged_in`);
  //     setLoggedIn(logged_in);
  //     user && setUser(user);
  //   } catch (err) {
  //     console.error(err);
  //   }
  // }, []);

  // useEffect(() => {
  //   checkLoginState();
  // }, [checkLoginState]);

  return (
    <AuthContext.Provider value={{ loggedIn, user }}>
      {children}
    </AuthContext.Provider>
  );
};

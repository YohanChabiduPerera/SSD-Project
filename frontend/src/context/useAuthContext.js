import { useContext } from "react";
import { AuthContext } from "./authContext";

export const useAuthContext = () => {
  const { user, loggedIn, checkLoginState } = useContext(AuthContext);

  return {
    user,
    loggedIn,
    checkLoginState,
  };
};

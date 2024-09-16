import {
  returnAuthURL,
  getAuthCode,
  checkLoggedInStateOfUser,
  authLogout,
} from "../controller/authController.js";
import { Router } from "express";

// Create a new router instance
const router = Router();

router.get("/url", returnAuthURL);
router.get("/token", getAuthCode);
router.get("logged_in", checkLoggedInStateOfUser);
router.post("/logout", authLogout);

export default router;

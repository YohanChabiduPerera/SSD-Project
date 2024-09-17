import dotenv from "dotenv";
import queryString from "query-string";
import axios from "axios";
import jwt from "jsonwebtoken";
import logger from "../logger.js"; // Import the logger

// Load environment variables
dotenv.config();

const config = {
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenUrl: "https://oauth2.googleapis.com/token",
  redirectUrl: process.env.REDIRECT_URL,
  tokenSecret: process.env.TOKEN_SECRET,
  tokenExpiration: 36000,
};

const authParams = queryString.stringify({
  client_id: config.clientId,
  redirect_uri: config.redirectUrl,
  response_type: "code",
  scope: "openid profile email",
  access_type: "offline",
  state: "standard_oauth",
  prompt: "consent",
});

const getTokenParams = (code) =>
  queryString.stringify({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    code,
    grant_type: "authorization_code",
    redirect_uri: config.redirectUrl,
  });

const createToken = (user) =>
  jwt.sign({ user }, config.tokenSecret, { expiresIn: config.tokenExpiration });

// Return Google Auth URL
const returnAuthURL = (_, res) => {
  logger.info("Google OAuth URL generated");
  res.json({ url: `${config.authUrl}?${authParams}` });
};

// Get authorization code and exchange it for a token
const getAuthCode = async (req, res) => {
  const { code } = req.query;
  if (!code) {
    logger.warn("Authorization code is missing in the request");
    return res.status(400).json({ message: "Authorization code required" });
  }

  try {
    const { data: { id_token } } = await axios.post(`${config.tokenUrl}?${getTokenParams(code)}`);
    
    if (!id_token) {
      logger.warn("Failed to retrieve ID token from Google OAuth");
      return res.status(400).json({ message: "Auth error" });
    }

    const { email, name, picture } = jwt.decode(id_token);
    const token = createToken({ email, name, picture });

    logger.info(`User authenticated successfully: ${email}`);
    
    res
      .cookie("token", token, {
        maxAge: config.tokenExpiration,
        httpOnly: true,
      })
      .json({ user: { email, name, picture } });
  } catch (err) {
    logger.error(`Failed to authenticate user: ${err.message}`);
    res.status(500).json({ message: err.message || "Server error" });
  }
};

// Check if the user is logged in
const checkLoggedInStateOfUser = (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    logger.info("User is not logged in");
    return res.json({ loggedIn: false });
  }

  try {
    const { user } = jwt.verify(token, config.tokenSecret);
    const newToken = createToken(user);
    
    logger.info(`User logged in: ${user.email}`);

    res
      .cookie("token", newToken, {
        maxAge: config.tokenExpiration,
        httpOnly: true,
      })
      .json({ loggedIn: true, user });
  } catch (err) {
    logger.error("Invalid token, unable to verify user");
    res.json({ loggedIn: false });
  }
};

// Logout the user
const authLogout = (_, res) => {
  logger.info("User logged out successfully");
  res.clearCookie("token").json({ message: "Logged out" });
};

export { returnAuthURL, getAuthCode, checkLoggedInStateOfUser, authLogout };

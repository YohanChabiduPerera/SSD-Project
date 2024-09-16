export const csrfProtection = (req, res, next) => {
  // Extract CSRF token from the request headers (sent by the client)
  const csrfTokenFromHeader = req.headers["x-csrf-token"];

  // Extract CSRF token from the cookies (sent by the client’s browser)
  const csrfTokenFromCookie = req.cookies["csrfToken"];

  // Validate if both tokens exist and match
  if (
    !csrfTokenFromHeader ||
    !csrfTokenFromCookie ||
    csrfTokenFromHeader !== csrfTokenFromCookie
  ) {
    return res.status(403).json({ error: "Invalid CSRF token" });
  }

  // If tokens match, proceed with the request
  next();
};

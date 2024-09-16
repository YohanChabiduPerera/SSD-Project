export const getCsrfToken = () => {
  const csrfCookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrfToken="));

  // Return the CSRF token value if found
  return csrfCookie ? csrfCookie.split("=")[1] : null;
};

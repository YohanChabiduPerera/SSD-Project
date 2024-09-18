import axios from "axios";

// Function to fetch user profile
export const fetchUserProfile = (accessToken) => {
  return axios.get(
    `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${accessToken}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    }
  );
};

// Function to fetch user contacts
export const fetchUserContacts = (accessToken) => {
  return axios.get(
    `https://people.googleapis.com/v1/people/me/connections?personFields=names,emailAddresses`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    }
  );
};

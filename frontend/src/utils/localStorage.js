export const setUserInLocalStorage = (data) => {
  localStorage.setItem(
    "user",
    JSON.stringify({
      _id: data._id,
      userName: data.userName,
      image: data.image,
      role: data.role,
      token: data.token,
      storeID: data.storeID,
      address: data.address,
    })
  );
};

export const getUserFromLocalStorage = () => {
  return JSON.parse(localStorage.getItem("user"));
};

export const clearUserFromLocalStorage = () => {
  localStorage.removeItem("user");
};

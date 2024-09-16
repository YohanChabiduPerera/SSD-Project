// Utility function for handling API errors
export const handleError = (err) => {
  const errorMessage =
    err.response?.data?.err || "Something went wrong. Please try again later.";
  alert(errorMessage);
  console.error("API Error:", err);
};

export const handleItemError = (err) => {
  console.log(err);
  alert(err.message);
  return err.message;
};

export const consoleError = (err) => {
  console.log(err);
};

export const consoleErrorWithAlert = (err, msg) => {
  console.log(err);
  alert(msg);
};

export const cannotFetchStoreNameAlert = () => {
  alert(
    "There seems to be an error. Store Name cannot be fetched at the moment"
  );
};

export const cannotUploadItemAlert = () => {
  alert("There seems to be an error. Item cannot be uploaded at the moment");
};

export const cannotRemoveItemAlert = () => {
  alert("There seems to be an error. Item cannot be removed at the moment");
};

export const cannotModifyAlert = () => {
  alert("There seems to be an error. Item cannot be modified at the moment");
};

export const tryAgainLaterAlert = () => {
  alert("Oops.. We are facing an issue right now. Please try again");
};

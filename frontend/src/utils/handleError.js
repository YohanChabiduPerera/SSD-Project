// Utility function for handling API errors
export const handleError = (err) => {
  const errorMessage =
    err.response?.data?.err || "Something went wrong. Please try again later.";
  alert(errorMessage);
  console.error("API Error:", err);
};

export const handleItemError = (err) => {
  consoleError(err);
  alert(err.message);
  return err.message;
};

export const consoleError = (err) => console.error(err);

export const consoleErrorWithAlert = (err, msg) => {
  consoleError(err);
  alert(msg);
};

// Generalized function for showing alerts
const showAlert = (message) => alert(message);

// Compact predefined alert messages
const alertMessages = {
  cannotFetchStoreName:
    "There seems to be an error. Store Name cannot be fetched at the moment.",
  cannotUploadItem:
    "There seems to be an error. Item cannot be uploaded at the moment.",
  cannotRemoveItem:
    "There seems to be an error. Item cannot be removed at the moment.",
  cannotModify:
    "There seems to be an error. Item cannot be modified at the moment.",
  tryAgainLater: "Oops.. We are facing an issue right now. Please try again.",
};

// Individual alert functions, maintaining compatibility
export const cannotFetchStoreNameAlert = () =>
  showAlert(alertMessages.cannotFetchStoreName);
export const cannotUploadItemAlert = () =>
  showAlert(alertMessages.cannotUploadItem);
export const cannotRemoveItemAlert = () =>
  showAlert(alertMessages.cannotRemoveItem);
export const cannotModifyAlert = () => showAlert(alertMessages.cannotModify);
export const tryAgainLaterAlert = () => showAlert(alertMessages.tryAgainLater);

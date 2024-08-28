export const parseAddress = (url) => {
  const parts = url.split("/");
  const addressPart = parts[parts.length - 2];
  return addressPart.replace(/-/g, " ");
};

export const getBaseUrl = () => {
  return process.env.NODE_ENV === "production"
    ? process.env.REACT_APP_API_URL_PROD
    : process.env.REACT_APP_API_URL_LOCAL;
};

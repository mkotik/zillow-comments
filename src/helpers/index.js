export const parseAddress = (url) => {
  const parts = url.split("/");
  let address = "";
  parts.forEach((part, i) => {
    if (part == "homedetails" || part == "b") {
      address = parts[i + 1];
    }
  });
  return address;
};

export const getBaseUrl = () => {
  return process.env.NODE_ENV === "production"
    ? process.env.REACT_APP_API_URL_PROD
    : process.env.REACT_APP_API_URL_LOCAL;
};

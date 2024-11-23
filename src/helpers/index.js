import { uniqueNamesGenerator, colors, animals } from "unique-names-generator";
export const parseAddress = (url) => {
  const parts = url.split("/");
  let address = "";
  parts.forEach((part, i) => {
    if (part === "homedetails" || part === "b") {
      address = parts[i + 1];
    }
  });
  return address;
};

export const getBaseUrl = () => {
  // return process.env.NODE_ENV === "production"
  //   ? process.env.REACT_APP_API_URL_PROD
  //   : process.env.REACT_APP_API_URL_LOCAL;
  return "https://zillow-comments-production.up.railway.app";
};

export const generateAnonName = () => {
  const randomName = uniqueNamesGenerator({
    dictionaries: [colors, animals],
    style: "capital",
    separator: "",
  });

  return `Anon${randomName}`;
};

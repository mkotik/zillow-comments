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
  return process.env.NODE_ENV === "production"
    ? process.env.REACT_APP_API_URL_PROD
    : process.env.REACT_APP_API_URL_LOCAL;
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

export const formatTimestamp = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInWeeks = Math.floor(diffInDays / 7);
  const diffInMonths = Math.floor(diffInDays / 30);

  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? "s" : ""} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours !== 1 ? "s" : ""} ago`;
  } else if (diffInDays < 14) {
    return `${diffInDays} day${diffInDays !== 1 ? "s" : ""} ago`;
  } else if (diffInWeeks < 12) {
    return `${diffInWeeks} week${diffInWeeks !== 1 ? "s" : ""} ago`;
  } else if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths !== 1 ? "s" : ""} ago`;
  } else {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
};

export const formatDisplayName = (fullNameOrEmail = "") => {
  const raw = String(fullNameOrEmail || "").trim();

  if (!raw) return "User";

  // If it's an email and no name, show local-part
  if (raw.includes("@") && !raw.includes(" ")) {
    return raw.split("@")[0] || "User";
  }

  const parts = raw.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "User";
  if (parts.length === 1) return parts[0];

  const first = parts[0];
  const last = parts[parts.length - 1];
  const lastInitial = last?.[0] ? `${last[0].toUpperCase()}.` : "";
  return `${first} ${lastInitial}`.trim();
};

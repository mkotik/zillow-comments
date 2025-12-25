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

// Display-only: produce a readable label like "326 Broad St, Eatontown, NJ"
// from a Zillow URL or pathname.
export const formatZillowAddressLabel = (urlOrPath = "") => {
  const raw = String(urlOrPath || "").trim();
  if (!raw) return "";

  // If it's a full URL, parse pathname; otherwise treat as a path/string.
  let path = raw;
  try {
    if (raw.includes("://")) path = new URL(raw).pathname;
  } catch (_) {
    // ignore
  }

  const match = path.match(/\/(?:homedetails|b)\/([^/]+)/i);
  if (!match) return "";

  const segment = decodeURIComponent(match[1])
    .split("?")[0]
    .split("#")[0]
    .trim();
  if (!segment) return "";

  const parts = segment.split("-").filter(Boolean);
  if (parts.length < 2) return segment.replace(/-/g, " ");

  // Pull trailing ZIP + state (…-NJ-07724)
  let state = "";
  let zip = "";
  const tokens = [...parts];

  if (/^\d{5}$/.test(tokens[tokens.length - 1] || "")) {
    zip = tokens.pop(); // eslint-disable-line no-unused-vars
  }
  if (/^[A-Za-z]{2}$/.test(tokens[tokens.length - 1] || "")) {
    state = String(tokens.pop() || "").toUpperCase();
  }

  const STREET_SUFFIXES = new Set([
    "st",
    "street",
    "ave",
    "avenue",
    "rd",
    "road",
    "dr",
    "drive",
    "ln",
    "lane",
    "blvd",
    "boulevard",
    "ct",
    "court",
    "cir",
    "circle",
    "pl",
    "place",
    "pkwy",
    "parkway",
    "ter",
    "terrace",
    "way",
    "trl",
    "trail",
    "hwy",
    "highway",
    "sq",
    "square",
  ]);

  const formatToken = (t) => {
    const s = String(t || "");
    if (!s) return s;
    if (/^\d+$/.test(s)) return s;

    const lower = s.toLowerCase();
    const DIR = new Set(["n", "s", "e", "w", "ne", "nw", "se", "sw"]);
    if (DIR.has(lower)) return lower.toUpperCase();

    const SUFFIX_MAP = {
      st: "St",
      street: "St",
      ave: "Ave",
      avenue: "Ave",
      rd: "Rd",
      road: "Rd",
      dr: "Dr",
      drive: "Dr",
      ln: "Ln",
      lane: "Ln",
      blvd: "Blvd",
      boulevard: "Blvd",
      ct: "Ct",
      court: "Ct",
      cir: "Cir",
      circle: "Cir",
      pl: "Pl",
      place: "Pl",
      pkwy: "Pkwy",
      parkway: "Pkwy",
      ter: "Ter",
      terrace: "Ter",
      way: "Way",
      trl: "Trl",
      trail: "Trl",
      hwy: "Hwy",
      highway: "Hwy",
      sq: "Sq",
      square: "Sq",
    };
    if (SUFFIX_MAP[lower]) return SUFFIX_MAP[lower];

    return lower.charAt(0).toUpperCase() + lower.slice(1);
  };

  // Split street vs city by last recognized street suffix; fallback to last token as city.
  let suffixIdx = -1;
  for (let i = tokens.length - 1; i >= 0; i--) {
    if (STREET_SUFFIXES.has(String(tokens[i]).toLowerCase())) {
      suffixIdx = i;
      break;
    }
  }

  let streetTokens = [];
  let cityTokens = [];
  if (suffixIdx !== -1 && suffixIdx < tokens.length - 1) {
    streetTokens = tokens.slice(0, suffixIdx + 1);
    cityTokens = tokens.slice(suffixIdx + 1);
  } else {
    cityTokens = tokens.slice(-1);
    streetTokens = tokens.slice(0, -1);
  }

  const street = streetTokens.map(formatToken).join(" ").trim();
  const city = cityTokens.map(formatToken).join(" ").trim();

  if (street && city && state) return `${street}, ${city}, ${state}`;
  if (street && city) return `${street}, ${city}`;
  return street || segment.replace(/-/g, " ");
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

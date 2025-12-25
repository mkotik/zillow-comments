import React from "react";
import { formatZillowAddressLabel } from "./helpers";

export default function ZillowUrlStateExample({ zillowUrlState }) {
  const label = formatZillowAddressLabel(
    zillowUrlState?.href || zillowUrlState?.pathname || ""
  );

  return (
    <div
      style={{
        padding: 8,
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
        fontSize: 12,
        opacity: 0.9,
      }}
    >
      <div style={{ fontWeight: 700 }}>
        {label || "(waiting for Zillow URL...)"}
      </div>
    </div>
  );
}



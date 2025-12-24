import React from "react";
import { useZillowUrlState } from "./hooks/useZillowUrlState";

export default function ZillowUrlStateExample() {
  const zillowUrlState = useZillowUrlState();

  return (
    <div
      style={{
        padding: 8,
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
        fontSize: 12,
        opacity: 0.9,
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 4 }}>Zillow URL state</div>
      <div>
        <span style={{ opacity: 0.7 }}>href: </span>
        <span>{zillowUrlState?.href || "(waiting for postMessage...)"}</span>
      </div>
    </div>
  );
}



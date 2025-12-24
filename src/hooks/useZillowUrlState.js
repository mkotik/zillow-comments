import { useEffect, useState } from "react";

const ZILLOW_ORIGIN = "https://www.zillow.com";
const MESSAGE_TYPE = "ZILLOW_URL_STATE";

/**
 * Listen for Zillow parent-page URL state updates via window.postMessage.
 *
 * Accepted messages:
 * - event.origin === "https://www.zillow.com"
 * - event.data.type === "ZILLOW_URL_STATE"
 * - event.data.payload: { href, pathname, search, hash, ts?, reason? }
 *
 * On mount, sends handshake:
 *   window.parent.postMessage({ type: "IFRAME_READY" }, "*")
 */
export function useZillowUrlState() {
  const [state, setState] = useState(null);

  useEffect(() => {
    // Handshake: ask parent to send the latest URL state
    try {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: "IFRAME_READY" }, "*");
      }
    } catch (e) {
      // ignore
    }

    const onMessage = (event) => {
      // Security: only accept messages from Zillow origin
      if (!event || event.origin !== ZILLOW_ORIGIN) return;

      const data = event.data;
      if (!data || typeof data !== "object") return;
      if (data.type !== MESSAGE_TYPE) return;

      const payload = data.payload;
      if (!payload || typeof payload !== "object") return;

      const { href, pathname, search, hash, ts, reason } = payload;
      if (typeof href !== "string") return;

      console.log("[ZILLOW_URL_STATE] payload:", payload);
      if (typeof reason !== "undefined" || typeof ts !== "undefined") {
        console.log("[ZILLOW_URL_STATE] meta:", { reason, ts });
      }

      setState({
        href,
        pathname: typeof pathname === "string" ? pathname : "",
        search: typeof search === "string" ? search : "",
        hash: typeof hash === "string" ? hash : "",
        ts,
        reason,
      });
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return state;
}



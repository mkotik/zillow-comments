import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { Box, Typography } from "@mui/material";

/**
 * ExpandableText
 * - Collapses to a fixed number of rendered lines via CSS line-clamp
 * - Shows a Show more / Show less toggle only when the content overflows
 */
const ExpandableText = ({
  text,
  lines = 5,
  variant = "body1",
  contentClassName = "",
  sx,
  typographySx,
}) => {
  const reactId = useId();
  const contentId = useMemo(
    () => `expandable-text-${reactId.replace(/[^a-zA-Z0-9_-]/g, "")}`,
    [reactId]
  );

  const [expanded, setExpanded] = useState(false);
  const [canExpand, setCanExpand] = useState(false);
  const contentRef = useRef(null);

  // If the text changes, reset back to collapsed and re-measure.
  useEffect(() => {
    setExpanded(false);
  }, [text, lines]);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    let raf = 0;
    const measure = () => {
      // Only relevant when collapsed; if expanded, keep whatever we measured.
      if (expanded) return;
      // scrollHeight can be fractional; use a tiny threshold.
      const overflow = el.scrollHeight - el.clientHeight > 1;
      setCanExpand(overflow);
    };

    const scheduleMeasure = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };

    // Measure after layout/paint.
    scheduleMeasure();

    // Re-measure on resize and when the element itself changes size.
    window.addEventListener("resize", scheduleMeasure);

    let ro;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => scheduleMeasure());
      ro.observe(el);
    }

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("resize", scheduleMeasure);
      if (ro) ro.disconnect();
    };
  }, [expanded, text, lines]);

  const showToggle = canExpand;

  return (
    <Box className="expandable-text" sx={sx}>
      <Typography
        id={contentId}
        ref={contentRef}
        variant={variant}
        className={[
          "expandable-text__content",
          !expanded ? "expandable-text__content--collapsed" : "",
          showToggle && !expanded ? "expandable-text__content--faded" : "",
          contentClassName,
        ]
          .filter(Boolean)
          .join(" ")}
        sx={typographySx}
        style={{ "--expandable-lines": lines }}
      >
        {text}
      </Typography>

      {showToggle && (
        <button
          type="button"
          className="expandable-text__toggle"
          aria-expanded={expanded}
          aria-controls={contentId}
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </Box>
  );
};

export default ExpandableText;



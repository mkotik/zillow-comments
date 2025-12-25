import React from "react";
import { Box, IconButton, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useLocation, useNavigate } from "react-router-dom";

export default function SettingsPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from;
  const fromPath =
    from && typeof from === "object" && typeof from.pathname === "string"
      ? `${from.pathname}${from.search || ""}${from.hash || ""}`
      : "/comments";

  const goBack = () => {
    navigate(fromPath, { replace: true });
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: 2,
          pt: 1,
        }}
      >
        <IconButton onClick={goBack} size="small" aria-label="Back">
          <ArrowBackIcon />
        </IconButton>
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 700, fontSize: "0.875rem" }}
        >
          Settings
        </Typography>
      </Box>

      {/* Intentionally empty for now */}
    </Box>
  );
}

import React, { useMemo, useRef, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useLocation, useNavigate } from "react-router-dom";
import api, { authStorage } from "./api/client";

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

  const fileInputRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [pictureOverride, setPictureOverride] = useState(null);

  const currentUser = useMemo(() => authStorage.getUser(), []);
  const displayName = currentUser?.name || currentUser?.email || "User";
  const picture = pictureOverride ?? currentUser?.picture ?? "";

  const uploadAndSave = async (file) => {
    setError("");
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("attachments", file);

      const uploadRes = await api.post("/files/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const uploaded = uploadRes?.data?.attachments?.[0];
      const url = uploaded?.url;
      if (!url) throw new Error("Upload did not return a URL");

      const meRes = await api.patch("/auth/me", { profilePictureUrl: url });
      const updatedUser = meRes?.data?.user;
      if (updatedUser) authStorage.setUser(updatedUser);

      setPictureOverride(updatedUser?.picture || url);
    } catch (e) {
      setError(
        e?.response?.data?.message ||
          e?.message ||
          "Failed to update profile picture"
      );
    } finally {
      setSaving(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const clearPicture = async () => {
    setError("");
    setSaving(true);
    try {
      const meRes = await api.patch("/auth/me", { profilePictureUrl: "" });
      const updatedUser = meRes?.data?.user;
      if (updatedUser) authStorage.setUser(updatedUser);
      setPictureOverride(updatedUser?.picture || "");
    } catch (e) {
      setError(
        e?.response?.data?.message ||
          e?.message ||
          "Failed to remove profile picture"
      );
    } finally {
      setSaving(false);
    }
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

      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Avatar
          src={picture || undefined}
          alt={displayName}
          sx={{ width: 64, height: 64 }}
        />
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontWeight: 700, mb: 0.5 }}>
            {displayName}
          </Typography>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              uploadAndSave(file);
            }}
          />

          <Box
            sx={{
              display: "flex",
              gap: 1,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <Button
              variant="contained"
              onClick={() => fileInputRef.current?.click()}
              disabled={saving}
            >
              {saving ? (
                <CircularProgress size={18} />
              ) : (
                "Upload profile picture"
              )}
            </Button>

            <Button
              variant="text"
              onClick={clearPicture}
              disabled={saving || !picture}
            >
              Remove
            </Button>
          </Box>

          {!!error && (
            <Typography variant="body2" sx={{ mt: 1, color: "error.main" }}>
              {error}
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}

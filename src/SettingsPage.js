import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PhotoCameraOutlinedIcon from "@mui/icons-material/PhotoCameraOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
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

  const MAX_PROFILE_PIC_BYTES = 5 * 1024 * 1024; // 5MB

  const [user, setUser] = useState(() => authStorage.getUser());
  const picture = pictureOverride ?? user?.picture ?? "";

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await api.get("/auth/me");
        const freshUser = res?.data?.user;
        if (!freshUser) return;
        authStorage.setUser(freshUser);
        if (alive) setUser(freshUser);
      } catch (_) {
        // ignore: Settings should still render from cached user even if API is unreachable
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const uploadAndSave = async (file) => {
    setError("");
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("attachments", file);

      const uploadRes = await api.post(
        "/files/upload?purpose=profile",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      const uploaded = uploadRes?.data?.attachments?.[0];
      const url = uploaded?.url;
      if (!url) throw new Error("Upload did not return a URL");

      const meRes = await api.patch("/auth/me", {
        profilePictureUrl: url,
        profilePictureHidden: false,
      });
      const updatedUser = meRes?.data?.user;
      if (updatedUser) {
        authStorage.setUser(updatedUser);
        setUser(updatedUser);
      }

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
    const prevPicture = picture;
    // Optimistic clear: immediately remove any currently-rendered avatar src
    setPictureOverride("");

    setSaving(true);
    try {
      const meRes = await api.patch("/auth/me", {
        profilePictureUrl: "",
        profilePictureHidden: true,
      });
      const updatedUser = meRes?.data?.user;
      if (updatedUser) {
        authStorage.setUser(updatedUser);
        setUser(updatedUser);
      }
      setPictureOverride(updatedUser?.picture || "");
    } catch (e) {
      // Revert if the API call fails
      setPictureOverride(prevPicture);
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

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          mt: 3,
        }}
      >
        <Avatar
          key={picture || "empty"}
          src={picture || undefined}
          alt="Profile picture"
          imgProps={{
            style: { objectFit: "cover" },
            referrerPolicy: "no-referrer",
          }}
          sx={{
            width: 84,
            height: 84,
            bgcolor: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.14)",
            boxShadow: "0 6px 18px rgba(0,0,0,0.35)",
          }}
        />

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            if (!file.type || !file.type.startsWith("image/")) {
              setError("Please select an image file.");
              e.target.value = "";
              return;
            }
            if (file.size > MAX_PROFILE_PIC_BYTES) {
              setError("Max profile picture size is 5MB.");
              e.target.value = "";
              return;
            }
            uploadAndSave(file);
          }}
        />

        <Box
          sx={{
            display: "flex",
            gap: 1.25,
            alignItems: "center",
            flexWrap: "wrap",
            mt: 2,
          }}
        >
          <Button
            variant="text"
            onClick={() => fileInputRef.current?.click()}
            disabled={saving}
            startIcon={
              saving ? (
                <CircularProgress size={16} />
              ) : (
                <PhotoCameraOutlinedIcon />
              )
            }
            sx={{
              textTransform: "none",
              fontWeight: 700,
              px: 1.5,
              py: 0.75,
              borderRadius: 999,
              bgcolor: "rgba(255,255,255,0.08)",
              "&:hover": { bgcolor: "rgba(255,255,255,0.12)" },
            }}
          >
            Change photo
          </Button>

          <Button
            variant="text"
            color="error"
            onClick={clearPicture}
            disabled={saving || !picture}
            startIcon={<DeleteOutlineOutlinedIcon />}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              px: 1.5,
              py: 0.75,
              borderRadius: 999,
              bgcolor: "rgba(255,255,255,0.02)",
              "&:hover": { bgcolor: "rgba(255,255,255,0.06)" },
            }}
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
  );
}

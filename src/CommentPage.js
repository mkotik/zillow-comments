import React, { useState, useEffect } from "react";
import {
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Divider,
  CircularProgress,
  IconButton,
  Tooltip,
} from "@mui/material";
import Comment from "./Comment";
import { useLocation, useNavigate } from "react-router-dom";
import { parseAddress, formatDisplayName } from "./helpers";
import ChatIcon from "./assets/chatIcon";
import LogoutIcon from "@mui/icons-material/Logout";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import ClearIcon from "@mui/icons-material/Clear";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DescriptionIcon from "@mui/icons-material/Description";
import TableChartIcon from "@mui/icons-material/TableChart";
import api, { authStorage } from "./api/client";
import { useZillowUrlState } from "./hooks/useZillowUrlState";

const MAX_COMMENT_LENGTH = 400;

const CommentPage = () => {
  const navigate = useNavigate();
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const location = useLocation();
  const currentUser = authStorage.getUser();
  const zillowUrlState = useZillowUrlState();

  const addressSource = zillowUrlState?.pathname || zillowUrlState?.href || "";
  const address = parseAddress(addressSource);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        if (!address) return;
        const response = await api.get(`/comments`, {
          params: { address },
        });
        console.log("Fetched comments:", response.data);
        setComments(response.data);
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };

    fetchComments();
  }, [address]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim() && attachments.length === 0) return;
    if (!address) return;

    try {
      const response = await api.post(`/comments`, {
        address,
        content: comment,
        attachments: attachments,
        date: new Date().toISOString(),
      });

      console.log("Comment submitted:", response.data);
      setComments(response.data);
      setComment("");
      setAttachments([]);
    } catch (error) {
      console.error("Error submitting comment:", error);
    }
  };

  const handleUploadComplete = (uploadedAttachments) => {
    setAttachments((prev) => {
      // Limit to 6 files total
      const combined = [...prev, ...uploadedAttachments];
      if (combined.length > 6) {
        // If over the limit, keep only the first 6
        return combined.slice(0, 6);
      }
      return combined;
    });
  };

  const handleSignOut = async () => {
    try {
      await api.post("/auth/logout");
    } catch (e) {
      // ignore
    } finally {
      authStorage.clearAll();
      navigate("/login", { replace: true });
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 600, mx: "auto", mt: 4 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pb: 1,
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          Signed in as{" "}
          {formatDisplayName(currentUser?.name || currentUser?.email || "User")}
        </Typography>
        <Tooltip title="Sign out">
          <IconButton onClick={handleSignOut} size="small">
            <LogoutIcon />
          </IconButton>
        </Tooltip>
      </Box>
      <Divider sx={{ mb: 2 }} />

      {!address && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Waiting for Zillow URL…
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            This iframe uses the parent Zillow page URL to decide which home
            comments to load.
          </Typography>
          <Typography variant="caption" sx={{ display: "block", mt: 1 }}>
            href: {zillowUrlState?.href || "(not received yet)"}
          </Typography>
        </Box>
      )}

      <form onSubmit={handleSubmit} className="comment-form">
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "row" },
            justifyContent: "center",
            "@media (max-width: 400px)": {
              flexDirection: "column",
              justifyContent: "flex-start !important",
            },
            gap: "10px",
            width: "100%",
            alignItems: "stretch",
          }}
        >
          <Box sx={{ position: "relative", width: "100%", flexGrow: 1 }}>
            <TextField
              fullWidth
              placeholder="Your Comment"
              className="comment-input"
              variant="outlined"
              multiline
              rows={4}
              value={comment}
              onChange={(e) => {
                if (e.target.value.length <= MAX_COMMENT_LENGTH) {
                  setComment(e.target.value);
                }
              }}
              disabled={!address}
              InputLabelProps={{ shrink: false }}
              sx={{
                "& legend": { display: "none" },
                "& fieldset": { top: 0 },
                position: "relative", // Ensure position is relative for overlay
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              // Use dragenter instead of dragover for less frequent events
              onDragEnter={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Add class to parent container for better targeting
                e.currentTarget.classList.add("drag-over");
              }}
              onDragOver={(e) => {
                // Just prevent default to allow drop, but don't add class here
                e.preventDefault();
                e.stopPropagation();
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Only remove class if we're leaving the actual text field (not a child element)
                if (
                  e.currentTarget === e.target ||
                  !e.currentTarget.contains(e.relatedTarget)
                ) {
                  e.currentTarget.classList.remove("drag-over");
                }
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                e.currentTarget.classList.remove("drag-over");

                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                  if (attachments.length >= 6) {
                    alert("Maximum 6 files allowed per comment");
                    return;
                  }

                  const fileUploader = async () => {
                    setUploading(true);
                    try {
                      const formData = new FormData();
                      const filesToUpload = Array.from(
                        e.dataTransfer.files
                      ).slice(0, 6 - attachments.length);

                      filesToUpload.forEach((file) => {
                        formData.append("attachments", file);
                      });

                      const response = await api.post(
                        `/files/upload`,
                        formData,
                        {
                          headers: {
                            "Content-Type": "multipart/form-data",
                          },
                        }
                      );

                      handleUploadComplete(response.data.attachments);
                    } catch (error) {
                      console.error("Error uploading files:", error);
                    } finally {
                      setUploading(false);
                    }
                  };

                  fileUploader();
                }
              }}
              InputProps={{
                // Add drag overlay div inside TextField
                startAdornment: (
                  <Box
                    className="drag-overlay"
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: "none", // Hidden by default, shown via .drag-over class
                      alignItems: "center",
                      justifyContent: "center",
                      zIndex: 10,
                    }}
                  >
                    <Box className="drag-overlay-text">Drop files here</Box>
                  </Box>
                ),
                // Keep the original endAdornment with the upload button
                endAdornment: (
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: "8px",
                      right: "8px",
                      zIndex: 11, // Higher than overlay
                    }}
                  >
                    <input
                      type="file"
                      id="comment-file-input"
                      multiple
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          const fileUploader = async () => {
                            setUploading(true);
                            try {
                              const formData = new FormData();
                              Array.from(e.target.files).forEach((file) => {
                                formData.append("attachments", file);
                              });

                              const response = await api.post(
                                `/files/upload`,
                                formData,
                                {
                                  headers: {
                                    "Content-Type": "multipart/form-data",
                                  },
                                }
                              );

                              handleUploadComplete(response.data.attachments);
                            } catch (error) {
                              console.error("Error uploading files:", error);
                            } finally {
                              setUploading(false);
                              // Clear the input
                              e.target.value = null;
                            }
                          };

                          fileUploader();
                        }
                      }}
                      style={{ display: "none" }}
                      accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                    />
                    <Button
                      onClick={() => {
                        if (!address) return;
                        if (attachments.length >= 6) {
                          alert("Maximum 6 files allowed per comment");
                          return;
                        }
                        document.getElementById("comment-file-input").click();
                      }}
                      disabled={!address}
                      sx={{
                        minWidth: "36px",
                        width: "36px",
                        height: "36px",
                        padding: 0,
                        borderRadius: "50%",
                      }}
                    >
                      {uploading ? (
                        <CircularProgress size={20} />
                      ) : (
                        <AttachFileIcon fontSize="small" />
                      )}
                    </Button>
                  </Box>
                ),
              }}
            />
            <Typography
              variant="caption"
              sx={{
                display: "block",
                textAlign: "right",
                mt: 0.5,
                color:
                  comment.length >= MAX_COMMENT_LENGTH ? "#ff6b6b" : "inherit",
              }}
            >
              {comment.length}/{MAX_COMMENT_LENGTH} characters
            </Typography>

            {/* Attachment previews below the text input */}
            {attachments.length > 0 && (
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "8px",
                  mt: 1,
                  mb: 1,
                }}
              >
                {attachments.map((attachment, index) => (
                  <Box
                    key={index}
                    sx={{
                      width: "40px",
                      height: "40px",
                      position: "relative",
                      borderRadius: "4px",
                      overflow: "hidden",
                      border: "1px solid #e0e0e0",
                      backgroundColor: "#f5f5f5",
                      "&:hover .delete-icon": {
                        display: "flex",
                      },
                    }}
                  >
                    {attachment.isImage ? (
                      <img
                        src={attachment.url}
                        alt={attachment.filename}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {attachment.contentType.includes("pdf") ? (
                          <PictureAsPdfIcon sx={{ color: "#f44336" }} />
                        ) : attachment.contentType.includes("word") ||
                          attachment.contentType.includes("document") ? (
                          <DescriptionIcon sx={{ color: "#2196f3" }} />
                        ) : attachment.contentType.includes("excel") ||
                          attachment.contentType.includes("sheet") ? (
                          <TableChartIcon sx={{ color: "#006aff" }} />
                        ) : (
                          <InsertDriveFileIcon sx={{ color: "#757575" }} />
                        )}
                      </Box>
                    )}
                    <Box
                      className="delete-icon"
                      sx={{
                        position: "absolute",
                        top: 0,
                        right: 0,
                        bottom: 0,
                        left: 0,
                        backgroundColor: "rgba(0,0,0,0.5)",
                        display: "none",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        const newAttachments = [...attachments];
                        newAttachments.splice(index, 1);
                        setAttachments(newAttachments);
                      }}
                    >
                      <ClearIcon sx={{ color: "white" }} />
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "5px",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Button
              className="comment-button general-button"
              type="submit"
              variant="contained"
              disabled={!address || (!comment.trim() && attachments.length === 0)}
              sx={{
                minWidth: { sm: "180px" },
                height: { xs: "50px", sm: "100px" },
                gap: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                width: { xs: "100%", sm: "auto" },
                "&:hover": {
                  backgroundColor: "#005ce0 !important",
                },
              }}
            >
              <ChatIcon />
              Post Comment
            </Button>
          </Box>
        </Box>
      </form>

      {comments.map((comment, index) => (
        <Comment
          key={index}
          name={comment.name}
          content={comment.content}
          date={comment.date}
          id={comment.id}
          replies={comment.replies}
          attachments={comment.attachments}
          setComments={setComments}
        />
      ))}
    </Paper>
  );
};

export default CommentPage;

import React, { useState } from "react";
import {
  Box,
  Typography,
  Avatar,
  Button,
  TextField,
  Divider,
  CircularProgress,
} from "@mui/material";
import ReplyComment from "./ReplyComment";
import { useLocation } from "react-router-dom";
import { parseAddress } from "./helpers";
import ChatIcon from "./assets/chatIcon";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import ClearIcon from "@mui/icons-material/Clear";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DescriptionIcon from "@mui/icons-material/Description";
import TableChartIcon from "@mui/icons-material/TableChart";
import { formatDisplayName } from "./helpers";
import { formatTimestamp } from "./helpers";
import AttachmentPreview from "./AttachmentPreview";
import api from "./api/client";

const MAX_REPLY_LENGTH = 200;

const Comment = ({
  name,
  content,
  date,
  replies,
  attachments,
  id,
  setComments,
}) => {
  const displayName = formatDisplayName(name);
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [replyAttachments, setReplyAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const location = useLocation();

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyContent.trim() && replyAttachments.length === 0) return;

    try {
      const response = await api.post(`/replycomments`, {
        address: parseAddress(location.pathname),
        content: replyContent,
        attachments: replyAttachments,
        parentCommentId: id,
        date: new Date().toISOString(),
      });

      console.log("Reply submitted:", response.data);
      setComments(response.data);
      setReplyContent("");
      setReplyAttachments([]);
      setIsReplying(false);
    } catch (error) {
      console.error("Error submitting reply:", error);
    }
  };

  const handleReplyUploadComplete = (uploadedAttachments) => {
    setReplyAttachments((prev) => {
      // Limit to 6 files total
      const combined = [...prev, ...uploadedAttachments];
      if (combined.length > 6) {
        // If over the limit, keep only the first 6
        return combined.slice(0, 6);
      }
      return combined;
    });
  };

  return (
    <Box
      sx={{
        mb: 2,
        padding: 2,
      }}
      className="comment"
    >
      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
        <Avatar sx={{ mr: 1 }}>{(displayName && displayName[0]) || "?"}</Avatar>
        <Typography variant="subtitle1">{displayName}</Typography>
        <Typography variant="caption" sx={{ ml: "auto" }}>
          {formatTimestamp(date)}
        </Typography>
      </Box>

      <Typography className="comment-content" variant="body1">
        {content}
      </Typography>

      {/* Display attachments if any */}
      {attachments && attachments.length > 0 && (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
            mt: 1,
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
                cursor: "pointer",
              }}
              onClick={() => {
                if (attachment.url) {
                  window.open(attachment.url, "_blank");
                }
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
                  {attachment.contentType?.includes("pdf") ? (
                    <PictureAsPdfIcon sx={{ color: "#f44336" }} />
                  ) : attachment.contentType?.includes("word") ||
                    attachment.contentType?.includes("document") ? (
                    <DescriptionIcon sx={{ color: "#2196f3" }} />
                  ) : attachment.contentType?.includes("excel") ||
                    attachment.contentType?.includes("sheet") ? (
                    <TableChartIcon sx={{ color: "#4caf50" }} />
                  ) : (
                    <InsertDriveFileIcon sx={{ color: "#757575" }} />
                  )}
                </Box>
              )}
            </Box>
          ))}
        </Box>
      )}

      <Box display="flex" justifyContent="flex-start">
        <Button
          sx={{ mt: 1, mb: 1 }}
          onClick={() => setIsReplying(!isReplying)}
          className="general-button"
        >
          {isReplying ? "Cancel" : "Reply"}
        </Button>
      </Box>

      {isReplying && (
        <Box
          sx={{
            mt: 2,
            display: "flex",
            flexDirection: { xs: "column", sm: "row" }, // Column on small screens, row on medium and up
            alignItems: { xs: "stretch", sm: "flex-start" },
            marginBottom: "20px",
            gap: "10px",
          }}
        >
          <Box
            sx={{
              position: "relative",
              width: "100%",
              flexGrow: 1,
            }}
          >
            <TextField
              className="comment-input reply-comment-input"
              fullWidth
              multiline
              rows={2}
              variant="outlined"
              placeholder="Your Reply"
              value={replyContent}
              onChange={(e) => {
                if (e.target.value.length <= MAX_REPLY_LENGTH) {
                  setReplyContent(e.target.value);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleReplySubmit(e);
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
                  if (replyAttachments.length >= 6) {
                    alert("Maximum 6 files allowed per reply");
                    return;
                  }

                  const fileUploader = async () => {
                    setUploading(true);
                    try {
                      const formData = new FormData();
                      const filesToUpload = Array.from(
                        e.dataTransfer.files
                      ).slice(0, 6 - replyAttachments.length);

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

                      handleReplyUploadComplete(response.data.attachments);
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
                      id="reply-file-input"
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

                              handleReplyUploadComplete(
                                response.data.attachments
                              );
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
                        if (replyAttachments.length >= 6) {
                          alert("Maximum 6 files allowed per reply");
                          return;
                        }
                        document.getElementById("reply-file-input").click();
                      }}
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
                  replyContent.length >= MAX_REPLY_LENGTH
                    ? "#ff6b6b"
                    : "inherit",
              }}
            >
              {replyContent.length}/{MAX_REPLY_LENGTH} characters
            </Typography>

            {/* Reply attachments below the text input */}
            {replyAttachments.length > 0 && (
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "8px",
                  mt: 1,
                  mb: 1,
                }}
              >
                {replyAttachments.map((attachment, index) => (
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
                          <TableChartIcon sx={{ color: "#4caf50" }} />
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
                        const newAttachments = [...replyAttachments];
                        newAttachments.splice(index, 1);
                        setReplyAttachments(newAttachments);
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
              variant="contained"
              onClick={handleReplySubmit}
              disabled={!replyContent.trim() && replyAttachments.length === 0}
              sx={{
                minWidth: { sm: "120px" },
                height: { xs: "50px", sm: "56px" },
                display: "flex",
                gap: 1,
                justifyContent: "center",
                width: { xs: "100%", sm: "auto" },
              }}
              className="general-button"
            >
              <ChatIcon />
              Submit
            </Button>
          </Box>
        </Box>
      )}

      {replies &&
        replies.map((reply) => (
          <ReplyComment
            key={reply.id}
            name={reply.name}
            content={reply.content}
            attachments={reply.attachments}
            date={reply.date}
          />
        ))}
    </Box>
  );
};

export default Comment;

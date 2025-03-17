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
import { getBaseUrl } from "./helpers";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { parseAddress } from "./helpers";
import ChatIcon from "./assets/chatIcon";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import ClearIcon from "@mui/icons-material/Clear";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DescriptionIcon from "@mui/icons-material/Description";
import TableChartIcon from "@mui/icons-material/TableChart";
import { generateAnonName } from "./helpers";
import Cookies from "js-cookie";
import { useForceRerender } from "./hooks/useForceRerender";
import { formatTimestamp } from "./helpers";
import AttachmentPreview from "./AttachmentPreview";

const MAX_REPLY_LENGTH = 200;

const Comment = ({
  name,
  content,
  date,
  replies,
  attachments,
  id,
  setComments,
  setName,
  activeName,
}) => {
  const forceRerender = useForceRerender();
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [replyAttachments, setReplyAttachments] = useState([]);
  const location = useLocation();

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyContent.trim() && replyAttachments.length === 0) return;

    let currentName = activeName;
    if (currentName.trim() === "") {
      currentName = Cookies.get("name");
    } else {
      Cookies.set("name", currentName, {
        sameSite: "None",
        secure: true,
      });
      forceRerender();
    }
    if (!currentName) {
      currentName = generateAnonName();
      Cookies.set("name", currentName, {
        sameSite: "None",
        secure: true,
      });
      setName(currentName);
    }
    try {
      const baseUrl = getBaseUrl();
      const response = await axios.post(`${baseUrl}/replycomments`, {
        address: parseAddress(location.pathname),
        name: currentName,
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
    setReplyAttachments((prev) => [...prev, ...uploadedAttachments]);
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
        <Avatar sx={{ mr: 1 }}>{name[0]}</Avatar>
        <Typography variant="subtitle1">{name}</Typography>
        <Typography variant="caption" sx={{ ml: "auto" }}>
          {formatTimestamp(date)}
        </Typography>
      </Box>

      <Typography className="comment-content" variant="body1">
        {content}
      </Typography>

      {/* Display attachments if any */}
      {attachments && attachments.length > 0 && (
        <AttachmentPreview attachments={attachments} />
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
        <Box sx={{ mb: 3 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              alignItems: "stretch",
              gap: "10px",
              mb: 1,
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
                InputProps={{
                  endAdornment: (
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: "8px",
                        right: "8px",
                        zIndex: 1,
                      }}
                    >
                      <input
                        type="file"
                        id="reply-file-input"
                        multiple
                        onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            const fileUploader = async () => {
                              try {
                                const formData = new FormData();
                                Array.from(e.target.files).forEach((file) => {
                                  formData.append("attachments", file);
                                });

                                const baseUrl = getBaseUrl();
                                const response = await axios.post(
                                  `${baseUrl}/files/upload`,
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
                        onClick={() =>
                          document.getElementById("reply-file-input").click()
                        }
                        sx={{
                          minWidth: "36px",
                          width: "36px",
                          height: "36px",
                          padding: 0,
                          borderRadius: "50%",
                        }}
                      >
                        <AttachFileIcon fontSize="small" />
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
                        width: "50px",
                        height: "50px",
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

            <Box sx={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <Button
                variant="contained"
                onClick={handleReplySubmit}
                disabled={!replyContent.trim() && replyAttachments.length === 0}
                sx={{
                  minWidth: {
                    xs: "120px",
                    "@media (max-width: 500px)": "100%",
                  },
                  height: { xs: "56px" },
                  display: "flex",
                  gap: 1,
                  justifyContent: "center",
                }}
                className="general-button"
              >
                <ChatIcon />
                Submit
              </Button>
            </Box>
          </Box>

          {/* FileUpload component removed since we now have inline attachment functionality */}

          {/* Removed external attachment preview since it's now shown in the textarea */}
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

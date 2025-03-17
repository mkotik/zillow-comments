import React, { useState, useEffect } from "react";
import {
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Divider,
} from "@mui/material";
import Comment from "./Comment";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { parseAddress, getBaseUrl } from "./helpers";
import ChatIcon from "./assets/chatIcon";
import Cookies from "js-cookie";
import EditIcon from "@mui/icons-material/Edit";
import DoneIcon from "@mui/icons-material/Done";
import { generateAnonName } from "./helpers";
import { useForceRerender } from "./hooks/useForceRerender";
import FileUpload from "./FileUpload";
import AttachmentPreview from "./AttachmentPreview";

const MAX_COMMENT_LENGTH = 400;
const MAX_NAME_LENGTH = 30;

const CommentPage = () => {
  const forceRerender = useForceRerender();
  const [name, setName] = useState(
    Cookies.get("name") ? Cookies.get("name") : ""
  );
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const location = useLocation();

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const baseUrl = getBaseUrl();
        const address = parseAddress(location.pathname);
        const response = await axios.get(`${baseUrl}/comments`, {
          params: { address },
        });
        console.log("Fetched comments:", response.data);
        setComments(response.data);
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };

    fetchComments();
  }, [location.pathname]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim() && attachments.length === 0) return;

    const anonymousName = generateAnonName();
    console.log(name);
    Cookies.set("name", name.trim() === "" ? anonymousName : name.trim(), {
      sameSite: "None",
      secure: true,
    });
    try {
      const baseUrl = getBaseUrl();
      const response = await axios.post(`${baseUrl}/comments`, {
        address: parseAddress(location.pathname),
        name: name.trim() === "" ? anonymousName : name.trim(),
        content: comment,
        attachments: attachments,
        date: new Date().toISOString(),
      });

      console.log("Comment submitted:", response.data);
      setComments(response.data);
      setName(Cookies.get("name") || "");
      setComment("");
      setAttachments([]);
    } catch (error) {
      console.error("Error submitting comment:", error);
    }
  };

  const handleUploadComplete = (uploadedAttachments) => {
    setAttachments(uploadedAttachments);
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 600, mx: "auto", mt: 4 }}>
      <form onSubmit={handleSubmit} className="comment-form">
        {Cookies.get("name") ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              height: "57.5px",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography sx={{ fontWeight: "bold" }}>Name: </Typography>
              <Typography>{Cookies.get("name")}</Typography>
            </Box>
            <Button
              className="general-button"
              sx={{ height: "57.5px" }}
              onClick={() => {
                Cookies.remove("name", {
                  sameSite: "None",
                  secure: true,
                });
                setName("");
              }}
            >
              <EditIcon />
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: "flex", width: "100%", gap: "10px" }}>
            <TextField
              fullWidth
              placeholder="Your Name (Optional)"
              className="comment-input"
              variant="outlined"
              value={name}
              onChange={(e) => {
                if (e.target.value.length <= MAX_NAME_LENGTH) {
                  setName(e.target.value);
                }
              }}
              InputLabelProps={{ shrink: false }}
              sx={{
                "& legend": { display: "none" },
                "& fieldset": { top: 0 },
              }}
            />
            <Button
              className="general-button"
              onClick={() => {
                let newName;
                if (name.trim() === "") {
                  newName = generateAnonName();
                } else {
                  newName = name.trim();
                }
                Cookies.set("name", newName, {
                  sameSite: "None",
                  secure: true,
                });
                setName(newName);
                forceRerender();
              }}
            >
              <DoneIcon />
            </Button>
          </Box>
        )}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
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
              InputLabelProps={{ shrink: false }}
              sx={{
                "& legend": { display: "none" },
                "& fieldset": { top: 0 },
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
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
              disabled={!comment.trim() && attachments.length === 0}
              sx={{
                minWidth: { xs: "180px", "@media (max-width: 300px)": "100%" },
                height: { xs: "100px" },
                gap: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                "&:hover": {
                  backgroundColor: "#2a934a !important",
                },
              }}
            >
              <ChatIcon />
              Post Comment
            </Button>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* File upload component */}
        <FileUpload onUploadComplete={handleUploadComplete} />

        {/* Attachment preview */}
        {attachments.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Attachments ({attachments.length})
            </Typography>
            <AttachmentPreview attachments={attachments} />
            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={() => setAttachments([])}
              sx={{ mt: 1 }}
            >
              Clear All Attachments
            </Button>
          </Box>
        )}
      </form>

      {comments.map((comment, index) => (
        <Comment
          setName={setName}
          key={index}
          activeName={name}
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

import React, { useState } from "react";
import { Box, Typography, Avatar, Button, TextField } from "@mui/material";
import ReplyComment from "./ReplyComment";
import { getBaseUrl } from "./helpers";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { parseAddress } from "./helpers";
import ChatIcon from "./assets/chatIcon";
import { generateAnonName } from "./helpers";
import Cookies from "js-cookie";
import { useForceRerender } from "./hooks/useForceRerender";
import { formatTimestamp } from "./helpers";

const MAX_REPLY_LENGTH = 200;

const Comment = ({
  name,
  content,
  date,
  replies,
  id,
  setComments,
  setName,
  activeName,
}) => {
  const forceRerender = useForceRerender();
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const location = useLocation();

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

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
        parentCommentId: id,
        date: new Date().toISOString(),
      });

      console.log("Comment submitted:", response.data);
      setComments(response.data);
      setReplyContent("");
      setIsReplying(false);
    } catch (error) {
      console.error("Error submitting comment:", error);
    }
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
            flexDirection: { xs: "column", sm: "row" },
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
              sx={{
                mb: 1,
              }}
            />
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <Button
              variant="contained"
              onClick={handleReplySubmit}
              sx={{
                minWidth: { xs: "100%", sm: "120px" },
                height: { sm: "56px" },
                display: "flex",
                gap: 1,
                justifyContent: "center",
              }}
              className="general-button"
            >
              <ChatIcon />
              Submit
            </Button>
            <Typography
              variant="caption"
              sx={{
                textAlign: "center",
                color:
                  replyContent.length >= MAX_REPLY_LENGTH
                    ? "#ff6b6b"
                    : "inherit",
              }}
            >
              {replyContent.length}/{MAX_REPLY_LENGTH} characters
            </Typography>
          </Box>
        </Box>
      )}
      {replies &&
        replies.map((reply) => (
          <ReplyComment
            key={reply.id}
            name={reply.name}
            content={reply.content}
            date={reply.date}
          />
        ))}
    </Box>
  );
};

export default Comment;

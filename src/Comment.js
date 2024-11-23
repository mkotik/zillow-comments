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

const Comment = ({
  name,
  content,
  date,
  replies,
  id,
  setComments,
  setName,
}) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const location = useLocation();

  const handleReplySubmit = async (e) => {
    // if (replyContent.trim()) {
    //   onReply(replyContent);
    // }
    let currentName = Cookies.get("name");
    if (!currentName) {
      currentName = generateAnonName();
      Cookies.set("name", currentName);
      setName(currentName);
    }
    e.preventDefault();
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
          {date}
        </Typography>
      </Box>
      <Typography variant="body1">{content}</Typography>
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
            alignItems: "center",
            marginBottom: "20px",
            gap: "10px",
          }}
        >
          <TextField
            className="comment-input"
            fullWidth
            variant="outlined"
            placeholder="Your Reply"
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            sx={{ mb: 1 }}
          />
          <Button
            variant="contained"
            onClick={handleReplySubmit}
            sx={{
              width: 200,
              display: "flex",
              gap: 1,
              paddingLeft: 0,
              paddingRight: 0,
            }}
            className="general-button"
          >
            <ChatIcon />
            Submit
          </Button>
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

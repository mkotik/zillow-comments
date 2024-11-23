import React from "react";
import { Box, Typography, Avatar } from "@mui/material";
import { formatTimestamp } from "./helpers";
const ReplyComment = ({ name, content, date }) => (
  <Box
    sx={{
      mb: 2,
      borderRadius: 1,
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
    <Typography className="reply-comment-content" variant="body1">
      {content}
    </Typography>
  </Box>
);

export default ReplyComment;

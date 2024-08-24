import React from "react";
import { Box, Typography, Avatar, Button } from "@mui/material";
import ReplyComment from "./ReplyComment";

const Comment = ({ name, content, date, replies }) => (
  <Box
    sx={{
      mb: 2,
      boxShadow: 4,
      borderRadius: 1,
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
      <Button sx={{ mt: 1 }}>Reply</Button>
    </Box>
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

export default Comment;

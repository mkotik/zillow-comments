import React, { useState, useEffect } from "react";
import { Paper, Typography, TextField, Button } from "@mui/material";
import Comment from "./Comment";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { parseAddress, getBaseUrl } from "./helpers";
import ChatIcon from "./assets/chatIcon";

const CommentPage = () => {
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
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
    try {
      const baseUrl = getBaseUrl();
      const response = await axios.post(`${baseUrl}/comments`, {
        address: parseAddress(location.pathname),
        name,
        content: comment,
        date: new Date().toISOString(),
      });

      console.log("Comment submitted:", response.data);
      setComments(response.data);
      setName("");
      setComment("");
    } catch (error) {
      console.error("Error submitting comment:", error);
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 600, mx: "auto", mt: 4 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Comments:
      </Typography>
      <form onSubmit={handleSubmit} className="comment-form">
        <TextField
          fullWidth
          // label="Name"
          placeholder="Your Name (Optional)"
          className="comment-input"
          variant="outlined"
          value={name}
          onChange={(e) => setName(e.target.value)}
          InputLabelProps={{ shrink: false }}
          sx={{ "& legend": { display: "none" }, "& fieldset": { top: 0 } }}
        />
        <TextField
          fullWidth
          placeholder="Your Comment"
          className="comment-input"
          variant="outlined"
          multiline
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          InputLabelProps={{ shrink: false }}
          sx={{ "& legend": { display: "none" }, "& fieldset": { top: 0 } }}
        />
        <Button
          className="comment-button general-button"
          type="submit"
          variant="contained"
          fullWidth
          sx={{
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
      </form>

      {comments.map((comment, index) => (
        <Comment
          key={index}
          name={comment.name}
          content={comment.content}
          date={comment.date}
          id={comment.id}
          replies={comment.replies}
          setComments={setComments}
        />
      ))}
    </Paper>
  );
};

export default CommentPage;

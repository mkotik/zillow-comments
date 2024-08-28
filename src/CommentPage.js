import React, { useState, useEffect } from "react";
import { Paper, Typography, TextField, Button } from "@mui/material";
import Comment from "./Comment";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { parseAddress, getBaseUrl } from "./helpers";

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
      <Typography variant="body2" gutterBottom>
        {parseAddress(location.pathname).replaceAll("-", " ")}
      </Typography>
      <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
        Add a comment
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Name"
          variant="outlined"
          value={name}
          onChange={(e) => setName(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Comment"
          variant="outlined"
          multiline
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Button type="submit" variant="contained" fullWidth>
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

import React, { useState } from "react";
import { Paper, Typography, TextField, Button } from "@mui/material";
import Comment from "./Comment";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { parseAddress, getBaseUrl } from "./helpers";

const CommentPage = () => {
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const baseUrl = getBaseUrl();
      console.log("in commentpage.js");
      console.log(baseUrl);
      const response = await axios.post(`${baseUrl}/comments`, {
        address: parseAddress(location.pathname),
        name,
        content: comment,
        date: new Date().toISOString(),
      });

      console.log("Comment submitted:", response.data);
      setName("");
      setComment("");
    } catch (error) {
      console.error("Error submitting comment:", error);
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 600, mx: "auto", mt: 4 }}>
      <Typography variant="body2" gutterBottom>
        Current Path: {location.pathname}
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
      <Typography variant="h4" gutterBottom>
        Comments
      </Typography>

      <Comment
        name="John Doe"
        content="This Zillow listing looks great! The location and amenities are exactly what I'm looking for."
        date="2 days ago"
        replies={[
          {
            name: "Jane Doe",
            content:
              "I agree, this looks like a great property. The location is perfect and the price seems reasonable.",
            date: "1 day ago",
          },
          {
            name: "Sarah Anderson",
            content:
              "I disagree, this looks like a great property. The location is perfect and the price seems reasonable.",
            date: "1 day ago",
          },
        ]}
      />

      <Comment
        name="Emily Martinez"
        content="I'm not sure about this listing. The photos look great, but I have some concerns about the condition of the property."
        date="3 days ago"
      />
    </Paper>
  );
};

export default CommentPage;

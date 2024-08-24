import React, { useState } from "react";
import { Paper, Typography, TextField, Button, Box } from "@mui/material";
import Comment from "./Comment";

const CommentPage = () => {
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle comment submission here
    console.log("Submitted:", { name, comment });
    setName("");
    setComment("");
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 600, mx: "auto", mt: 4 }}>
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

      {/* <Box sx={{ ml: 4 }}>
        <Comment
          name="Sarah Anderson"
          content="I agree, this looks like a great property. The location is perfect and the price seems reasonable."
          date="1 day ago"
        />
      </Box> */}

      <Comment
        name="Emily Martinez"
        content="I'm not sure about this listing. The photos look great, but I have some concerns about the condition of the property."
        date="3 days ago"
      />

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
    </Paper>
  );
};

export default CommentPage;

import React from "react";
import { Box, Typography, Avatar } from "@mui/material";
import { formatTimestamp } from "./helpers";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DescriptionIcon from "@mui/icons-material/Description";
import TableChartIcon from "@mui/icons-material/TableChart";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";

const ReplyComment = ({ name, content, attachments, date }) => {
  return (
    <Box
      sx={{
        pl: 4,
        mb: 2,
        borderLeft: "2px solid #e0e0e0",
      }}
      className="reply-comment"
    >
      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
        <Avatar sx={{ mr: 1, width: 30, height: 30 }}>{name[0]}</Avatar>
        <Typography variant="subtitle2">{name}</Typography>
        <Typography variant="caption" sx={{ ml: "auto" }}>
          {formatTimestamp(date)}
        </Typography>
      </Box>
      <Typography className="reply-content" variant="body2" sx={{ mb: 1 }}>
        {content}
      </Typography>

      {/* Display attachments if any */}
      {attachments && attachments.length > 0 && (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
            mt: 1,
            mb: 1,
          }}
        >
          {attachments.map((attachment, index) => (
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
                cursor: "pointer",
              }}
              onClick={() => {
                if (attachment.url) {
                  window.open(attachment.url, "_blank");
                }
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
                  {attachment.contentType?.includes("pdf") ? (
                    <PictureAsPdfIcon sx={{ color: "#f44336" }} />
                  ) : attachment.contentType?.includes("word") ||
                    attachment.contentType?.includes("document") ? (
                    <DescriptionIcon sx={{ color: "#2196f3" }} />
                  ) : attachment.contentType?.includes("excel") ||
                    attachment.contentType?.includes("sheet") ? (
                    <TableChartIcon sx={{ color: "#4caf50" }} />
                  ) : (
                    <InsertDriveFileIcon sx={{ color: "#757575" }} />
                  )}
                </Box>
              )}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default ReplyComment;

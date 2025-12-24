import React, { useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Dialog,
  DialogContent,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActionArea,
  Tooltip,
} from "@mui/material";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DescriptionIcon from "@mui/icons-material/Description";
import TableChartIcon from "@mui/icons-material/TableChart";

const AttachmentPreview = ({ attachments }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  if (!attachments || attachments.length === 0) {
    return null;
  }

  const handleImageClick = (attachment) => {
    if (attachment.isImage) {
      setSelectedImage(attachment);
    } else {
      window.open(attachment.url, "_blank");
    }
  };

  const handleClose = () => {
    setSelectedImage(null);
  };

  const getFileIcon = (attachment) => {
    const { contentType, filename } = attachment;
    const extension = filename.split(".").pop().toLowerCase();

    if ((contentType && contentType.includes("pdf")) || extension === "pdf") {
      return <PictureAsPdfIcon sx={{ fontSize: 32, color: "#f44336" }} />;
    } else if (
      (contentType &&
        (contentType.includes("word") || contentType.includes("document"))) ||
      ["doc", "docx"].includes(extension)
    ) {
      return <DescriptionIcon sx={{ fontSize: 32, color: "#2196f3" }} />;
    } else if (
      (contentType &&
        (contentType.includes("excel") ||
          contentType.includes("spreadsheet"))) ||
      ["xls", "xlsx", "csv"].includes(extension)
    ) {
      return <TableChartIcon sx={{ fontSize: 32, color: "#006aff" }} />;
    } else {
      return <InsertDriveFileIcon sx={{ fontSize: 32, color: "#757575" }} />;
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "Unknown size";
    if (bytes < 1024) return bytes + " bytes";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
  };

  const truncateFilename = (filename, maxLength = 20) => {
    if (!filename) return "Unknown file";
    if (filename.length <= maxLength) return filename;

    const extension = filename.split(".").pop();
    const nameWithoutExt = filename.substring(0, filename.lastIndexOf("."));
    const truncatedName =
      nameWithoutExt.substring(0, maxLength - extension.length - 3) + "...";

    return `${truncatedName}.${extension}`;
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Grid container spacing={1}>
        {attachments.map((attachment, index) => (
          <Grid item xs={6} sm={4} md={3} key={index}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                borderRadius: 1,
                boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
              }}
            >
              <CardActionArea onClick={() => handleImageClick(attachment)}>
                {attachment.isImage ? (
                  <CardMedia
                    component="img"
                    height="100"
                    image={attachment.url}
                    alt={attachment.filename}
                    sx={{ objectFit: "cover" }}
                  />
                ) : (
                  <Box
                    sx={{
                      height: 100,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "#f5f5f5",
                    }}
                  >
                    {getFileIcon(attachment)}
                  </Box>
                )}
                <CardContent sx={{ p: 1, flexGrow: 1 }}>
                  <Tooltip title={attachment.filename}>
                    <Typography variant="body2" noWrap>
                      {truncateFilename(attachment.filename)}
                    </Typography>
                  </Tooltip>
                  <Typography variant="caption" color="textSecondary">
                    {formatFileSize(attachment.size)}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Image preview dialog */}
      <Dialog
        open={Boolean(selectedImage)}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
      >
        <Box sx={{ display: "flex", alignItems: "center", p: 1 }}>
          <Typography variant="h6" sx={{ flexGrow: 1, ml: 1 }}>
            {selectedImage?.filename}
          </Typography>
          <Tooltip title="Download">
            <IconButton
              onClick={() => window.open(selectedImage?.url, "_blank")}
              edge="end"
            >
              <DownloadIcon />
            </IconButton>
          </Tooltip>
          <IconButton onClick={handleClose} edge="end">
            <CloseIcon />
          </IconButton>
        </Box>
        <DialogContent dividers sx={{ p: 0 }}>
          {selectedImage && (
            <img
              src={selectedImage.url}
              alt={selectedImage.filename}
              style={{ width: "100%", height: "auto", display: "block" }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default AttachmentPreview;

import React, { useState, useRef } from "react";
import {
  Box,
  Button,
  IconButton,
  Typography,
  LinearProgress,
} from "@mui/material";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import ClearIcon from "@mui/icons-material/Clear";
import ImageIcon from "@mui/icons-material/Image";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import axios from "axios";
import { getBaseUrl } from "./helpers";

const FileUpload = ({ onUploadComplete, maxFiles = 5 }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);
  const dropAreaRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropAreaRef.current.classList.add("drag-over");
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropAreaRef.current.classList.remove("drag-over");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropAreaRef.current.classList.remove("drag-over");

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (fileList) => {
    setError("");
    const newFiles = Array.from(fileList);

    // Check file size (5MB limit)
    const oversizedFiles = newFiles.filter(
      (file) => file.size > 5 * 1024 * 1024
    );
    if (oversizedFiles.length > 0) {
      setError(
        `Some files exceed the 5MB limit: ${oversizedFiles
          .map((f) => f.name)
          .join(", ")}`
      );
      return;
    }

    // Check file count
    if (files.length + newFiles.length > maxFiles) {
      setError(`You can only upload a maximum of ${maxFiles} files`);
      return;
    }

    // Check file types
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/plain",
    ];

    const invalidFiles = newFiles.filter(
      (file) => !allowedTypes.includes(file.type)
    );
    if (invalidFiles.length > 0) {
      setError(
        `Invalid file types: ${invalidFiles.map((f) => f.name).join(", ")}`
      );
      return;
    }

    // Add preview URLs for images
    const filesWithPreview = newFiles.map((file) => ({
      file,
      preview: file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : null,
      name: file.name,
      size: file.size,
      type: file.type,
    }));

    setFiles((prevFiles) => [...prevFiles, ...filesWithPreview]);
  };

  const removeFile = (index) => {
    setFiles((prevFiles) => {
      const newFiles = [...prevFiles];
      // Revoke the object URL to avoid memory leaks
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);
    setError("");

    const formData = new FormData();
    files.forEach((fileObj) => {
      formData.append("attachments", fileObj.file);
    });

    try {
      const baseUrl = getBaseUrl();
      const response = await axios.post(`${baseUrl}/files/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
      });

      // Call the callback with the uploaded attachments info
      if (onUploadComplete) {
        onUploadComplete(response.data.attachments);
      }

      // Clear the files after successful upload
      setFiles([]);
      setUploadProgress(0);
    } catch (error) {
      console.error("Error uploading files:", error);
      setError(error.response?.data?.error || "Failed to upload files");
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " bytes";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith("image/")) return <ImageIcon />;
    return <InsertDriveFileIcon />;
  };

  return (
    <Box sx={{ mt: 2, mb: 2 }}>
      <Box
        ref={dropAreaRef}
        className="drop-area"
        sx={{
          border: "2px dashed #cccccc",
          borderRadius: 2,
          p: 2,
          textAlign: "center",
          backgroundColor: "#f8f8f8",
          transition: "all 0.3s",
          cursor: "pointer",
          "&.drag-over": {
            borderColor: "#2196f3",
            backgroundColor: "rgba(33, 150, 243, 0.1)",
          },
        }}
        onClick={() => fileInputRef.current.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: "none" }}
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
        />
        <AttachFileIcon sx={{ fontSize: 40, color: "#666666" }} />
        <Typography variant="body1">
          Drag & drop files here or click to browse
        </Typography>
        <Typography variant="caption" color="textSecondary">
          Max 5 files, 5MB each (Images, PDF, DOC, DOCX, XLS, XLSX, TXT)
        </Typography>
      </Box>

      {error && (
        <Typography variant="body2" color="error" sx={{ mt: 1 }}>
          {error}
        </Typography>
      )}

      {files.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Selected Files ({files.length})
          </Typography>
          {files.map((fileObj, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                alignItems: "center",
                p: 1,
                border: "1px solid #eeeeee",
                borderRadius: 1,
                mb: 1,
              }}
            >
              {getFileIcon(fileObj.type)}
              <Box sx={{ ml: 1, flexGrow: 1 }}>
                <Typography variant="body2" noWrap>
                  {fileObj.name}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {formatFileSize(fileObj.size)}
                </Typography>
              </Box>
              {fileObj.preview && (
                <Box
                  component="img"
                  src={fileObj.preview}
                  sx={{
                    height: 40,
                    width: 40,
                    objectFit: "cover",
                    borderRadius: 1,
                    mr: 1,
                  }}
                  alt="Preview"
                />
              )}
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
              >
                <ClearIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}

          {uploading ? (
            <Box sx={{ width: "100%", mt: 2 }}>
              <LinearProgress variant="determinate" value={uploadProgress} />
              <Typography
                variant="caption"
                align="center"
                display="block"
                sx={{ mt: 1 }}
              >
                Uploading... {uploadProgress}%
              </Typography>
            </Box>
          ) : (
            <Button
              variant="contained"
              onClick={uploadFiles}
              disabled={files.length === 0}
              sx={{ mt: 1 }}
            >
              Upload {files.length} {files.length === 1 ? "file" : "files"}
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
};

export default FileUpload;

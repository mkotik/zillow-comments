import React from "react";
import { Box, Divider, Link as MuiLink, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

const PrivacyPolicyPage = () => {
  // Keep this generic; customize as needed.
  const effectiveDate = "2025-12-26";
  const contactEmail = "maratkotik97@gmail.com";

  return (
    <Box sx={{ p: 2, maxWidth: 820, mx: "auto", color: "black" }}>
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
        Privacy Policy
      </Typography>
      <Typography variant="body2" sx={{ opacity: 0.75, mb: 2 }}>
        Effective date: {effectiveDate}
      </Typography>

      <Divider sx={{ mb: 2 }} />

      <Typography variant="body1" sx={{ mb: 2 }}>
        This Privacy Policy explains how House Humblr (“we”, “us”) collects,
        uses, and shares information when you use House Humblr (the “Service”).
      </Typography>

      <Typography variant="h6" sx={{ fontWeight: 800, mt: 3, mb: 1 }}>
        Information we collect
      </Typography>
      <Typography variant="body1" sx={{ mb: 1 }}>
        - Account information (e.g., name, email, and profile picture if
        provided through sign-in).
      </Typography>
      <Typography variant="body1" sx={{ mb: 1 }}>
        - Content you submit (comments, replies, and any attachments you
        upload).
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        - Context needed to associate comments with a property thread.
      </Typography>

      <Typography variant="h6" sx={{ fontWeight: 800, mt: 3, mb: 1 }}>
        How we use information
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        We use information to authenticate you, display and manage your content,
        operate the Service, and maintain safety and reliability (for example,
        to prevent abuse and troubleshoot issues).
      </Typography>

      <Typography variant="h6" sx={{ fontWeight: 800, mt: 3, mb: 1 }}>
        Sharing
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        We may share information with service providers that help us operate the
        Service (such as authentication, hosting, storage, analytics, or
        monitoring providers), and as required to comply with law or protect
        rights, safety, and security.
      </Typography>

      <Typography variant="h6" sx={{ fontWeight: 800, mt: 3, mb: 1 }}>
        Data retention
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        We retain information for as long as needed to provide the Service and
        for legitimate operational purposes (such as backups, security, and
        compliance). You may request deletion using the contact information
        below.
      </Typography>

      <Typography variant="h6" sx={{ fontWeight: 800, mt: 3, mb: 1 }}>
        Security
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        We use reasonable safeguards designed to protect information. No method
        of transmission or storage is completely secure.
      </Typography>

      <Typography variant="h6" sx={{ fontWeight: 800, mt: 3, mb: 1 }}>
        Contact
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        Email:{" "}
        <MuiLink href={`mailto:${contactEmail}`} underline="hover">
          {contactEmail}
        </MuiLink>
      </Typography>

      <Divider sx={{ my: 2 }} />

      <MuiLink component={RouterLink} to="/comments" underline="hover">
        Back to comments
      </MuiLink>
    </Box>
  );
};

export default PrivacyPolicyPage;

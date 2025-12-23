import { GoogleOAuthProvider } from "@react-oauth/google";
import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Paper,
  TextField,
  Typography,
  Snackbar,
  Alert,
  Tooltip,
} from "@mui/material";
import Login from "./Login";
import api, { authStorage } from "./api/client";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const clientId = useMemo(() => {
    return (
      process.env.REACT_APP_GOOGLE_CLIENT_ID ||
      "799754948352-a71ejo3j4aaj2duhh0opvq0tjsglj5va.apps.googleusercontent.com"
    );
  }, []);

  const [mode, setMode] = useState("login"); // login | signup
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [confirmTouched, setConfirmTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const isSignup = mode === "signup";

  const validate = () => {
    const next = {};

    if (isSignup) {
      if (!firstName.trim()) next.firstName = "First name is required";
      if (!lastName.trim()) next.lastName = "Last name is required";
    }

    if (!email.trim()) next.email = "Email is required";
    if (!password) next.password = "Password is required";

    if (isSignup) {
      if (!confirmPassword)
        next.confirmPassword = "Confirm password is required";
      if (password && confirmPassword && password !== confirmPassword) {
        next.confirmPassword = "Passwords do not match";
      }
    }

    return next;
  };

  const isSubmitDisabled = () => {
    if (loading) return true;
    const errs = validate();
    return Object.keys(errs).length > 0;
  };

  const getSignupFixTooltip = () => {
    if (!isSignup) return "";
    const errs = validate();
    const messages = [];
    if (errs.firstName) messages.push(errs.firstName);
    if (errs.lastName) messages.push(errs.lastName);
    if (errs.email) messages.push(errs.email);
    if (errs.password) messages.push(errs.password);
    if (errs.confirmPassword) messages.push(errs.confirmPassword);
    if (messages.length === 0) return "";
    return `Fix the following fields: ${messages.join(", ")}`;
  };

  const redirectAfterAuth = (withDelay = false) => {
    const from = location.state?.from?.pathname || "/";
    if (!withDelay) {
      navigate(from, { replace: true });
      return;
    }
    setTimeout(() => navigate(from, { replace: true }), 950);
  };

  const handleLocalAuth = async (e) => {
    e.preventDefault();
    setError("");
    const errs = validate();
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setLoading(true);

    try {
      const payload =
        mode === "signup"
          ? {
              name: `${firstName.trim()} ${lastName.trim()}`.trim(),
              email: email.trim(),
              password,
            }
          : { email: email.trim(), password };

      const path = mode === "signup" ? "/auth/signup" : "/auth/login";
      const res = await api.post(path, payload);
      const { accessToken, user } = res.data || {};
      if (accessToken) authStorage.setAccessToken(accessToken);
      if (user) authStorage.setUser(user);
      if (mode === "signup") {
        setSuccessMsg("Account created! Redirecting...");
      } else {
        setSuccessMsg("Logged in! Redirecting...");
      }
      setSuccessOpen(true);
      redirectAfterAuth(true);
    } catch (err) {
      console.error("Auth error:", err);
      setError(err.response?.data?.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <Paper sx={{ p: 3, maxWidth: 420, mx: "auto", mt: 6 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          {mode === "signup" ? "Create your account" : "Log in"}
        </Typography>

        <Box
          component="form"
          onSubmit={handleLocalAuth}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          {isSignup && (
            <>
              <div style={{ display: "flex", gap: 10 }}>
                <TextField
                  label="First name"
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    setFieldErrors((prev) => ({
                      ...prev,
                      firstName: undefined,
                    }));
                  }}
                  autoComplete="given-name"
                  fullWidth
                  required
                />
                <TextField
                  label="Last name"
                  value={lastName}
                  onChange={(e) => {
                    setLastName(e.target.value);
                    setFieldErrors((prev) => ({
                      ...prev,
                      lastName: undefined,
                    }));
                  }}
                  autoComplete="family-name"
                  fullWidth
                  required
                />
              </div>
            </>
          )}

          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setFieldErrors((prev) => ({ ...prev, email: undefined }));
            }}
            autoComplete={isSignup ? "email" : "username"}
            fullWidth
            required
            error={Boolean(fieldErrors.email)}
          />

          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setFieldErrors((prev) => ({
                ...prev,
                password: undefined,
                confirmPassword: undefined,
              }));
            }}
            autoComplete={isSignup ? "new-password" : "current-password"}
            fullWidth
            required
            error={Boolean(fieldErrors.password)}
          />

          {isSignup && (
            <TextField
              label="Confirm password"
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setFieldErrors((prev) => ({
                  ...prev,
                  confirmPassword: undefined,
                }));
              }}
              onBlur={() => {
                setConfirmTouched(true);
                if (
                  password &&
                  confirmPassword &&
                  password !== confirmPassword
                ) {
                  setFieldErrors((prev) => ({
                    ...prev,
                    confirmPassword: "Passwords do not match",
                  }));
                }
              }}
              autoComplete="new-password"
              fullWidth
              required
              error={
                Boolean(fieldErrors.confirmPassword) ||
                (confirmTouched &&
                  password &&
                  confirmPassword &&
                  password !== confirmPassword)
              }
              helperText={
                fieldErrors.confirmPassword ||
                (confirmTouched &&
                password &&
                confirmPassword &&
                password !== confirmPassword
                  ? "Passwords do not match"
                  : " ")
              }
            />
          )}

          {error && (
            <Typography variant="body2" color="error">
              {error}
            </Typography>
          )}

          <Tooltip
            title={isSignup && isSubmitDisabled() ? getSignupFixTooltip() : ""}
            arrow
            disableHoverListener={!(isSignup && isSubmitDisabled())}
          >
            <span style={{ width: "100%" }}>
              <Button
                type="submit"
                variant="contained"
                className="general-button"
                disabled={isSubmitDisabled()}
                sx={{ minHeight: 48, position: "relative", width: "100%" }}
              >
                <span style={{ visibility: loading ? "hidden" : "visible" }}>
                  {isSignup ? "Sign up" : "Log in"}
                </span>
                {loading && (
                  <CircularProgress
                    size={20}
                    sx={{
                      color: "white",
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      marginTop: "-10px",
                      marginLeft: "-10px",
                    }}
                  />
                )}
              </Button>
            </span>
          </Tooltip>
        </Box>

        <Divider sx={{ my: 2 }}>or</Divider>

        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Login
            mode={mode}
            onAuthStart={() => setLoading(true)}
            onAuthEnd={() => setLoading(false)}
            onAuthSuccess={() => {
              if (mode === "signup") {
                setSuccessMsg("Account created with Google! Redirecting...");
                setSuccessOpen(true);
                redirectAfterAuth(true);
              } else {
                setSuccessMsg("Logged in with Google! Redirecting...");
                setSuccessOpen(true);
                redirectAfterAuth(true);
              }
            }}
          />
        </Box>

        <Snackbar
          open={successOpen}
          autoHideDuration={950}
          onClose={() => setSuccessOpen(false)}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert severity="success" onClose={() => setSuccessOpen(false)}>
            {successMsg}
          </Alert>
        </Snackbar>

        <Box sx={{ mt: 2, textAlign: "center" }}>
          {mode === "signup" ? (
            <Typography variant="body2">
              Already have an account?{" "}
              <Button
                variant="text"
                onClick={() => {
                  setMode("login");
                  setError("");
                  setFieldErrors({});
                  setPassword("");
                  setConfirmPassword("");
                  setConfirmTouched(false);
                }}
              >
                Log in
              </Button>
            </Typography>
          ) : (
            <Typography variant="body2">
              Don&apos;t have an account?{" "}
              <Button
                variant="text"
                onClick={() => {
                  setMode("signup");
                  setError("");
                  setFieldErrors({});
                  setPassword("");
                  setConfirmPassword("");
                  setConfirmTouched(false);
                }}
              >
                Sign up
              </Button>
            </Typography>
          )}
        </Box>
      </Paper>
    </GoogleOAuthProvider>
  );
};

export default LoginPage;

import { GoogleOAuthProvider } from "@react-oauth/google";
import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Divider,
  Paper,
  TextField,
  Typography,
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
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const redirectAfterAuth = () => {
    const from = location.state?.from?.pathname || "/";
    navigate(from, { replace: true });
  };

  const handleLocalAuth = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload =
        mode === "signup"
          ? { name: name.trim(), email: email.trim(), password }
          : { email: email.trim(), password };

      const path = mode === "signup" ? "/auth/signup" : "/auth/login";
      const res = await api.post(path, payload);
      const { accessToken, user } = res.data || {};
      if (accessToken) authStorage.setAccessToken(accessToken);
      if (user) authStorage.setUser(user);
      redirectAfterAuth();
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
          {mode === "signup" && (
            <TextField
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              fullWidth
            />
          )}

          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete={mode === "signup" ? "email" : "username"}
            fullWidth
            required
          />

          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={
              mode === "signup" ? "new-password" : "current-password"
            }
            fullWidth
            required
          />

          {error && (
            <Typography variant="body2" color="error">
              {error}
            </Typography>
          )}

          <Button
            type="submit"
            variant="contained"
            className="general-button"
            disabled={loading}
          >
            {mode === "signup" ? "Sign up" : "Log in"}
          </Button>
        </Box>

        <Divider sx={{ my: 2 }}>or</Divider>

        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Login
            onAuthSuccess={() => {
              redirectAfterAuth();
            }}
          />
        </Box>

        <Box sx={{ mt: 2, textAlign: "center" }}>
          {mode === "signup" ? (
            <Typography variant="body2">
              Already have an account?{" "}
              <Button variant="text" onClick={() => setMode("login")}>
                Log in
              </Button>
            </Typography>
          ) : (
            <Typography variant="body2">
              Don&apos;t have an account?{" "}
              <Button variant="text" onClick={() => setMode("signup")}>
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

import { GoogleLogin } from "@react-oauth/google";
import api, { authStorage } from "./api/client";

const Login = ({ mode = "login", onAuthSuccess }) => {
  return (
    <GoogleLogin
      text={mode === "signup" ? "signup_with" : "signin_with"}
      onSuccess={async (credentialResponse) => {
        try {
          const idToken = credentialResponse?.credential;
          if (!idToken) throw new Error("Missing Google credential");

          const res = await api.post("/auth/google", { idToken });
          const { accessToken, user } = res.data || {};
          if (accessToken) authStorage.setAccessToken(accessToken);
          if (user) authStorage.setUser(user);
          onAuthSuccess?.(user);
        } catch (err) {
          console.error("Google login failed:", err);
          alert("Google login failed");
        }
      }}
      onError={() => {
        alert("Google login failed");
      }}
    />
  );
};

export default Login;

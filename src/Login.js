import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";

const Login = ({ onLoginSuccess }) => {
  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      console.log("Login Success:", tokenResponse);
      try {
        const userInfo = await axios.get(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
          }
        );
        onLoginSuccess(userInfo.data);
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    },
    onError: () => {
      console.log("Login Failed");
    },
  });

  return (
    <div>
      <button onClick={() => login()}>Sign in with Google</button>
    </div>
  );
};

export default Login;

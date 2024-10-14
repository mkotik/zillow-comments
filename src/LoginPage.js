import { GoogleOAuthProvider } from "@react-oauth/google";
import Login from "./Login";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const LoginPage = () => {
  const clientId =
    "799754948352-a71ejo3j4aaj2duhh0opvq0tjsglj5va.apps.googleusercontent.com";
  const [userInfo, setUserInfo] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedUserInfo = localStorage.getItem("userInfo");
    if (storedUserInfo) {
      setUserInfo(JSON.parse(storedUserInfo));
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    }
  }, [navigate, location]);

  const handleLoginSuccess = (info) => {
    setUserInfo(info);
    localStorage.setItem("userInfo", JSON.stringify(info));
    const from = location.state?.from?.pathname || "/";
    navigate(from, { replace: true });
  };

  const handleLogout = () => {
    setUserInfo(null);
    localStorage.removeItem("userInfo");
  };

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div>
        <h1>Login Page</h1>
        {userInfo ? (
          <div>
            <h2>Welcome, {userInfo.name}!</h2>
            <p>Email: {userInfo.email}</p>
            <img src={userInfo.picture} alt="Profile" />
            <button onClick={handleLogout}>Logout</button>
          </div>
        ) : (
          <Login onLoginSuccess={handleLoginSuccess} />
        )}
      </div>
    </GoogleOAuthProvider>
  );
};

export default LoginPage;

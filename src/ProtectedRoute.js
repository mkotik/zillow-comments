import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "./api/client";

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const [ok, setOk] = useState(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        await api.get("/auth/me");
        if (!cancelled) setOk(true);
      } catch (err) {
        if (!cancelled) setOk(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (ok === null) return null;
  if (!ok) return <Navigate to="/login" state={{ from: location }} replace />;

  return children;
};

export default ProtectedRoute;

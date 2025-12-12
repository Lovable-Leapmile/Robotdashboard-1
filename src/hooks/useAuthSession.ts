import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const SESSION_DURATION_DAYS = 7;
const SESSION_DURATION_MS = SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000;

export const useAuthSession = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Skip auth check on login page
    if (location.pathname === "/") {
      return;
    }

    const checkSession = () => {
      const userId = localStorage.getItem("user_id");
      const userName = localStorage.getItem("user_name");
      const loginTimestamp = localStorage.getItem("login_timestamp");

      // Not logged in
      if (!userId || !userName) {
        navigate("/");
        return false;
      }

      // Check if session has expired (7 days)
      if (loginTimestamp) {
        const loginTime = parseInt(loginTimestamp, 10);
        const now = Date.now();
        const sessionAge = now - loginTime;

        if (sessionAge > SESSION_DURATION_MS) {
          // Session expired, clear storage and redirect
          localStorage.removeItem("user_id");
          localStorage.removeItem("user_name");
          localStorage.removeItem("login_timestamp");
          navigate("/");
          return false;
        }
      } else {
        // No timestamp, treat as expired for security
        localStorage.removeItem("user_id");
        localStorage.removeItem("user_name");
        navigate("/");
        return false;
      }

      return true;
    };

    checkSession();
  }, [navigate, location.pathname]);

  const logout = () => {
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_name");
    localStorage.removeItem("login_timestamp");
    navigate("/");
  };

  return { logout };
};

export const isSessionValid = (): boolean => {
  const userId = localStorage.getItem("user_id");
  const userName = localStorage.getItem("user_name");
  const loginTimestamp = localStorage.getItem("login_timestamp");

  if (!userId || !userName || !loginTimestamp) {
    return false;
  }

  const loginTime = parseInt(loginTimestamp, 10);
  const now = Date.now();
  const sessionAge = now - loginTime;

  return sessionAge <= SESSION_DURATION_MS;
};

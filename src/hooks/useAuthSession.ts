import { useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

const SESSION_DURATION_DAYS = 7;
const SESSION_DURATION_MS = SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000;
const WARNING_BEFORE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes before expiry

// Global function to extend session - can be called from anywhere
export const extendSession = () => {
  localStorage.setItem("login_timestamp", Date.now().toString());
  toast({
    title: "Session Extended",
    description: "Your session has been extended for another 7 days.",
  });
  window.location.reload();
};

export const useAuthSession = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const warningShownRef = useRef(false);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const logoutTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleExtendSession = useCallback(() => {
    extendSession();
  }, []);

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
        const timeUntilExpiry = SESSION_DURATION_MS - sessionAge;

        if (sessionAge > SESSION_DURATION_MS) {
          // Session expired, clear storage and redirect
          localStorage.removeItem("user_id");
          localStorage.removeItem("user_name");
          localStorage.removeItem("login_timestamp");
          navigate("/");
          return false;
        }

        // Set up warning toast 5 minutes before expiry
        if (!warningShownRef.current && timeUntilExpiry > 0) {
          const timeUntilWarning = timeUntilExpiry - WARNING_BEFORE_EXPIRY_MS;
          
          const showWarningToast = (minutesLeft: number) => {
            // Show toast with instructions to extend session
            toast({
              title: "Session Expiring Soon",
              description: `Your session will expire in ${minutesLeft} minute${minutesLeft > 1 ? 's' : ''}. Click here or refresh the page to stay logged in.`,
              variant: "destructive",
              duration: 60000,
            });
            warningShownRef.current = true;
          };

          if (timeUntilWarning > 0) {
            // Schedule warning
            warningTimeoutRef.current = setTimeout(() => {
              showWarningToast(5);
            }, timeUntilWarning);
          } else if (timeUntilExpiry <= WARNING_BEFORE_EXPIRY_MS && timeUntilExpiry > 0) {
            // Less than 5 minutes remaining, show warning immediately
            const minutesLeft = Math.ceil(timeUntilExpiry / 60000);
            showWarningToast(minutesLeft);
          }

          // Schedule auto-logout
          logoutTimeoutRef.current = setTimeout(() => {
            localStorage.removeItem("user_id");
            localStorage.removeItem("user_name");
            localStorage.removeItem("login_timestamp");
            toast({
              title: "Session Expired",
              description: "Your session has expired. Please log in again.",
              variant: "destructive",
            });
            navigate("/");
          }, timeUntilExpiry);
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

    // Cleanup timeouts on unmount
    return () => {
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
      if (logoutTimeoutRef.current) {
        clearTimeout(logoutTimeoutRef.current);
      }
    };
  }, [navigate, location.pathname]);

  const logout = () => {
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }
    if (logoutTimeoutRef.current) {
      clearTimeout(logoutTimeoutRef.current);
    }
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_name");
    localStorage.removeItem("login_timestamp");
    navigate("/");
  };

  return { logout, extendSession: handleExtendSession };
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

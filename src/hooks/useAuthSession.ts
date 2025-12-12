import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

const SESSION_DURATION_DAYS = 7;
const SESSION_DURATION_MS = SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000;
const WARNING_BEFORE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes before expiry

export const useAuthSession = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const warningShownRef = useRef(false);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const logoutTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
          
          if (timeUntilWarning > 0) {
            // Schedule warning
            warningTimeoutRef.current = setTimeout(() => {
              toast({
                title: "Session Expiring Soon",
                description: "Your session will expire in 5 minutes. Please save your work and log in again to continue.",
                variant: "destructive",
                duration: 30000, // Show for 30 seconds
              });
              warningShownRef.current = true;
            }, timeUntilWarning);
          } else if (timeUntilExpiry <= WARNING_BEFORE_EXPIRY_MS && timeUntilExpiry > 0) {
            // Less than 5 minutes remaining, show warning immediately
            const minutesLeft = Math.ceil(timeUntilExpiry / 60000);
            toast({
              title: "Session Expiring Soon",
              description: `Your session will expire in ${minutesLeft} minute${minutesLeft > 1 ? 's' : ''}. Please save your work and log in again to continue.`,
              variant: "destructive",
              duration: 30000,
            });
            warningShownRef.current = true;
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

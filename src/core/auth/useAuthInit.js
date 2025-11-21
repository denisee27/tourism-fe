import { useEffect, useRef } from "react";
import { useAuthStore } from "../../features/auth/stores/authStore";

/**
 * Hook to initialize authentication state when the app loads
 * This checks for existing tokens and restores the session
 * Uses a ref to ensure initialization only happens once, even in StrictMode
 */
//Check main.jsx
export const useAuthInit = () => {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const status = useAuthStore((state) => state.status);
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Only initialize once, even if React.StrictMode causes double-mounting
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      initializeAuth();
    }
  }, [initializeAuth]);

  return {
    isInitializing: status === "idle" || status === "loading",
    isInitialized: status === "authenticated" || status === "unauthenticated",
  };
};

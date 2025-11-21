import { create } from "zustand";
import { logoutUser, getMe as getMeApi } from "../api";
import { tokenRefreshManager } from "../../../core/auth/tokenRefresh";
import { logger } from "../../../core/utils/logger";
import useUIStore from "../../../core/stores/uiStore.js";

/**
 * Normalize user data from API
 * Converts role object to role string and handles different formats
 * ? Additinally, you can just change the role structure, just make sure that permission is tracked
 */
const normalizeUserData = (userData) => {
  if (!userData) return null;

  // If role is an object, extract the name and convert to snake_case
  let roleName = userData.role;
  if (typeof userData.role === "object" && userData.role?.name) {
    roleName = userData.role.name.toLowerCase().replace(/\s+/g, "_"); // "Super Admin" -> "super_admin"
  }

  return {
    ...userData,
    role: roleName,
    // Store the full role object for reference if needed
    roleDetails: typeof userData.role === "object" ? userData.role : null,
  };
};

export const useAuthStore = create((set, get) => ({
  status: "idle", // 'idle' | 'loading' | 'authenticated' | 'unauthenticated'
  user: null,
  accessToken: null,
  isInitializing: false, // Flag to prevent multiple simultaneous initializations

  /**
   * Sets the authentication state. Called after a successful login or session check.
   * @param {{ user: object, accessToken: string }} authData
   */
  setAuth: ({ user, accessToken }) => {
    const currentUser = get().user;
    const normalizedUser = normalizeUserData(user) ?? currentUser ?? null;
    localStorage.setItem("accessToken", accessToken);
    set({ status: "authenticated", user: normalizedUser, accessToken });

    // Schedule automatic token refresh
    logger.info("Auth state set, scheduling token refresh");
    tokenRefreshManager.scheduleRefresh(accessToken);
  },

  logout: async (reason = null, showModal = false) => {
    try {
      await logoutUser();
    } catch (exception) {
      logger.warn("Logout API call failed, clearing client session anyway", { exception });
    } finally {
      localStorage.removeItem("accessToken");
      set({ status: "unauthenticated", user: null, accessToken: null });

      // Clear token refresh timer and queue
      logger.info("Resetting token refresh manager");
      tokenRefreshManager.reset();

      // Show session expired modal if requested
      if (showModal) {
        const { useUIStore } = await import("../../../core/stores/uiStore.js");
        useUIStore.getState().openModal("sessionExpired", {
          reason: reason || "Your session has expired. Please log in again.",
        });
      }
    }
  },

  /**
   * Fetches the current user's information to restore session
   * @returns {Promise<boolean>} True if session restored successfully
   */
  getMe: async () => {
    set({ status: "loading" });
    try {
      const userData = await getMeApi();
      const newAccessToken = userData.accessToken || get().accessToken;
      const normalizedUser = normalizeUserData(userData);

      set({
        status: "authenticated",
        user: normalizedUser,
        accessToken: newAccessToken,
      });

      // Schedule token refresh after successful session restoration
      logger.info("Session restored, scheduling token refresh");
      tokenRefreshManager.scheduleRefresh(newAccessToken);

      return true;
    } catch (exception) {
      logger.error("Session restoration failed", { exception });

      const status = exception?.response?.status;
      const defaultMessage = "We couldn't restore your session. Please log in again.";
      if (status) {
        if (status === 429) {
          const message =
            exception?.response?.data?.error ||
            exception?.message ||
            "Too many attempts. Please wait a moment and log in again.";
          useUIStore.getState().showError(message);
        } else if (status === 401) {
          // Interceptor should already trigger logout with modal, but show fallback toast just in case
          const message = exception?.response?.data?.error || defaultMessage;
          useUIStore.getState().showError(message);
        } else if (status >= 500) {
          useUIStore
            .getState()
            .showError("Server is unavailable right now. Please try again shortly.");
        } else {
          const message = exception?.response?.data?.error || defaultMessage;
          useUIStore.getState().showError(message);
        }
      } else if (exception?.message) {
        useUIStore.getState().showError(exception.message);
      } else {
        useUIStore.getState().showError(defaultMessage);
      }

      set({ status: "unauthenticated", user: null, accessToken: null });
      return false;
    }
  },

  /**
   * Initialize auth state - checks for existing session
   * Call this when the app starts
   */
  initializeAuth: async () => {
    // Prevent multiple simultaneous initialization calls
    const state = get();
    if (state.isInitializing || state.status === "loading") {
      logger.debug("Auth initialization already in progress, skipping");
      return;
    }

    // If already authenticated or explicitly unauthenticated, skip
    if (state.status === "authenticated" || state.status === "unauthenticated") {
      logger.debug("Auth already initialized, skipping");
      return;
    }

    set({ isInitializing: true });

    try {
      const token = localStorage.getItem("accessToken");
      if (token) {
        logger.info("Found existing token, attempting to restore session");
        set({ accessToken: token, status: "loading" });

        // Add timeout to prevent infinite loading
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Session restoration timeout")), 10000)
        );

        try {
          await Promise.race([get().getMe(), timeoutPromise]);
          logger.info("Session restored successfully");
        } catch (error) {
          logger.error("Session restoration failed", { error: error.message });
          // Clear invalid token and set as unauthenticated
          localStorage.removeItem("accessToken");
          set({ status: "unauthenticated", user: null, accessToken: null });
        }
      } else {
        logger.info("No token found, setting as unauthenticated");
        set({ status: "unauthenticated" });
      }
    } catch (error) {
      logger.error("Auth initialization error", { error: error.message });
      set({ status: "unauthenticated", user: null, accessToken: null });
    } finally {
      set({ isInitializing: false });
    }
  },
}));

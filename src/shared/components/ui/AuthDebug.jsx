import React from "react";
import { useAuthStore } from "../../../features/auth/stores/authStore";

/**
 * Auth Debug Component
 * Shows current auth state for debugging
 * Add this temporarily to your app to see what's happening
 */
export default function AuthDebug() {
  const status = useAuthStore((state) => state.status);
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const isInitializing = useAuthStore((state) => state.isInitializing);

  const clearToken = () => {
    localStorage.removeItem("accessToken");
    window.location.reload();
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm rounded-lg border-2 border-red-500 bg-white p-4 shadow-xl">
      <h3 className="mb-2 text-lg font-bold text-red-600">🐛 Auth Debug</h3>
      <div className="space-y-2 text-sm">
        <div>
          <strong>Status:</strong> <span className="font-mono">{status}</span>
        </div>
        <div>
          <strong>Initializing:</strong> {isInitializing ? "Yes" : "No"}
        </div>
        <div>
          <strong>Has Token:</strong> {accessToken ? "Yes" : "No"}
        </div>
        <div>
          <strong>User:</strong> {user ? user.email : "None"}
        </div>
        <div>
          <strong>LocalStorage Token:</strong> {localStorage.getItem("accessToken") ? "Yes" : "No"}
        </div>
        <div className="pt-2">
          <button
            onClick={clearToken}
            className="w-full rounded bg-red-500 px-3 py-1 text-white hover:bg-red-600"
          >
            Clear Token & Reload
          </button>
        </div>
      </div>
    </div>
  );
}

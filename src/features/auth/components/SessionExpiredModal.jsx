import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useModal } from "../../../core/stores/uiStore";
import { logger } from "../../../core/utils/logger";

/**
 * Session Expired Modal
 *
 * Displayed when:
 * - Token refresh fails
 * - Session is invalidated on backend
 * - Token cannot be refreshed
 * - User is force-logged out
 *
 * Shows a friendly message and redirects to login.
 */

const SessionExpiredModal = () => {
  const navigate = useNavigate();
  const modal = useModal("sessionExpired");

  // Get modal data (reason for expiry)
  //! See backend contract
  const reason = modal.data?.reason || "Your session has expired";
  const showRetry = modal.data?.showRetry || false;
  const onRetry = modal.data?.onRetry;

  // Auto-focus on OK button when modal opens
  useEffect(() => {
    if (modal.isOpen) {
      logger.info("Session expired modal shown", { reason });

      // Focus the OK button for accessibility
      setTimeout(() => {
        document.getElementById("session-expired-ok-btn")?.focus();
      }, 100);
    }
  }, [modal.isOpen, reason]);

  // Handle OK button click
  const handleOk = () => {
    logger.info("Session expired modal dismissed");
    modal.close();

    // Redirect to login
    navigate("/login", { replace: true });
  };

  // Handle retry (if available)
  const handleRetry = () => {
    logger.info("Session expired - retry clicked");
    modal.close();

    if (onRetry) {
      onRetry();
    }
  };

  // Don't render if not open
  if (!modal.isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity"
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="relative w-full max-w-md transform overflow-hidden rounded-xl bg-white shadow-2xl transition-all"
          role="dialog"
          aria-modal="true"
          aria-labelledby="session-expired-title"
        >
          {/* Icon */}
          <div className="bg-gradient-to-br from-red-50 to-orange-50 px-6 pt-8 pb-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <svg
                className="h-8 w-8 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            <h3
              id="session-expired-title"
              className="text-center text-xl font-semibold text-gray-900 mb-3"
            >
              Session Expired
            </h3>

            <p className="text-center text-gray-600 mb-6">{reason}</p>

            {/* Additional info */}
            <div className="mb-6 rounded-lg bg-blue-50 p-4 border border-blue-100">
              <div className="flex items-start gap-3">
                <svg
                  className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900">
                    Please log in again to continue
                  </p>
                  <p className="mt-1 text-xs text-blue-700">
                    Your work has been saved. You can continue where you left off after logging in.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <button
                id="session-expired-ok-btn"
                onClick={handleOk}
                className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
                autoFocus
              >
                Go to Login
              </button>

              {showRetry && (
                <button
                  onClick={handleRetry}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
                >
                  Try Again
                </button>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-3 text-center">
            <p className="text-xs text-gray-500">
              For security, sessions expire after 15 minutes of inactivity
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default SessionExpiredModal;

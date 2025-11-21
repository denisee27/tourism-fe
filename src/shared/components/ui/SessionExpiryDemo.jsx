import React from "react";
import { useUIStore } from "../../../core/stores/uiStore";
import { useAuthStore } from "../../../features/auth/stores/authStore";
import { logger } from "../../../core/utils/logger";

/**
 * Session Expiry Demo
 *
 * Test the session expiry modal with different scenarios.
 */

const SessionExpiryDemo = () => {
  const openModal = useUIStore((state) => state.openModal);
  const logout = useAuthStore((state) => state.logout);
  const showInfo = useUIStore((state) => state.showInfo);

  const handleTestBasicModal = () => {
    logger.info("Testing basic session expired modal");
    openModal("sessionExpired", {
      reason: "Your session has expired. Please log in again.",
    });
  };

  const handleTestRefreshFailed = () => {
    logger.info("Testing refresh failed modal");
    openModal("sessionExpired", {
      reason: "Unable to refresh your session. Please log in again.",
    });
  };

  const handleTestSessionInvalid = () => {
    logger.info("Testing session invalid modal");
    openModal("sessionExpired", {
      reason: "Your session is no longer valid. Please log in again.",
    });
  };

  const handleTestWithRetry = () => {
    logger.info("Testing modal with retry option");
    openModal("sessionExpired", {
      reason: "Connection lost. Your session may have expired.",
      showRetry: true,
      onRetry: () => {
        showInfo("Retry clicked - attempting to reconnect...");
        logger.info("Retry action triggered");
      },
    });
  };

  const handleSimulateLogout = async () => {
    logger.info("Simulating logout with modal");
    await logout("Session expired due to inactivity", true);
  };

  return (
    <div className="p-8 space-y-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Session Expiry Modal Demo</h1>
        <p className="text-gray-600 mb-8">
          Test the session expiry modal in different scenarios. This modal appears when refresh
          fails or session expires.
        </p>

        {/* Test Scenarios */}
        <section className="bg-white  rounded-lg p-6 shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">🧪 Test Scenarios</h2>

          <div className="space-y-3">
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-medium">Basic Session Expired</h3>
                  <p className="text-sm text-gray-600 mt-1">Standard session expiry message</p>
                </div>
                <button
                  onClick={handleTestBasicModal}
                  className="ml-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm"
                >
                  Test
                </button>
              </div>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-medium">Refresh Failed</h3>
                  <p className="text-sm text-gray-600 mt-1">Shown when token refresh fails</p>
                </div>
                <button
                  onClick={handleTestRefreshFailed}
                  className="ml-4 px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition text-sm"
                >
                  Test
                </button>
              </div>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-medium">Session Invalid</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Shown when backend invalidates session
                  </p>
                </div>
                <button
                  onClick={handleTestSessionInvalid}
                  className="ml-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
                >
                  Test
                </button>
              </div>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-medium">With Retry Option</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Shown with a retry button (e.g., network issues)
                  </p>
                </div>
                <button
                  onClick={handleTestWithRetry}
                  className="ml-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition text-sm"
                >
                  Test
                </button>
              </div>
            </div>

            <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-medium text-red-900">Simulate Logout</h3>
                  <p className="text-sm text-red-700 mt-1">
                    ⚠️ This will actually log you out and show the modal
                  </p>
                </div>
                <button
                  onClick={handleSimulateLogout}
                  className="ml-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Modal Features */}
        <section className="bg-white  rounded-lg p-6 shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">✨ Modal Features</h2>

          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <svg
                className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>
                <strong>Beautiful Design:</strong> Clean, modern UI with gradient background
              </span>
            </li>
            <li className="flex items-start gap-2">
              <svg
                className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>
                <strong>Backdrop Blur:</strong> Focused attention with blurred background
              </span>
            </li>
            <li className="flex items-start gap-2">
              <svg
                className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>
                <strong>Auto-Focus:</strong> "Go to Login" button automatically focused
              </span>
            </li>
            <li className="flex items-start gap-2">
              <svg
                className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>
                <strong>Keyboard Accessible:</strong> Full keyboard navigation support
              </span>
            </li>
            <li className="flex items-start gap-2">
              <svg
                className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>
                <strong>ARIA Labels:</strong> Screen reader friendly
              </span>
            </li>
            <li className="flex items-start gap-2">
              <svg
                className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>
                <strong>Custom Messages:</strong> Dynamic reason text
              </span>
            </li>
            <li className="flex items-start gap-2">
              <svg
                className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>
                <strong>Optional Retry:</strong> Can show retry button with custom action
              </span>
            </li>
            <li className="flex items-start gap-2">
              <svg
                className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>
                <strong>Auto-Redirect:</strong> Redirects to login on OK click
              </span>
            </li>
          </ul>
        </section>

        {/* When It Appears */}
        <section className="bg-white  rounded-lg p-6 shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">⏰ When It Appears</h2>

          <div className="space-y-3 text-sm">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="font-medium text-blue-900 mb-1">1. Token Refresh Fails</p>
              <p className="text-blue-700">
                When automatic token refresh fails (network error, backend down, etc.)
              </p>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="font-medium text-blue-900 mb-1">2. Session Invalidated</p>
              <p className="text-blue-700">
                When backend invalidates the session (admin action, security policy, etc.)
              </p>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="font-medium text-blue-900 mb-1">3. 401 Unauthorized</p>
              <p className="text-blue-700">When API returns 401 and refresh attempt fails</p>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="font-medium text-blue-900 mb-1">4. Manual Logout</p>
              <p className="text-blue-700">When logout is called with showModal=true parameter</p>
            </div>
          </div>
        </section>

        {/* Code Example */}
        <section className="bg-gray-900 text-gray-100 rounded-lg p-6 shadow-md">
          <h2 className="text-xl font-semibold mb-4">💻 Code Example</h2>

          <pre className="text-sm overflow-auto">
            {`// Open modal manually
import { useUIStore } from '@/core/stores/uiStore';

const openModal = useUIStore(state => state.openModal);

openModal('sessionExpired', {
  reason: 'Your session has expired',
  showRetry: false, // Optional
  onRetry: () => { /* retry logic */ } // Optional
});

// Or use logout with modal
import { useAuthStore } from '@/features/auth/stores/authStore';

const logout = useAuthStore(state => state.logout);

await logout(
  'Session expired due to inactivity',
  true // Show modal
);`}
          </pre>
        </section>
      </div>
    </div>
  );
};

export default SessionExpiryDemo;

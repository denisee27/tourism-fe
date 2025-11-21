import React from "react";
import { useNavigate } from "react-router-dom";
import { usePermissions } from "../../../core/auth/usePermissions";

/**
 * 403 Forbidden Page
 *
 * Displayed when user tries to access a resource without proper permissions.
 */

const ForbiddenPage = () => {
  const navigate = useNavigate();
  const { user, role } = usePermissions();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md text-center">
        {/* 403 Icon */}
        <div className="mb-8 flex justify-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-red-100">
            <svg
              className="h-12 w-12 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
        </div>

        {/* Error Code */}
        <h1 className="mb-4 text-6xl font-bold text-gray-900">403</h1>

        {/* Error Message */}
        <h2 className="mb-4 text-2xl font-semibold text-gray-800">Access Forbidden</h2>

        <p className="mb-8 text-gray-600">
          You don't have permission to access this resource.
          {role && (
            <>
              <br />
              <span className="text-sm text-gray-500">
                Your current role: <span className="font-semibold">{role}</span>
              </span>
            </>
          )}
        </p>

        {/* User Info (for debugging) */}
        {user && process.env.NODE_ENV === "development" && (
          <details className="mb-8 rounded-lg bg-gray-100 p-4 text-left">
            <summary className="cursor-pointer text-sm font-semibold text-gray-700">
              Debug Info
            </summary>
            <pre className="mt-2 overflow-auto text-xs text-gray-600">
              {JSON.stringify({ user: user.email, role, permissions: user.permissions }, null, 2)}
            </pre>
          </details>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={handleGoBack}
            className="rounded-md border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            ← Go Back
          </button>
          <button
            onClick={handleGoHome}
            className="rounded-md bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Go to Dashboard
          </button>
        </div>

        {/* Help Text */}
        <p className="mt-8 text-sm text-gray-500">
          If you believe this is a mistake, please contact your administrator.
        </p>
      </div>
    </div>
  );
};

export default ForbiddenPage;

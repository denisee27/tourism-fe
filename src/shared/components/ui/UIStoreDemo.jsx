import React from "react";
import { useUIStore } from "../../../core/stores/uiStore";

/**
 * UI Store Demo Component
 *
 * Test all UI Store features:
 * - Toast notifications (success, error, warning, info)
 * - Sidebar toggle
 * - Theme toggle
 * - Loading states
 * - Modals
 * - Breadcrumbs
 *
 * Add this to a page to test UI Store functionality.
 */

export const UIStoreDemo = () => {
  const store = useUIStore();
  const isLoading = store.isLoading("demo");
  const isModalOpen = store.isModalOpen("demo");

  const simulateLoading = () => {
    store.setLoading("demo", true);
    setTimeout(() => {
      store.setLoading("demo", false);
      store.showSuccess("Loading complete!");
    }, 2000);
  };

  return (
    <div className="p-8 space-y-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">UI Store Demo</h1>
        <p className="text-gray-600 mb-8">
          Test all UI store features. Open Redux DevTools to see state changes.
        </p>

        {/* Toast Notifications */}
        <section className="bg-white  rounded-lg p-6 shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">🔔 Toast Notifications</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => store.showSuccess("Success! Everything works perfectly.")}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
              Success Toast
            </button>
            <button
              onClick={() => store.showError("Error! Something went wrong.")}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
              Error Toast
            </button>
            <button
              onClick={() => store.showWarning("Warning! Please be careful.")}
              className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition"
            >
              Warning Toast
            </button>
            <button
              onClick={() => store.showInfo("Info: This is some information.")}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Info Toast
            </button>
            <button
              onClick={() => {
                store.showSuccess("Toast 1");
                setTimeout(() => store.showInfo("Toast 2"), 300);
                setTimeout(() => store.showWarning("Toast 3"), 600);
              }}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
            >
              Multiple Toasts
            </button>
          </div>
        </section>

        {/* Sidebar */}
        <section className="bg-white  rounded-lg p-6 shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">📱 Sidebar</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Current state: {store.isSidebarCollapsed ? "Collapsed" : "Expanded"}
          </p>
          <button
            onClick={() => store.toggleSidebar()}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
          >
            Toggle Sidebar
          </button>
        </section>

        {/* Theme */}
        <section className="bg-white  rounded-lg p-6 shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">🌓 Theme</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Current theme: {store.theme}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => store.setTheme("light")}
              className="px-4 py-2 bg-yellow-400 text-gray-900 rounded hover:bg-yellow-500 transition"
            >
              ☀️ Light
            </button>
            <button
              onClick={() => store.setTheme("dark")}
              className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 transition"
            >
              🌙 Dark
            </button>
            <button
              onClick={() => store.toggleTheme()}
              className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-gray-900 text-white rounded hover:opacity-90 transition"
            >
              🔄 Toggle
            </button>
          </div>
        </section>

        {/* Loading States */}
        <section className="bg-white  rounded-lg p-6 shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">⏳ Loading States</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Loading: {isLoading ? "Yes" : "No"}
          </p>
          <button
            onClick={simulateLoading}
            disabled={isLoading}
            className={`px-4 py-2 rounded transition ${
              isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 text-white"
            }`}
          >
            {isLoading ? "Loading..." : "Simulate Loading (2s)"}
          </button>
        </section>

        {/* Modals */}
        <section className="bg-white  rounded-lg p-6 shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">🪟 Modals</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Modal open: {isModalOpen ? "Yes" : "No"}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => store.openModal("demo", { message: "Hello from modal!" })}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
            >
              Open Modal
            </button>
            {isModalOpen && (
              <button
                onClick={() => store.closeModal("demo")}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
              >
                Close Modal
              </button>
            )}
          </div>

          {isModalOpen && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
              <p className="font-medium">Modal Content</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Data: {JSON.stringify(store.getModalData("demo"))}
              </p>
            </div>
          )}
        </section>

        {/* Breadcrumbs */}
        <section className="bg-white  rounded-lg p-6 shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">🍞 Breadcrumbs</h2>
          <div className="mb-4">
            {store.breadcrumbs.length > 0 ? (
              <nav className="flex text-sm">
                {store.breadcrumbs.map((crumb, index) => (
                  <React.Fragment key={index}>
                    <span className="text-gray-600 dark:text-gray-400">{crumb.label}</span>
                    {index < store.breadcrumbs.length - 1 && (
                      <span className="mx-2 text-gray-400">/</span>
                    )}
                  </React.Fragment>
                ))}
              </nav>
            ) : (
              <p className="text-sm text-gray-500">No breadcrumbs set</p>
            )}
          </div>
          <button
            onClick={() =>
              store.setBreadcrumbs([
                { label: "Home", path: "/" },
                { label: "Users", path: "/users" },
                { label: "Profile", path: "/users/123" },
              ])
            }
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition mr-2"
          >
            Set Breadcrumbs
          </button>
          <button
            onClick={() => store.clearBreadcrumbs()}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
          >
            Clear
          </button>
        </section>

        {/* Page Title */}
        <section className="bg-white  rounded-lg p-6 shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">📄 Page Title</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Current: {store.pageTitle || "(none)"}
          </p>
          <button
            onClick={() => store.setPageTitle("UI Store Demo")}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition mr-2"
          >
            Set Title
          </button>
          <button
            onClick={() => store.setPageTitle("")}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
          >
            Clear Title
          </button>
        </section>

        {/* Reset */}
        <section className="bg-white  rounded-lg p-6 shadow-md">
          <h2 className="text-xl font-semibold mb-4">🔄 Reset</h2>
          <button
            onClick={() => {
              store.reset();
              store.showInfo("UI Store reset to defaults");
            }}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Reset All UI State
          </button>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Note: Theme is not reset (user preference persists)
          </p>
        </section>
      </div>
    </div>
  );
};

export default UIStoreDemo;

import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import "./index.css";
import AppProviders from "./app/providers/AppProviders.jsx";
import { ErrorBoundary } from "./shared/components/ui/ErrorBoundary.jsx";
import { setupGlobalErrorHandlers } from "./core/utils/errorHandler.js";
import { useAuthInit } from "./core/auth/useAuthInit.js";
import { router } from "./app/router/index.jsx";
import { InitializingScreen } from "./shared/components/loading/InitializingScreen.jsx";

setupGlobalErrorHandlers();

function AppShell() {
  const { isInitializing } = useAuthInit();

  if (isInitializing) {
    return <InitializingScreen />;
  }

  return (
    <Suspense fallback={<InitializingScreen />}>
      <RouterProvider router={router} />
    </Suspense>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary>
      <AppProviders>
        <AppShell />
      </AppProviders>
    </ErrorBoundary>
  </StrictMode>
);

// You can youse lazy load if you want
// But please change the error boundary system
// Because all of the system has their on cycle

import { createBrowserRouter, Outlet } from "react-router-dom";
import SessionExpiredModal from "../../features/auth/components/SessionExpiredModal.jsx";
import { PERMISSIONS } from "../../core/constants/permissions.js";
import { MainLayout } from "../../shared/components/layouts/MainLayout.jsx";
import RoleDashboard from "../../shared/components/layouts/RoleDashboard.jsx";
import ProtectedRoute from "../../shared/components/guards/ProtectedRoute.jsx";
import PublicRoute from "../../shared/components/guards/PublicRoute.jsx";
import LoginPage from "../../features/auth/pages/LoginPage.jsx";
import RegisterPage from "../../features/auth/pages/RegisterPage.jsx";
import ForgotPasswordPage from "../../features/auth/pages/ForgotPasswordPage.jsx";
import ForbiddenPage from "../../shared/components/pages/ForbiddenPage.jsx";
import UIStoreDemo from "../../shared/components/ui/UIStoreDemo.jsx";
import RBACDemo from "../../shared/components/ui/RBACDemo.jsx";
import TokenRefreshDemo from "../../shared/components/ui/TokenRefreshDemo.jsx";
import SessionExpiryDemo from "../../shared/components/ui/SessionExpiryDemo.jsx";
import APIDemo from "../../shared/components/ui/APIDemo.jsx";
import ReactQueryDemo from "../../shared/components/ui/ReactQueryDemo.jsx";
import ErrorBoundary from "../../shared/components/ui/ErrorBoundary.jsx";
import NotFoundPage from "../../shared/components/pages/NotFoundPage.jsx";
import MainPage from "../../features/landingPage/pages/mainPage.jsx";
import VerifyEmailPage from "../../features/auth/pages/verifyEmailPage.jsx";
import { FormConversation } from "../../features/conversation/pages/FormConversation.jsx";
import { Conversation } from "../../features/conversation/pages/conversation.jsx";

const UsersPage = () => (
  <div className="p-4 text-xl">User Management (Protected; requires users.view)</div>
);
const InvoicesPage = () => (
  <div className="p-4 text-xl">Invoices (Protected; requires invoices.view)</div>
);
const AdminPage = () => (
  <div className="p-4 text-xl">Admin Panel (Protected; requires admin role)</div>
);
const RootLayout = () => (
  <ErrorBoundary>
    <SessionExpiredModal />
    <Outlet />
  </ErrorBoundary>
);

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        element: <PublicRoute />,
        children: [
          { path: "/home", element: <MainPage /> },
          { path: "/verify-email", element: <VerifyEmailPage /> },
          { path: "/login", element: <LoginPage /> },
          { path: "/register", element: <RegisterPage /> },
          { path: "/forgot-password", element: <ForgotPasswordPage /> },
        ],
      },
      {
        path: "/forbidden",
        element: <ForbiddenPage />,
      },
      {
        path: "/",
        element: <ProtectedRoute />,
        children: [
          {
            element: <MainLayout />,
            children: [
              { index: true, element: <FormConversation /> },
              { index: 'conversation', element: <Conversation /> },
              { path: "ui-demo", element: <UIStoreDemo /> },
              { path: "rbac-demo", element: <RBACDemo /> },
              { path: "token-demo", element: <TokenRefreshDemo /> },
              { path: "session-demo", element: <SessionExpiryDemo /> },
              { path: "api-demo", element: <APIDemo /> },
              { path: "react-query-demo", element: <ReactQueryDemo /> },
            ],
          },
        ],
      },
      {
        path: "/users",
        element: <ProtectedRoute permission={PERMISSIONS.USERS_VIEW} />,
        children: [
          {
            element: <MainLayout />,
            children: [{ index: true, element: <UsersPage /> }],
          },
        ],
      },
      {
        path: "/invoices",
        element: <ProtectedRoute permission={PERMISSIONS.INVOICES_VIEW} />,
        children: [
          {
            element: <MainLayout />,
            children: [{ index: true, element: <InvoicesPage /> }],
          },
        ],
      },
      {
        path: "/admin",
        element: <ProtectedRoute role="admin" />,
        children: [
          {
            element: <MainLayout />,
            children: [{ index: true, element: <AdminPage /> }],
          },
        ],
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);

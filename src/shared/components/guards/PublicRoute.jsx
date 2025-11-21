import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../../core/auth/useAuth";
import { LoadingScreen } from "../loading/LoadingScreen";

export default function PublicRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children ? children : <Outlet />;
}

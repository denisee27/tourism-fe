import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../../core/auth/useAuth";
import { LoadingScreen } from "../loading/LoadingScreen";
import SuperAdminDashboard from "../../../features/dashboard/pages/SuperAdminDashboard";
import { ROLES } from "../../../core/constants/permissions";

//* This needs to be improved, can move the other to /feature lateron
export const RoleDashboard = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!user?.role) {
    return <Navigate to="/login" replace />;
  }

  switch (user.role) {
    case ROLES.SUPER_ADMIN:
      return <SuperAdminDashboard />;
    case ROLES.ADMIN:
      return <AdminDashboard />;
    case ROLES.MANAGER:
      return <ManagerDashboard />;
    case ROLES.USER:
      return <UserDashboard />;
    default:
      return <DefaultDashboard role={user.role} />;
  }
};

const DashboardContainer = ({ title, subtitle }) => (
  <div className="space-y-6 rounded-2xl bg-white p-10 shadow-xl">
    <div className="space-y-2">
      <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
      <p className="text-gray-600">{subtitle}</p>
    </div>
    <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-6 text-sm text-gray-500">
      <p>
        This is a placeholder view. Replace it with real content tailored for this role. You can
        split dashboards into separate feature folders or load them lazily.
      </p>
    </div>
  </div>
);

const AdminDashboard = () => (
  <DashboardContainer
    title="Admin Control Center"
    subtitle="Manage teams, configure permissions, and oversee daily operations."
  />
);

const ManagerDashboard = () => (
  <DashboardContainer
    title="Manager Workspace"
    subtitle="Track team progress, approve workflows, and monitor KPIs at a glance."
  />
);

const UserDashboard = () => (
  <DashboardContainer
    title="Welcome back"
    subtitle="Here’s a quick snapshot of your tasks, recent activity, and helpful resources."
  />
);

const DefaultDashboard = ({ role }) => (
  <DashboardContainer
    title="Dashboard"
    subtitle={`No custom dashboard is defined for the role “${role}”.`}
  />
);

export default RoleDashboard;

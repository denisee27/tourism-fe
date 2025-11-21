import React, { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import { LoadingScreen } from "../../../shared/components/loading/LoadingScreen.jsx";
import { useUserActivity } from "../hooks/useUserActivity.js";
import { formatDateLabel } from "../utils/date.js";

const COLORS = ["#6366F1", "#22D3EE", "#FB7185", "#F59E0B", "#34D399"];

export default function SuperAdminDashboard() {
  const { data: stats, isLoading, error } = useUserActivity();

  const dailyActivity = useMemo(
    () =>
      (stats?.dailyActivity ?? []).map((item) => ({
        date: formatDateLabel(item.date),
        count: item.count,
      })),
    [stats]
  );

  const actionsByType = useMemo(
    () =>
      (stats?.actionsByType ?? []).map((item) => ({
        name: item.action
          .toLowerCase()
          .replace(/_/g, " ")
          .replace(/\b\w/g, (char) => char.toUpperCase()),
        value: item.count,
        percentage: item.percentage,
      })),
    [stats]
  );

  const topActors = stats?.topActors ?? [];
  const recentActivity = stats?.recentActivity ?? [];
  const totals = stats?.totals ?? {};
  const mostActiveDay = stats?.mostActiveDay;

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
        <p className="font-semibold">Unable to load activity metrics.</p>
        <p className="text-sm text-red-600/80">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Actions" value={totals.actions ?? 0} />
        <StatCard title="Unique Actors" value={totals.uniqueActors ?? 0} />
        <StatCard
          title="Most Active Day"
          value={mostActiveDay ? formatDateLabel(mostActiveDay.date) : "—"}
          helper={mostActiveDay ? `${mostActiveDay.count} actions` : ""}
        />
        <StatCard
          title="Date Range"
          value={stats?.range ? `${formatDateLabel(stats.range.startDate)} – ${formatDateLabel(stats.range.endDate)}` : "30 days"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <SectionHeader title="Daily Activity" helper="Actions per day across the selected range" />
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyActivity} margin={{ top: 10, left: -20, right: 10 }}>
                <defs>
                  <linearGradient id="activity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" allowDecimals={false} />
                <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                <Area type="monotone" dataKey="count" stroke="#6366F1" strokeWidth={2} fill="url(#activity)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <SectionHeader title="Actions by Type" helper="Top actions executed this period" />
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={actionsByType} layout="vertical" margin={{ left: 40, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis type="number" stroke="#9CA3AF" />
                <YAxis dataKey="name" type="category" width={120} stroke="#9CA3AF" />
                <Tooltip formatter={(value, _name, payload) => [`${value} actions`, payload.payload.name]} />
                <Bar dataKey="value" radius={[4, 4, 4, 4]}>
                  {actionsByType.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <SectionHeader title="Top Actors" helper="Most active users in this period" />
          <ul className="mt-4 space-y-3">
            {topActors.map((entry) => (
              <li key={entry.actor.id} className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
                <div>
                  <p className="font-medium text-gray-900">{entry.actor.name}</p>
                  <p className="text-xs text-gray-500">{entry.actor.email}</p>
                </div>
                <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-semibold text-indigo-600">
                  {entry.count} actions
                </span>
              </li>
            ))}
            {!topActors.length && (
              <li className="rounded-lg bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
                No activity recorded yet.
              </li>
            )}
          </ul>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <SectionHeader title="Action Breakdown" helper="Share of actions by type" />
          <div className="mx-auto h-64 w-full">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={actionsByType} dataKey="percentage" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={4}>
                  {actionsByType.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value}%`, name]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <SectionHeader title="Recent Activity" helper="Latest events captured by the audit log" />
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 font-medium text-gray-600">Action</th>
                <th className="px-4 py-2 font-medium text-gray-600">Actor</th>
                <th className="px-4 py-2 font-medium text-gray-600">Target</th>
                <th className="px-4 py-2 font-medium text-gray-600">When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentActivity.slice(0, 8).map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium text-gray-800">{entry.action.replace(/_/g, " ")}</td>
                  <td className="px-4 py-2 text-gray-600">{entry.actor?.name ?? "Unknown"}</td>
                  <td className="px-4 py-2 text-gray-600">{entry.targetUser?.name ?? "—"}</td>
                  <td className="px-4 py-2 text-xs text-gray-500">{new Date(entry.createdAt).toLocaleString()}</td>
                </tr>
              ))}
              {!recentActivity.length && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-500">
                    No recent events during this period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const StatCard = ({ title, value, helper }) => (
  <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
    <p className="text-sm font-medium text-gray-500">{title}</p>
    <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
    {helper && <p className="mt-1 text-xs text-gray-500">{helper}</p>}
  </div>
);

const SectionHeader = ({ title, helper }) => (
  <div className="mb-4">
    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
    {helper && <p className="text-sm text-gray-500">{helper}</p>}
  </div>
);

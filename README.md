# Frontend Template

A Front end template with tanstackquery and other libraries.

---

## Tech behind it

- **React 19 + Vite 5**
- **Tailwind CSS** utility-first styling
- **Auth flow** with JWT access token, refresh token cookies, session restoration
- **Zustand stores** for auth and UI with persistence
- **React Query (@tanstack)** for data fetching, caching, optimistic updates
- **Centralized API client** (Axios) with interceptors, retries, error mapping
- **Role-Based Access Control** (guards, permission hook, constants)
- **Charts** preconfigured (Recharts) for dashboards
- **Feature-based folder structure** (+shared components & utils)
- **Error handling** (ErrorBoundary + global handlers)
- **Vitest + Testing Library** scaffolding

---

## Tech Stack

| Category       | Library / Tool                       |
| -------------- | ------------------------------------ |
| Build          | [Vite](https://vitejs.dev/)          |
| UI & Styling   | React 19, Tailwind CSS, Lucide icons |
| State          | React Query, Zustand                 |
| Auth & Routing | React Router v7                      |
| HTTP Client    | Axios                                |
| Charts         | Recharts                             |
| Validation     | Zod, React Hook Form                 |
| Testing        | Vitest, Testing Library              |
| Lint           | ESLint                               |

---

## Project Structure (summary)

```
src/
├── app/
│   ├── providers/AppProviders.jsx
│   └── router/index.jsx
├── core/
│   ├── api/               # axios client, transformers, error mapping
│   ├── auth/              # hooks, token refresh manager
│   ├── config/env.js
│   ├── constants/permissions.js
│   ├── queries/queryKeys.js
│   └── stores/uiStore.js
├── features/
│   ├── auth/              # login, register, store
│   ├── dashboard/         # hooks + dashboards (Recharts)
│   ├── users/             # React Query hooks, mutations
│   └── ... other features
├── shared/
│   ├── components/
│   │   ├── guards/        # ProtectedRoute, PermissionGuard, PublicRoute
│   │   ├── layouts/       # MainLayout, Sidebar, RoleDashboard
│   │   ├── loading/       # Loading screens
│   │   └── ui/            # demos, token refresh, RBAC showcase
│   └── utils/
└── main.jsx               # entry point
```

---

## Quick Start

### 1. Requirements

- Node.js ≥ 18 (use 20 LTS if possible)
- npm ≥ 9

### 2. Install

```bash
git clone <repo-url>
cd frontend-template
npm install
```

### 3. Environment variables

Copy `.env.example` to `.env.local` and adjust values:

```bash
cp .env.example .env.local
```

| Variable               | Description                                             |
| ---------------------- | ------------------------------------------------------- | --------- | ------------ |
| `VITE_API_BASE_URL`    | Backend API root (e.g., `http://localhost:3000/api/v1`) |
| `VITE_ENV`             | `development`                                           | `staging` | `production` |
| `VITE_ENABLE_DEVTOOLS` | Toggle React Query Devtools (`true/false`)              |
| `VITE_LOG_LEVEL`       | `debug`, `info`, `warn`, `error`                        |

### 4. Run

```bash
npm run dev
```

Dev server: `http://localhost:5173`

### 5. Install charts

```bash
npm install recharts
```

---

## npm Scripts

| Command           | Description              |
| ----------------- | ------------------------ |
| `npm run dev`     | Start Vite dev server    |
| `npm run build`   | Build production bundle  |
| `npm run preview` | Preview production build |

---

## Architecture Overview

- **Feature-based structure:** Each feature owns its pages, API, hooks, utils (`features/auth`, `features/users`, `features/dashboard`, etc.).
- **Shared library (`src/shared`)** houses reusable UI, guards, layouts, loaders.
- **Core (`src/core`)** centralizes API client, auth utilities, query keys, constants, stores.
- **Routing:** `src/app/router/index.jsx` with public, protected, permissioned routes. `<RoleDashboard />` decides the per-role landing page.

### Stores (Zustand):

- `features/auth/stores/authStore.js`: user state, login/logout, session restore.
- `core/stores/uiStore.js`: sidebar, toast notifications, theme, modals.

### React Query Patterns:

- Query keys generated via factories in `core/queries/queryKeys.js`.
- Per-feature hooks in `features/<feature>/hooks` (e.g., `useUsers`, `useUserActivity`).
- Mutations wrap Axios calls, use optimistic updates, and use UI toasts.

### API Client:

- `core/api/client.js`: Axios instance with logging, token injection, refresh flow, retry logic.
- `core/api/transformers.js`: shapes API responses.
- `core/api/errorMapping.js`: maps HTTP errors to friendly `AppError` objects.
- Use `api.post`, `api.getPaginated`, etc. within features.

### Authentication Flow:

1. Login with `useLogin` → `authApi.login` → `authStore.setAuth` (persists token + schedules refresh).
2. `useAuthInit` runs at app start to restore session via `/auth/me`.
3. Axios interceptor handles 401: attempts refresh (`authApi.refreshToken`). On success, replays original request. On failure, logs out, clears tokens, opens session-expired modal.
4. `PublicRoute` ensures authenticated users can’t see login/register; `ProtectedRoute` ensures session for private routes; `PermissionGuard` checks permissions/roles.

### RBAC & Permissions:

- `core/constants/permissions.js`: colon-delimited permission strings (`users:create`, `users:delete`, etc.) and role hierarchy.
- `usePermissions` returns `can`, `hasRole`, `isSuperAdmin`, etc.
- `PermissionGuard` wraps UI portions requiring specific permissions/roles.
- `RBACDemo` page shows usage patterns.

### Dashboards:

- `RoleDashboard.jsx`: chooses dashboard component per user role.
- `features/dashboard/hooks/useUserActivity.js`: fetcher for `/stats/user-activity` using React Query.
- `features/dashboard/pages/SuperAdminDashboard.jsx`: uses Recharts to render daily activity, action breakdown, top actors, recent activity.
- Extend by adding more dashboards (Admin, Manager) under `features/dashboard/pages` and include them in `RoleDashboard` or load lazily.

### Loading & Error UX:

- `LoadingScreen` and `InitializingScreen` handle app-load states.
- `ErrorBoundary` around `AppProviders` ensures runtime errors show friendly UI.
- React Router accepts `errorElement` for route-level fallbacks.
- To customize errors, extend `ErrorBoundary` or route error elements.

### Logs:

- `core/utils/logger.js` implements leveled logging (`debug`, `info`, `warn`, `error`), plus helpers for API, navigation, state changes.
- Controlled via `VITE_LOG_LEVEL`.
- `sendToExternalService` stub to integrate Sentry/LogRocket later.

---

## React Query & Recharts Setup

- Query keys: `dashboardKeys.userActivity({ role, range })` isolates caches by role or filter.
- Hook usage:
  ```js
  const { data, isLoading, error } = useUserActivity({ role: user.role, range: "30d" });
  ```
- Recharts example data transformation in `SuperAdminDashboard` (maps daily activity, actions by type, top actors, recent events).
- Tailwind + Recharts layout ensures responsiveness.

---

## Common Workflows

### Add a new data query

1. Define query key in `core/queries/queryKeys.js` (or feature-specific file).
2. Create fetcher (Axios call) under `features/<feature>/api` or `hooks`.
3. Wrap in React Query hook.
4. Consume hook in component.
5. Invalidate queries via same key when necessary.

### Add a route/page

1. Create page/component under `features/<feature>/pages`.
2. Add route in `src/app/router/index.jsx` using `PublicRoute` / `ProtectedRoute` / `PermissionGuard` as needed.
3. Add navigation entry to Sidebar with `PermissionGuard` if it’s role-specific.

### RBAC update

1. Update `core/constants/permissions.js` and backend to use same colon-delimited identifiers.
2. Use `PermissionGuard` or `usePermissions()` to toggle new components.

import React from 'react';
import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  Navigate,
} from '@tanstack/react-router';
import { AppProvider } from '@/context/AppContext';
import { AppLayout } from '@/components/layout';
import { ChatPage } from '@/pages/chat/ChatPage';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { DataRepoPage } from '@/pages/data-repo/DataRepoPage';
import { ProjectsPage } from '@/pages/projects/ProjectsPage';
import { TasksPage } from '@/pages/tasks/TasksPage';
import { MeetingsPage } from '@/pages/meetings/MeetingsPage';
import { CalendarPage } from '@/pages/calendar/CalendarPage';
import { ReportsPage } from '@/pages/reports/ReportsPage';
import {
  AdminPage,
  UsersPage,
  DepartmentsPage,
  RolesPage,
  PoliciesPage,
  LogsPage,
  ConfigPage,
} from '@/pages/admin';
import { LoginPage } from '@/pages/auth/LoginPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

// Root Route wrapping AppProvider and AppLayout
const rootRoute = createRootRoute({
  component: () => (
    <AppProvider>
      <AppLayout>
        <Outlet />
      </AppLayout>
    </AppProvider>
  ),
  notFoundComponent: NotFoundPage,
});

// Route Definitions
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => <Navigate to="/chat" />,
});

const chatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/chat',
  component: ChatPage,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: DashboardPage,
});

const dataRepoRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/data-repo',
  component: DataRepoPage,
});

const projectsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/projects',
  component: ProjectsPage,
});

const tasksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tasks',
  component: TasksPage,
});

const meetingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/meetings',
  component: MeetingsPage,
});

const calendarRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/calendar',
  component: CalendarPage,
});

const reportsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reports',
  component: ReportsPage,
});

// ============================================================================
// ADMIN ROUTES (Độc lập cho từng phân hệ, không dùng tab bar)
// ============================================================================
const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminPage,
});

const adminUsersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/users',
  component: UsersPage,
});

const adminDepartmentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/departments',
  component: DepartmentsPage,
});

const adminRolesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/roles',
  component: RolesPage,
});

const adminPoliciesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/policies',
  component: PoliciesPage,
});

const adminLogsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/logs',
  component: LogsPage,
});

const adminConfigRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/config',
  component: ConfigPage,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  chatRoute,
  dashboardRoute,
  dataRepoRoute,
  projectsRoute,
  tasksRoute,
  meetingsRoute,
  calendarRoute,
  reportsRoute,
  adminRoute,
  adminUsersRoute,
  adminDepartmentsRoute,
  adminRolesRoute,
  adminPoliciesRoute,
  adminLogsRoute,
  adminConfigRoute,
  loginRoute,
]);

export const router = createRouter({
  routeTree,
  defaultNotFoundComponent: NotFoundPage,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

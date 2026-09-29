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
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { ChatPage } from '@/pages/chat/ChatPage';
import { AccountPage } from '@/pages/account/AccountPage';
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

const accountRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/account',
  component: AccountPage,
});

// Các phân hệ đã hoàn thiện giao diện theo nexora-workbench-v3
const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: () => (
    <PermissionGuard isImplemented={true}>
      <DashboardPage />
    </PermissionGuard>
  ),
});

const dataRepoRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/data-repo',
  component: () => (
    <PermissionGuard module={['document', 'documents', 'data-repo']} isImplemented={true}>
      <DataRepoPage />
    </PermissionGuard>
  ),
});

const projectsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/projects',
  component: () => (
    <PermissionGuard isImplemented={true}>
      <ProjectsPage />
    </PermissionGuard>
  ),
});

const tasksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tasks',
  component: () => (
    <PermissionGuard isImplemented={true}>
      <TasksPage />
    </PermissionGuard>
  ),
});

const meetingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/meetings',
  component: () => (
    <PermissionGuard isImplemented={true}>
      <MeetingsPage />
    </PermissionGuard>
  ),
});

const calendarRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/calendar',
  component: () => (
    <PermissionGuard isImplemented={true}>
      <CalendarPage />
    </PermissionGuard>
  ),
});

const reportsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reports',
  component: () => (
    <PermissionGuard isImplemented={true}>
      <ReportsPage />
    </PermissionGuard>
  ),
});

// ============================================================================
// ADMIN ROUTES (Được bảo vệ bằng PermissionGuard theo từng phân hệ)
// ============================================================================
const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: () => (
    <PermissionGuard module="all" isImplemented={true}>
      <AdminPage />
    </PermissionGuard>
  ),
});

const adminUsersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/users',
  component: () => (
    <PermissionGuard module="user" isImplemented={true}>
      <UsersPage />
    </PermissionGuard>
  ),
});

const adminDepartmentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/departments',
  component: () => (
    <PermissionGuard module="department" isImplemented={true}>
      <DepartmentsPage />
    </PermissionGuard>
  ),
});

const adminRolesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/roles',
  component: () => (
    <PermissionGuard module={['role', 'roles', 'authorization']} isImplemented={true}>
      <RolesPage />
    </PermissionGuard>
  ),
});

const adminPoliciesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/policies',
  component: () => (
    <PermissionGuard isImplemented={true}>
      <PoliciesPage />
    </PermissionGuard>
  ),
});

const adminLogsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/logs',
  component: () => (
    <PermissionGuard module={['activitylog', 'activity_log', 'log', 'logs', 'audit']} isImplemented={true}>
      <LogsPage />
    </PermissionGuard>
  ),
});

const adminConfigRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/config',
  component: () => (
    <PermissionGuard isImplemented={true}>
      <ConfigPage />
    </PermissionGuard>
  ),
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  chatRoute,
  accountRoute,
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

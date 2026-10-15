import { useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { AllowMenuTreeItem } from '@/types';

export interface UserPermissionsResult {
  isSuperAdmin: boolean;
  permittedModules: Set<string>;
  hasModuleAccess: (module?: string | string[]) => boolean;
  canAccessPath: (path: string) => boolean;
  userRoles: string[];
  isLoading: boolean;
}

const MODULE_ALIASES: Record<string, string[]> = {
  USER: ['user', 'users'],
  DEPARTMENT: ['department', 'departments', 'dept'],
  ROLE: ['role', 'roles', 'authorization', 'permission', 'permissions'],
  AUTHORIZATION: ['role', 'roles', 'authorization', 'permission', 'permissions'],
  API_FUNCTION: ['role', 'roles', 'authorization', 'permission', 'permissions'],
  ACTIVITY_LOG: ['activitylog', 'activity_log', 'log', 'logs', 'audit'],
  DOCUMENT: ['document', 'documents', 'data-repo', 'doc'],
  FOLDER: ['document', 'documents', 'data-repo', 'doc'],
  PROJECT: ['project', 'projects', 'proj'],
  TASK: ['task', 'tasks'],
  MEETING: ['meeting', 'meetings', 'meet'],
  CALENDAR: ['calendar', 'cal'],
  REPORT: ['report', 'reports', 'rep'],
  DASHBOARD: ['dashboard'],
  CHAT: ['chat', 'ai'],
  AI: ['chat', 'ai'],
  POLICY: ['policy', 'policies'],
  CONFIG: ['config', 'configuration', 'system'],
  SYSTEM: ['config', 'configuration', 'system'],
  ORGANIZATION: ['organization', 'organizations'],
};

const normalizeCode = (value: unknown): string =>
  typeof value === 'string' ? value.trim().toUpperCase().replace(/[-\s]+/g, '_') : '';

const normalizeModule = (value: string): string =>
  value.trim().toLowerCase().replace(/[-\s]+/g, '_');

const flattenAllowMenuTree = (items: AllowMenuTreeItem[]): AllowMenuTreeItem[] =>
  items.flatMap((item) => [
    item,
    ...(Array.isArray(item.childFunctions) ? flattenAllowMenuTree(item.childFunctions) : []),
  ]);

const addAliasesForCode = (modules: Set<string>, code: unknown) => {
  const normalizedCode = normalizeCode(code);
  if (!normalizedCode) return;

  const rootCode = normalizedCode.split('.')[0];
  modules.add(normalizeModule(normalizedCode));
  modules.add(normalizeModule(rootCode));

  (MODULE_ALIASES[rootCode] || []).forEach((alias) => modules.add(normalizeModule(alias)));
};

const ADMIN_MODULES = [
  'user',
  'users',
  'department',
  'departments',
  'dept',
  'role',
  'roles',
  'authorization',
  'permission',
  'permissions',
  'activitylog',
  'activity_log',
  'log',
  'logs',
  'audit',
  'policy',
  'policies',
  'config',
  'configuration',
  'system',
];

export function useUserPermissions(): UserPermissionsResult {
  const { currentUser, isAuthLoading, isAuthenticated } = useApp();

  const userRoles = useMemo(() => {
    const roles: string[] = [];
    if (currentUser?.role) roles.push(currentUser.role);
    currentUser?.roles?.forEach((role) => {
      const name = role.roleName || (role as any).name || (role as any).role;
      if (name && !roles.includes(name)) roles.push(name);
    });
    return roles;
  }, [currentUser]);

  const isSuperAdmin = currentUser?.isSuperAdmin === true;
  const permissionSourceReady =
    Array.isArray(currentUser?.allowMenuTree) || Array.isArray(currentUser?.apiFunctions);
  const isLoading = isAuthLoading || (isAuthenticated && !permissionSourceReady);

  const permittedModules = useMemo(() => {
    const modules = new Set<string>();
    const allowMenuTree = currentUser?.allowMenuTree;

    if (Array.isArray(allowMenuTree)) {
      flattenAllowMenuTree(allowMenuTree).forEach((item) => {
        addAliasesForCode(modules, item.functionCode);
        addAliasesForCode(modules, item.parentCode);
      });
    } else if (Array.isArray(currentUser?.apiFunctions)) {
      currentUser.apiFunctions.forEach((fn: any) => {
        addAliasesForCode(modules, fn?.code || fn?.functionCode);
        addAliasesForCode(modules, fn?.module);
      });
    }

    if (isSuperAdmin) modules.add('all');
    return modules;
  }, [currentUser, isSuperAdmin]);

  const hasModuleAccess = (module?: string | string[]): boolean => {
    if (!module) return false;
    if (isSuperAdmin || permittedModules.has('all')) return true;

    const modules = Array.isArray(module) ? module : [module];
    return modules.some((item) => permittedModules.has(normalizeModule(item)));
  };

  const canAccessPath = (path: string): boolean => {
    if (isSuperAdmin) return true;

    const cleanPath = path.split('?')[0].replace(/\/$/, '');
    switch (cleanPath) {
      case '/chat':
        return hasModuleAccess(['chat', 'ai']);
      case '/dashboard':
        return hasModuleAccess('dashboard');
      case '/data-repo':
        return hasModuleAccess(['document', 'documents', 'data-repo', 'doc']);
      case '/projects':
        return hasModuleAccess(['project', 'projects', 'proj']);
      case '/tasks':
        return hasModuleAccess(['task', 'tasks']);
      case '/calendar':
        return hasModuleAccess(['calendar', 'cal']);
      case '/meetings':
        return hasModuleAccess(['meeting', 'meetings', 'meet']);
      case '/reports':
        return hasModuleAccess(['report', 'reports', 'rep']);
      case '/catalog/organizations':
        return hasModuleAccess('ORGANIZATION.READ');
      case '/admin':
        return hasModuleAccess(ADMIN_MODULES);
      case '/admin/users':
        return hasModuleAccess(['user', 'users']);
      case '/admin/departments':
        return hasModuleAccess(['department', 'departments', 'dept']);
      case '/admin/roles':
        return hasModuleAccess(['role', 'roles', 'authorization', 'permission', 'permissions']);
      case '/admin/logs':
        return hasModuleAccess(['activitylog', 'activity_log', 'log', 'logs', 'audit']);
      case '/admin/policies':
        return hasModuleAccess(['policy', 'policies']);
      case '/admin/config':
        return hasModuleAccess(['config', 'configuration', 'system']);
      default:
        return true;
    }
  };

  return {
    isSuperAdmin,
    permittedModules,
    hasModuleAccess,
    canAccessPath,
    userRoles,
    isLoading,
  };
}

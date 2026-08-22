import { NavModule } from '@/types';

export const APP_NAME = 'NEXORA AI';
export const APP_DESCRIPTION = 'Nền tảng Trợ lý AI nội bộ cho doanh nghiệp';

export const ACCESS_TOKEN_KEY = 'nexora_access_token';
export const REFRESH_TOKEN_KEY = 'nexora_refresh_token';

// Đọc URL từ biến môi trường Vite (.env)
export const API_BASE_URL: string =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env as any).NEXT_PUBLIC_API_URL ||
  'https://localhost:7267';

export const NAV_ITEMS: { id: NavModule; label: string; path: string }[] = [
  { id: 'chat', label: 'Trợ lý Chat AI', path: '/chat' },
  { id: 'dashboard', label: 'Dashboard Tổng quan', path: '/dashboard' },
  { id: 'data-repo', label: 'Kho dữ liệu', path: '/data-repo' },
  { id: 'projects', label: 'Quản lý Dự án', path: '/projects' },
  { id: 'tasks', label: 'Quản lý Công việc', path: '/tasks' },
  { id: 'meetings', label: 'Phòng họp AI', path: '/meetings' },
  { id: 'calendar', label: 'Lịch làm việc', path: '/calendar' },
  { id: 'reports', label: 'Báo cáo & Phân tích', path: '/reports' },
  { id: 'admin', label: 'Quản trị hệ thống', path: '/admin' },
];

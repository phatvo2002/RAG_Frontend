import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import {
  NavModule,
  User,
  Department,
  Project,
  TaskItem,
  DocumentItem,
  ChatMessage,
  ChatSession,
  CalendarEvent,
  LoginCredentials
} from '../types';
import {
  mockCurrentUser,
  mockUsers,
  mockDepartments,
  mockProjects,
  mockTasks,
  mockDocuments,
  mockChatSessions,
  mockChatMessages,
  mockCalendarEvents
} from '../data/mockData';
import { authApi } from '@/api/auth.api';

interface Toast {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
}

export type ThemeMode = 'light' | 'dark' | 'system';
export type AppLanguage = 'en' | 'vi';

interface AppContextType {
  // Language state & actions
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  toggleLanguage: () => void;

  // Theme state & actions
  theme: ThemeMode;
  isDark: boolean;
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;

  // Sidebar toggle state
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (open: boolean) => void;
  toggleMobileSidebar: () => void;

  activeModule: NavModule;
  setActiveModule: (module: NavModule) => void;
  activeAdminTab: string;
  setActiveAdminTab: (tab: string) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (val: boolean) => void;
  isAuthLoading: boolean;
  currentUser: User;
  setCurrentUser: (user: User) => void;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  
  // Data lists & CRUD state
  users: User[];
  addUser: (user: Omit<User, 'id'>) => void;
  updateUserStatus: (id: string, status: User['status']) => void;
  deleteUser: (id: string) => void;

  departments: Department[];
  addDepartment: (dept: Omit<Department, 'id'>) => void;

  projects: Project[];
  activeProject: Project | null;
  setActiveProject: (p: Project | null) => void;
  addProject: (p: Omit<Project, 'id'>) => void;

  tasks: TaskItem[];
  addTask: (task: Omit<TaskItem, 'id'>) => void;
  updateTaskStatus: (id: string, status: TaskItem['status']) => void;

  documents: DocumentItem[];
  addDocument: (doc: Omit<DocumentItem, 'id'>) => void;

  calendarEvents: CalendarEvent[];
  addCalendarEvent: (evt: Omit<CalendarEvent, 'id'>) => void;

  // Chat state
  chatSessions: ChatSession[];
  activeChatSessionId: string;
  setActiveChatSessionId: (id: string) => void;
  chatMessages: ChatMessage[];
  addChatMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  startNewChat: () => void;

  // Toast notifications
  toasts: Toast[];
  showToast: (message: string, type?: Toast['type']) => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { i18n } = useTranslation();

  // Language Management (Default: English 'en')
  const [language, setLanguageState] = useState<AppLanguage>(() => {
    const saved = localStorage.getItem('nexora_language') as AppLanguage;
    if (saved && (saved === 'en' || saved === 'vi')) {
      return saved;
    }
    return 'vi';
  });

  const setLanguage = (lang: AppLanguage) => {
    setLanguageState(lang);
    i18n.changeLanguage(lang);
    localStorage.setItem('nexora_language', lang);
  };

  const toggleLanguage = () => {
    const nextLang = language === 'en' ? 'vi' : 'en';
    setLanguage(nextLang);
  };

  // Sidebar Open/Close State
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() => {
    const saved = localStorage.getItem('nexora_sidebar_open');
    return saved !== null ? saved === 'true' : true;
  });

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => {
      const next = !prev;
      localStorage.setItem('nexora_sidebar_open', String(next));
      return next;
    });
  };

  // Mobile navigation drawer state is presentation-only and is intentionally
  // not persisted with the desktop sidebar preference.
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen((prev) => !prev);
  };

  // Theme Management
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('nexora_theme') as ThemeMode;
    if (saved && ['light', 'dark', 'system'].includes(saved)) {
      return saved;
    }
    return 'light';
  });

  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const saved = localStorage.getItem('nexora_theme');
    if (saved === 'dark') return true;
    if (saved === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Apply .dark class to <html> element
  useEffect(() => {
    const root = document.documentElement;
    const computeIsDark = () => {
      if (theme === 'dark') return true;
      if (theme === 'light') return false;
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    };

    const activeDark = computeIsDark();
    setIsDark(activeDark);

    if (activeDark) {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'black');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }

    localStorage.setItem('nexora_theme', theme);
  }, [theme]);

  // Listen to OS color scheme changes if theme === 'system'
  useEffect(() => {
    if (theme !== 'system') return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const activeDark = mediaQuery.matches;
      setIsDark(activeDark);
      if (activeDark) {
        document.documentElement.classList.add('dark');
        document.documentElement.setAttribute('data-theme', 'black');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.setAttribute('data-theme', 'light');
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Nhận diện module active từ đường dẫn URL
  const activeModule: NavModule = useMemo(() => {
    const path = location.pathname;
    if (path.startsWith('/dashboard')) return 'dashboard';
    if (path.startsWith('/data-repo')) return 'data-repo';
    if (path.startsWith('/projects')) return 'projects';
    if (path.startsWith('/tasks')) return 'tasks';
    if (path.startsWith('/meetings')) return 'meetings';
    if (path.startsWith('/calendar')) return 'calendar';
    if (path.startsWith('/reports')) return 'reports';
    if (path.startsWith('/admin')) return 'admin';
    return 'chat';
  }, [location.pathname]);

  // Nhận diện tab admin từ search params
  const [activeAdminTabState, setActiveAdminTabState] = useState<string>('overview');

  const setActiveModule = (module: NavModule) => {
    const route = (module === 'chat' ? '/chat' : `/${module}`) as any;
    navigate({ to: route });
  };

  const setActiveAdminTab = (tab: string) => {
    setActiveAdminTabState(tab);
    navigate({ to: '/admin', search: { tab } as any });
  };

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<User>(mockCurrentUser);

  const [users, setUsers] = useState<User[]>(mockUsers);
  const [departments, setDepartments] = useState<Department[]>(mockDepartments);
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [activeProject, setActiveProject] = useState<Project | null>(mockProjects[0]);
  const [tasks, setTasks] = useState<TaskItem[]>(mockTasks);
  const [documents, setDocuments] = useState<DocumentItem[]>(mockDocuments);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(mockCalendarEvents);

  const [chatSessions, setChatSessions] = useState<ChatSession[]>(mockChatSessions);
  const [activeChatSessionId, setActiveChatSessionId] = useState<string>('sess_001');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(mockChatMessages);

  const [toasts, setToasts] = useState<Toast[]>([]);

  // Tự động kiểm tra và phục hồi phiên đăng nhập từ API backend
  useEffect(() => {
    const restoreSession = async () => {
      if (authApi.isAuthenticated()) {
        try {
          const user = await authApi.getMe();
          setCurrentUser(user);
          setIsAuthenticated(true);
        } catch {
          // Token không hợp lệ hoặc hết hạn
          authApi.logout();
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
      setIsAuthLoading(false);
    };

    restoreSession();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsAuthLoading(true);
    try {
      const response = await authApi.login(credentials);
      if (response && response.user) {
        setCurrentUser(response.user);
        setIsAuthenticated(true);
        showToast(`Signed in successfully! Welcome ${response.user.name}`, 'success');
        navigate({ to: '/chat' });
      }
    } catch (error: any) {
      showToast(error.message || 'Login failed. Please check credentials.', 'error');
      throw error;
    } finally {
      setIsAuthLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignored
    } finally {
      setIsAuthenticated(false);
      showToast('Signed out of the system', 'info');
      navigate({ to: '/login' });
    }
  };

  // Toast Helpers with React-Toastify
  const showToast = (message: string, type: Toast['type'] = 'info') => {
    switch (type) {
      case 'success':
        toast.success(message);
        break;
      case 'error':
        toast.error(message);
        break;
      case 'warning':
        toast.warning(message);
        break;
      case 'info':
      default:
        toast.info(message);
        break;
    }
  };

  const removeToast = (_id: string) => {
    toast.dismiss();
  };

  // Data helpers
  const addUser = (userData: Omit<User, 'id'>) => {
    const newUser: User = {
      ...userData,
      id: `usr_${Date.now().toString().slice(-4)}`
    };
    setUsers((prev) => [newUser, ...prev]);
    showToast(`User ${newUser.name} added successfully`, 'success');
  };

  const updateUserStatus = (id: string, status: User['status']) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status } : u))
    );
    showToast('Updated user status successfully', 'success');
  };

  const deleteUser = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    showToast('Deleted user successfully', 'warning');
  };

  const addDepartment = (deptData: Omit<Department, 'id'>) => {
    const newDept: Department = {
      ...deptData,
      id: `dept_${Date.now().toString().slice(-4)}`
    };
    setDepartments((prev) => [newDept, ...prev]);
    showToast(`Added department ${newDept.name}`, 'success');
  };

  const addProject = (projectData: Omit<Project, 'id'>) => {
    const newProject: Project = {
      ...projectData,
      id: `prj_${Date.now().toString().slice(-4)}`
    };
    setProjects((prev) => [newProject, ...prev]);
    showToast(`Created project: ${newProject.name}`, 'success');
  };

  const addTask = (taskData: Omit<TaskItem, 'id'>) => {
    const newTask: TaskItem = {
      ...taskData,
      id: `tsk_${Date.now().toString().slice(-4)}`
    };
    setTasks((prev) => [newTask, ...prev]);
    showToast(`Created task: ${newTask.title}`, 'success');
  };

  const updateTaskStatus = (id: string, status: TaskItem['status']) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status } : t))
    );
  };

  const addDocument = (docData: Omit<DocumentItem, 'id'>) => {
    const newDoc: DocumentItem = {
      ...docData,
      id: `doc_${Date.now().toString().slice(-4)}`
    };
    setDocuments((prev) => [newDoc, ...prev]);
    showToast(`Uploaded document: ${newDoc.name}`, 'success');
  };

  const addCalendarEvent = (evtData: Omit<CalendarEvent, 'id'>) => {
    const newEvt: CalendarEvent = {
      ...evtData,
      id: `evt_${Date.now().toString().slice(-4)}`
    };
    setCalendarEvents((prev) => [newEvt, ...prev]);
    showToast(`Added calendar event: ${newEvt.title}`, 'success');
  };

  const addChatMessage = (msgData: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMsg: ChatMessage = {
      ...msgData,
      id: `msg_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages((prev) => [...prev, newMsg]);
  };

  const startNewChat = () => {
    const newId = `sess_${Date.now()}`;
    const newSession: ChatSession = {
      id: newId,
      title: language === 'vi' ? 'Đoạn chat mới' : 'New conversation',
      date: language === 'vi' ? 'Hôm nay' : 'Today',
      group: 'today'
    };
    setChatSessions((prev) => [newSession, ...prev]);
    setActiveChatSessionId(newId);
    setChatMessages([
      {
        id: 'msg_welcome',
        sender: 'ai',
        text: language === 'vi' ? 'Xin chào! Tôi có thể giúp gì cho công việc của bạn hôm nay?' : 'Hello! How can I assist you with your work today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        theme,
        isDark,
        setTheme,
        toggleTheme,
        isSidebarOpen,
        setIsSidebarOpen,
        toggleSidebar,
        isMobileSidebarOpen,
        setIsMobileSidebarOpen,
        toggleMobileSidebar,
        activeModule,
        setActiveModule,
        activeAdminTab: activeAdminTabState,
        setActiveAdminTab,
        isAuthenticated,
        setIsAuthenticated,
        isAuthLoading,
        currentUser,
        setCurrentUser,
        login,
        logout,
        users,
        addUser,
        updateUserStatus,
        deleteUser,
        departments,
        addDepartment,
        projects,
        activeProject,
        setActiveProject,
        addProject,
        tasks,
        addTask,
        updateTaskStatus,
        documents,
        addDocument,
        calendarEvents,
        addCalendarEvent,
        chatSessions,
        activeChatSessionId,
        setActiveChatSessionId,
        chatMessages,
        addChatMessage,
        startNewChat,
        toasts,
        showToast,
        removeToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

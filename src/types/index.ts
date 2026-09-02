export type NavModule =
  | 'chat'
  | 'dashboard'
  | 'data-repo'
  | 'projects'
  | 'tasks'
  | 'meetings'
  | 'calendar'
  | 'reports'
  | 'admin';

export type UserRole = 'SupperAdmin' | 'Admin' | 'Quản trị viên' | 'Trưởng phòng' | 'Trưởng dự án' | 'Nhân viên';
export type UserStatus = 'Active' | 'Inactive' | 'Đang hoạt động' | 'Tạm khóa' | 'Bị khóa';

export interface UserRoleInfo {
  roleId: string;
  roleName: string;
  status?: string;
  validFrom?: string | null;
  expiresAt?: string | null;
}

export interface User {
  id: string;
  userId?: string;
  name: string;
  displayName?: string;
  fullName?: string;
  userName?: string;
  email: string;
  phoneNumber?: string;
  phone?: string;
  isActive?: boolean;
  role: UserRole | string;
  roleId?: string;
  roles?: UserRoleInfo[];
  status: UserStatus | string;
  department?: string;
  departmentId?: string;
  preferredLanguage?: string;
  timeZone?: string | null;
  avatar?: string;
  apiFunctions?: any[];
}

export interface Department {
  id: string; // Mapped from departmentId
  departmentId?: string;
  parentDepartmentId?: string | null;
  code: string;
  name: string;
  managerUserId?: string | null;
  status: string; // 'Active' | 'Inactive' | 'Archived' | 'Locked'
  parentDepartment?: string;
  parentDepartmentName?: string;
  head?: string;
  manager?: string;
  managerName?: string;
  phone?: string;
  address?: string;
  memberCount?: number;
  description?: string;
}

export interface RolePermission {
  id: string;
  role: string;
  userCount: number;
  description: string;
}

export interface DataPolicy {
  id: string;
  title: string;
  countText: string;
  iconName: string;
}

export interface ActivityLog {
  id: string;
  user: string;
  action: string;
  timestamp: string;
}

export interface MeetingRoom {
  id: string;
  name: string;
  capacity: number;
  status: 'Trống' | 'Đang họp';
}

export interface ReportItem {
  id: string;
  title?: string;
  name?: string;
  typeText?: string;
  project?: string;
  category?: string;
  generatedDate?: string;
  createdAt?: string;
  status?: string;
  creator?: string;
}

export interface SystemConfig {
  aiModel: string;
  storageUsage: string;
  maxUploadSize: string;
  ragStatus: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  tokenType?: string;
  accessTokenExpiresAt?: string;
  refreshTokenExpiresAt?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  statusCode?: number;
  message?: string;
  data: T;
  error?: any;
}

export interface LoginResponseData {
  accessToken?: string;
  access_token?: string;
  token?: string;
  refreshToken?: string;
  refresh_token?: string;
  tokenType?: string;
  token_type?: string;
  user?: any;
  userId?: string;
  email?: string;
  role?: string;
  name?: string;
  fullName?: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  code?: string;
  key?: string;
  progress: number;
  status: 'Đang tiến hành' | 'Hoàn thành' | 'Tạm dừng' | 'Chậm tiến độ' | string;
  members?: number | string[];
  membersCount?: number;
  taskCount?: number;
  completedTasks?: number;
  startDate?: string;
  phaseProgress?: any;
  deadline?: string;
  dueDate?: string;
  department?: string;
  lead?: string;
  leadRole?: string;
  risk?: string;
  currentSprint?: string;
  description?: string;
}
export type Project = ProjectItem;

export type TaskStatus = 'Cần làm' | 'Đang làm' | 'Review' | 'Đang review' | 'Hoàn thành' | 'Đã hoàn thành' | string;
export type TaskPriority = 'Thấp' | 'Trung bình' | 'Cao' | 'Khẩn cấp';

export interface TaskItem {
  id: string;
  title: string;
  project?: string;
  projectName?: string;
  projectId?: string;
  assignee?: string | { name: string; avatar?: string };
  priority: TaskPriority;
  status: TaskStatus;
  deadline?: string;
  dueDate?: string;
  description?: string;
  completedAt?: string;
}

export interface DocumentItem {
  id: string;
  name: string;
  type: 'pdf' | 'docx' | 'xlsx' | 'pptx' | 'txt' | string;
  size?: string;
  updatedAt?: string;
  uploadedAt?: string;
  updatedBy?: string;
  uploadedBy?: string;
  accessScope?: string;
  department?: string;
  url?: string;
  isFolder?: boolean;
  itemCount?: number;
  project?: string;
  isStarred?: boolean;
}

export interface MeetingItem {
  id: string;
  title: string;
  time: string;
  date?: string;
  location?: string;
  room?: string;
  organizer?: string;
  host?: string;
  project?: string;
  participants?: number | string[];
  participantsCount?: number;
  participantNames?: string[];
  status?: 'Sắp diễn ra' | 'Đang diễn ra' | 'Đã kết thúc' | string;
  hasSummary?: boolean;
  hasTranscript?: boolean;
  transcriptsAvailable?: boolean;
  languages?: string[];
  summary?: string;
}
export type Meeting = MeetingItem;

export interface CalendarEventItem {
  id: string;
  title: string;
  date?: string;
  time?: string;
  day?: string;
  room?: string;
  color?: string;
  startTime?: string;
  endTime?: string;
  type?: 'meeting' | 'task' | 'deadline' | 'other' | string;
  location?: string;
}
export type CalendarEvent = CalendarEventItem;

export interface ChatSession {
  id: string;
  title: string;
  date?: string;
  time?: string;
  group?: 'today' | 'yesterday' | 'last7days' | 'older' | string;
  createdAt?: string;
  preview?: string;
  lastMessage?: string;
}

export interface Citation {
  id: string;
  title: string;
  snippet: string;
  docId?: string;
  source?: string;
  similarity?: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  citations?: Citation[];
  actions?: { label: string; action: string }[];
  sources?: (string | { id?: number | string; title?: string; pageOrSheet?: string; snippet?: string })[];
  attachedDocs?: any[];
  suggestedActions?: any[];
  isThinking?: boolean;
}

export * from './yupSchemas';
export * from '@/constants/validationMessages';



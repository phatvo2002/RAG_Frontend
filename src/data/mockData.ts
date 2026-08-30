import {
  User,
  Department,
  RolePermission,
  DataPolicy,
  ActivityLog,
  DocumentItem,
  Meeting,
  MeetingRoom,
  Project,
  TaskItem,
  CalendarEvent,
  ReportItem,
  ChatSession,
  ChatMessage
} from '../types';

export const mockCurrentUser: User = {
  id: 'usr_000',
  name: 'Võ Đăng Phát',
  email: 'vodangphat2002@gmail.com',
  role: 'SupperAdmin',
  status: 'Đang hoạt động',
  department: 'Công nghệ thông tin',
  phone: '0708223688'
};

export const mockUsers: User[] = [
  {
    id: 'usr_001',
    name: 'Nguyễn An',
    email: 'nguyen.an@congty.vn',
    role: 'Quản trị viên',
    status: 'Đang hoạt động',
    department: 'Công nghệ thông tin'
  },
  {
    id: 'usr_002',
    name: 'Trần Linh',
    email: 'tran.linh@congty.vn',
    role: 'Trưởng dự án',
    status: 'Đang hoạt động',
    department: 'Sản phẩm'
  },
  {
    id: 'usr_003',
    name: 'Mai Hương',
    email: 'mai.huong@congty.vn',
    role: 'Nhân viên',
    status: 'Đang hoạt động',
    department: 'Marketing'
  },
  {
    id: 'usr_004',
    name: 'Phạm Việt',
    email: 'pham.viet@congty.vn',
    role: 'Nhân viên',
    status: 'Bị khóa',
    department: 'Kinh doanh'
  },
  {
    id: 'usr_005',
    name: 'Quang Dũng',
    email: 'quang.dung@congty.vn',
    role: 'Nhân viên',
    status: 'Đang hoạt động',
    department: 'Tài chính - Kế toán'
  }
];

export const mockDepartments: Department[] = [
  {
    id: '656811bc-683a-40ab-aa91-8fb327c7ffa9',
    departmentId: '656811bc-683a-40ab-aa91-8fb327c7ffa9',
    parentDepartmentId: null,
    code: 'CNTT',
    name: 'Phòng công nghệ thông tin',
    managerUserId: 'usr_001',
    status: 'Active',
    phone: '0274 374 0530',
    address: 'Tầng 4, Tòa A',
    head: 'Nguyễn An',
    memberCount: 28,
  },
  {
    id: 'dept_002',
    departmentId: 'dept_002',
    parentDepartmentId: null,
    code: 'PXSX',
    name: 'PHÂN XƯỞNG – SẢN XUẤT',
    managerUserId: 'usr_002',
    status: 'Active',
    phone: '',
    address: 'Khu vực xưởng B',
    head: 'Trần Linh',
    memberCount: 45,
  },
  {
    id: 'dept_003',
    departmentId: 'dept_003',
    parentDepartmentId: null,
    code: 'TCHC',
    name: 'TỔ CHỨC – HÀNH CHÍNH',
    managerUserId: 'usr_003',
    status: 'Active',
    phone: '028 3822 1234',
    address: 'Tầng 2, Tòa A',
    head: 'Mai Hương',
    memberCount: 18,
  },
  {
    id: 'dept_004',
    departmentId: 'dept_004',
    parentDepartmentId: '656811bc-683a-40ab-aa91-8fb327c7ffa9',
    code: 'QLM',
    name: 'QUẢN LÝ MẠNG & HẠ TẦNG',
    managerUserId: 'usr_001',
    status: 'Active',
    phone: '',
    address: 'Phòng Server Tầng Hầm',
    head: 'Nguyễn An',
    memberCount: 14,
  },
  {
    id: 'dept_005',
    departmentId: 'dept_005',
    parentDepartmentId: null,
    code: 'KD',
    name: 'PHÒNG KINH DOANH',
    managerUserId: 'usr_004',
    status: 'Active',
    phone: '0274 374 0530',
    address: 'Tầng 3, Tòa A',
    head: 'Phạm Việt',
    memberCount: 30,
  },
  {
    id: 'dept_006',
    departmentId: 'dept_006',
    parentDepartmentId: null,
    code: 'TCKT',
    name: 'TÀI CHÍNH – KẾ TOÁN',
    managerUserId: 'usr_005',
    status: 'Active',
    phone: '0650 371 0018',
    address: 'Tầng 2, Tòa B',
    head: 'Quang Dũng',
    memberCount: 16,
  },
  {
    id: 'dept_008',
    code: 'P3',
    name: 'THI CÔNG ỐNG NHÁNH',
    parentDepartment: 'THI CÔNG ỐNG NHÁNH',
    phone: '',
    address: '',
    head: 'Phạm Việt',
    memberCount: 22,
    status: 'Đang hoạt động'
  },
  {
    id: 'dept_009',
    code: 'P5',
    name: 'THU NGÂN',
    parentDepartment: 'THU NGÂN',
    phone: '',
    address: '',
    head: 'Mai Hương',
    memberCount: 15,
    status: 'Đang hoạt động'
  },
  {
    id: 'dept_010',
    code: 'PSC',
    name: 'Phòng Sửa Chữa',
    parentDepartment: 'Phòng Sửa Chữa',
    phone: '',
    address: '',
    head: 'Quang Dũng',
    memberCount: 20,
    status: 'Đang hoạt động'
  },
  {
    id: 'dept_011',
    code: 'NS',
    name: 'PHÒNG NHÂN SỰ & QUẢN TRỊ',
    parentDepartment: 'PHÒNG NHÂN SỰ & QUẢN TRỊ',
    phone: '0abc',
    address: '',
    head: 'Hoàng Yến',
    memberCount: 10,
    status: 'Đang hoạt động'
  },
  {
    id: 'dept_012',
    code: 'CTT',
    name: 'CHỐNG THẤT THOÁT',
    parentDepartment: 'CHỐNG THẤT THOÁT',
    phone: '',
    address: '',
    head: 'Bùi Nam',
    memberCount: 8,
    status: 'Đang hoạt động'
  },
  {
    id: 'dept_013',
    code: 'P4',
    name: 'GHI ĐỌC SỐ',
    parentDepartment: 'GHI ĐỌC SỐ',
    phone: '',
    address: '',
    head: 'Võ Phát',
    memberCount: 25,
    status: 'Đang hoạt động'
  }
];

export const mockRoles: RolePermission[] = [
  {
    id: 'role_001',
    role: 'Quản trị viên',
    userCount: 5,
    description: 'Toàn quyền hệ thống'
  },
  {
    id: 'role_002',
    role: 'Trưởng dự án',
    userCount: 18,
    description: 'Quản lý dự án và thành viên'
  },
  {
    id: 'role_003',
    role: 'Nhân viên',
    userCount: 105,
    description: 'Truy cập và sử dụng theo phân quyền'
  }
];

export const mockDataPolicies: DataPolicy[] = [
  {
    id: 'pol_001',
    title: 'Phân loại dữ liệu',
    countText: '4 chính sách',
    iconName: 'Shield'
  },
  {
    id: 'pol_002',
    title: 'Quy tắc chia sẻ',
    countText: '6 quy tắc',
    iconName: 'Share2'
  },
  {
    id: 'pol_003',
    title: 'Lưu trữ & lưu giữ',
    countText: '3 chính sách',
    iconName: 'HardDrive'
  },
  {
    id: 'pol_004',
    title: 'Xóa & hủy dữ liệu',
    countText: '2 chính sách',
    iconName: 'Trash2'
  }
];

export const mockActivityLogs: ActivityLog[] = [
  {
    id: 'act_001',
    user: 'Nguyễn An',
    action: 'đã tạo người dùng mới Trần Linh',
    timestamp: 'Hôm nay, 10:15'
  },
  {
    id: 'act_002',
    user: 'Lê Hoàng',
    action: 'đã cập nhật vai trò cho Mai Hương',
    timestamp: 'Hôm nay, 09:42'
  },
  {
    id: 'act_003',
    user: 'Phạm Việt',
    action: 'đăng nhập hệ thống',
    timestamp: 'Hôm nay, 08:30'
  },
  {
    id: 'act_004',
    user: 'Hệ thống',
    action: 'đã xuất báo cáo sử dụng AI tháng 5',
    timestamp: 'Hôm qua, 17:20'
  }
];

export const mockFolders: DocumentItem[] = [
  {
    id: 'f_001',
    name: 'Dự án NEXORA',
    type: 'folder',
    updatedBy: 'Anh Khoa',
    updatedAt: '16/05/2024',
    accessScope: 'Dự án NEXORA',
    isFolder: true,
    itemCount: 28
  },
  {
    id: 'f_002',
    name: 'Phòng Kinh doanh',
    type: 'folder',
    updatedBy: 'Phạm Thảo',
    updatedAt: '14/05/2024',
    accessScope: 'Kinh doanh',
    isFolder: true,
    itemCount: 16
  },
  {
    id: 'f_003',
    name: 'Phòng Sản phẩm',
    type: 'folder',
    updatedBy: 'Lê Hoàng',
    updatedAt: '12/05/2024',
    accessScope: 'Sản phẩm',
    isFolder: true,
    itemCount: 12
  },
  {
    id: 'f_004',
    name: 'Phòng Nhân sự',
    type: 'folder',
    updatedBy: 'Trần Minh',
    updatedAt: '10/05/2024',
    accessScope: 'Nhân sự',
    isFolder: true,
    itemCount: 8
  }
];

export const mockDocuments: DocumentItem[] = [
  {
    id: 'doc_001',
    name: 'Báo cáo tiến độ dự án.pdf',
    type: 'pdf',
    updatedBy: 'Phạm Anh Khoa',
    updatedAt: '16/05/2024 10:05',
    accessScope: 'Dự án NEXORA',
    size: '2.4 MB',
    project: 'NEXORA Platform',
    isStarred: true
  },
  {
    id: 'doc_002',
    name: 'Kế hoạch dự án Phase 2.xlsx',
    type: 'xlsx',
    updatedBy: 'Phạm Anh Khoa',
    updatedAt: '10/05/2024 14:30',
    accessScope: 'Dự án NEXORA',
    size: '1.8 MB',
    project: 'NEXORA Platform'
  },
  {
    id: 'doc_003',
    name: 'Biên bản họp 14-05.docx',
    type: 'docx',
    updatedBy: 'Nguyễn Thị Minh',
    updatedAt: '14/05/2024 09:15',
    accessScope: 'Phòng Sản phẩm',
    size: '850 KB',
    department: 'Sản phẩm'
  },
  {
    id: 'doc_004',
    name: 'Báo cáo hiệu suất hệ thống.pdf',
    type: 'pdf',
    updatedBy: 'Trần Quang Huy',
    updatedAt: '09/05/2024 16:45',
    accessScope: 'Phòng Kỹ thuật',
    size: '4.1 MB',
    department: 'Công nghệ thông tin'
  },
  {
    id: 'doc_005',
    name: 'Kế hoạch marketing Q2.pptx',
    type: 'pptx',
    updatedBy: 'Lê Thu Trang',
    updatedAt: '08/05/2024 11:20',
    accessScope: 'Phòng Marketing',
    size: '12.5 MB',
    department: 'Marketing'
  }
];

export const mockRecentUploads: DocumentItem[] = [
  {
    id: 'upload_001',
    name: 'Báo cáo tiến độ dự án.pdf',
    type: 'pdf',
    updatedBy: 'Phạm Anh Khoa',
    updatedAt: '16/05/2024 10:05',
    accessScope: 'Dự án NEXORA'
  },
  {
    id: 'upload_002',
    name: 'Kế hoạch dự án Phase 2.xlsx',
    type: 'xlsx',
    updatedBy: 'Phạm Anh Khoa',
    updatedAt: '10/05/2024 14:30',
    accessScope: 'Dự án NEXORA'
  },
  {
    id: 'upload_003',
    name: 'Biên bản họp 14-05.docx',
    type: 'docx',
    updatedBy: 'Nguyễn Thị Minh',
    updatedAt: '14/05/2024 09:15',
    accessScope: 'Phòng Sản phẩm'
  }
];

export const mockSharedDocuments = [
  {
    id: 'sh_001',
    title: 'Báo cáo Q1/2024.pdf',
    sharedWithText: 'Chia sẻ với: Phòng Kinh doanh',
    date: '12/05/2024'
  },
  {
    id: 'sh_002',
    title: 'Kế hoạch sản phẩm.docx',
    sharedWithText: 'Chia sẻ với: Phòng Sản phẩm',
    date: '11/05/2024'
  },
  {
    id: 'sh_003',
    title: 'Quy trình onboarding.pdf',
    sharedWithText: 'Chia sẻ với: Phòng Nhân sự',
    date: '09/05/2024'
  }
];

export const mockMeetings: Meeting[] = [
  {
    id: 'meet_001',
    title: 'Họp khởi động dự án NEXORA',
    date: '16/05/2024 (Thứ Năm)',
    time: '10:00 - 11:30',
    room: 'Phòng họp Orion',
    participants: ['AK', 'TM', 'MH', 'LM', 'PV'],
    languages: ['VI', 'EN'],
    status: 'Sắp tới',
    transcriptsAvailable: true
  },
  {
    id: 'meet_002',
    title: 'Weekly Project Sync',
    date: '17/05/2024',
    time: '14:00 - 15:00',
    room: 'Phòng họp Vega',
    participants: ['AK', 'TM', 'MH'],
    languages: ['VI', 'EN'],
    status: 'Sắp tới'
  },
  {
    id: 'meet_003',
    title: 'Rà soát tiến độ Sprint 6',
    date: '18/05/2024',
    time: '09:00 - 10:30',
    room: 'Phòng họp Polaris',
    participants: ['AK', 'TM', 'MH', 'QD'],
    languages: ['VI'],
    status: 'Sắp tới'
  }
];

export const mockMeetingRooms: MeetingRoom[] = [
  { id: 'rm_001', name: 'Orion', capacity: 12, status: 'Trống' },
  { id: 'rm_002', name: 'Vega', capacity: 8, status: 'Trống' },
  { id: 'rm_003', name: 'Polaris', capacity: 10, status: 'Đang họp' },
  { id: 'rm_004', name: 'Nova', capacity: 6, status: 'Trống' },
  { id: 'rm_005', name: 'Galaxy', capacity: 20, status: 'Trống' },
  { id: 'rm_006', name: 'Zenith', capacity: 4, status: 'Trống' }
];

export const mockRecentTranscripts = [
  {
    id: 'tr_001',
    title: 'Họp khởi động dự án NEXORA',
    date: '16/05/2024 • 14:15 • Phòng Orion',
    languages: ['VI'],
    participants: ['AK', 'TM']
  },
  {
    id: 'tr_002',
    title: 'Weekly Project Sync',
    date: '15/05/2024 • 15:30 • Phòng Vega',
    languages: ['VI'],
    participants: ['AK', 'TM']
  },
  {
    id: 'tr_003',
    title: 'Rà soát tiến độ Sprint 5',
    date: '14/05/2024 • 10:45 • Phòng Polaris',
    languages: ['VI'],
    participants: ['AK', 'MH']
  },
  {
    id: 'tr_004',
    title: 'Họp tổng kết tháng 4',
    date: '10/05/2024 • 16:00 • Phòng Orion',
    languages: ['VI'],
    participants: ['AK', 'PV']
  }
];

export const mockProjects: Project[] = [
  {
    id: 'proj_001',
    name: 'NEXORA Platform',
    description: 'Nền tảng AI nội bộ cho doanh nghiệp hỗ trợ tự động hóa công việc và ra quyết định.',
    code: 'NEX',
    progress: 68,
    lead: 'Anh Khoa',
    leadRole: 'Product Manager',
    dueDate: '16/05/2024',
    risk: 'Thấp',
    status: 'Đang triển khai',
    members: ['AK', 'TM', 'LP', 'AT', 'NP', 'HD'],
    currentSprint: 'Sprint 6 – Phát triển tính năng',
    startDate: '01/01/2024',
    phaseProgress: [
      { phase: 'Khởi động', progress: 100 },
      { phase: 'Phân tích', progress: 100 },
      { phase: 'Thiết kế', progress: 100 },
      { phase: 'Phát triển', progress: 68 },
      { phase: 'Kiểm thử', progress: 25 },
      { phase: 'Triển khai', progress: 0 }
    ]
  },
  {
    id: 'proj_002',
    name: 'CRM Integration',
    description: 'Tích hợp hệ thống CRM với các module AI tự động chăm sóc khách hàng.',
    code: 'CRM',
    progress: 42,
    lead: 'Thu Minh',
    leadRole: 'Business Analyst',
    dueDate: '30/06/2024',
    risk: 'Trung bình',
    status: 'Đang triển khai',
    members: ['TM', 'LP', 'HD'],
    currentSprint: 'Sprint 3 – Kết nối API',
    startDate: '01/03/2024'
  },
  {
    id: 'proj_003',
    name: 'Data Analytics Dashboard',
    description: 'Bảng điều khiển phân tích dữ liệu kinh doanh thông minh tích hợp báo cáo tự động.',
    code: 'DAD',
    progress: 85,
    lead: 'Linh Phạm',
    leadRole: 'Data Lead',
    dueDate: '20/05/2024',
    risk: 'Thấp',
    status: 'Đang triển khai',
    members: ['LP', 'HD', 'AT'],
    currentSprint: 'Sprint 8 – Tối ưu hóa UI',
    startDate: '15/02/2024'
  }
];

export const mockTasks: TaskItem[] = [
  {
    id: 'task_001',
    title: 'Thiết kế UX cho module Phòng họp',
    projectId: 'proj_001',
    projectName: 'Dự án NEXORA Platform',
    project: 'NEXORA Platform',
    priority: 'Cao',
    status: 'Cần làm',
    dueDate: '2024-05-24',
    deadline: '2024-05-24',
    assignee: 'Anh Khoa'
  },
  {
    id: 'task_002',
    title: 'Tích hợp API quản lý tài liệu',
    projectId: 'proj_001',
    projectName: 'Dự án NEXORA Platform',
    project: 'NEXORA Platform',
    priority: 'Trung bình',
    status: 'Cần làm',
    dueDate: '2024-05-28',
    deadline: '2024-05-28',
    assignee: 'Minh Hằng'
  },
  {
    id: 'task_003',
    title: 'Kiểm thử tính năng trợ lý AI',
    projectId: 'proj_001',
    projectName: 'Dự án NEXORA Platform',
    project: 'NEXORA Platform',
    priority: 'Thấp',
    status: 'Cần làm',
    dueDate: '2024-05-31',
    deadline: '2024-05-31',
    assignee: 'Tuấn Duy'
  },
  {
    id: 'task_004',
    title: 'Cấu hình Server Cloud Run & Vector DB',
    projectId: 'proj_001',
    projectName: 'Dự án NEXORA Platform',
    project: 'NEXORA Platform',
    priority: 'Khẩn cấp',
    status: 'Đang làm',
    dueDate: '2024-05-20',
    deadline: '2024-05-20',
    assignee: 'Đức Huy'
  },
  {
    id: 'task_005',
    title: 'Thiết kế UX cho module Phòng họp Phase 2',
    projectId: 'proj_001',
    projectName: 'Dự án NEXORA Platform',
    project: 'NEXORA Platform',
    priority: 'Trung bình',
    status: 'Đang làm',
    dueDate: '2024-05-23',
    deadline: '2024-05-23',
    assignee: 'Anh Khoa'
  },
  {
    id: 'task_006',
    title: 'Kiểm thử hiệu năng API RAG',
    projectId: 'proj_001',
    projectName: 'Dự án NEXORA Platform',
    project: 'NEXORA Platform',
    priority: 'Cao',
    status: 'Đang làm',
    dueDate: '2024-05-26',
    deadline: '2024-05-26',
    assignee: 'Tuấn Duy'
  },
  {
    id: 'task_007',
    title: 'Soạn thảo tài liệu hướng dẫn user',
    projectId: 'proj_001',
    projectName: 'Dự án NEXORA Platform',
    project: 'NEXORA Platform',
    priority: 'Trung bình',
    status: 'Đang review',
    dueDate: '2024-05-18',
    deadline: '2024-05-18',
    assignee: 'Thanh Hà'
  },
  {
    id: 'task_008',
    title: 'Kiểm tra bảo mật và phân quyền OAuth',
    projectId: 'proj_001',
    projectName: 'Dự án NEXORA Platform',
    project: 'NEXORA Platform',
    priority: 'Cao',
    status: 'Đang review',
    dueDate: '2024-05-19',
    deadline: '2024-05-19',
    assignee: 'Anh Khoa'
  },
  {
    id: 'task_009',
    title: 'Xây dựng UI Dashboard Báo cáo',
    projectId: 'proj_001',
    projectName: 'Dự án NEXORA Platform',
    project: 'NEXORA Platform',
    priority: 'Cao',
    status: 'Đã hoàn thành',
    dueDate: '2024-05-14',
    deadline: '2024-05-14',
    assignee: 'Tuấn Duy',
    completedAt: '2024-05-14'
  },
  {
    id: 'task_010',
    title: 'Tích hợp API Google Workspace',
    projectId: 'proj_001',
    projectName: 'Dự án NEXORA Platform',
    project: 'NEXORA Platform',
    priority: 'Trung bình',
    status: 'Đã hoàn thành',
    dueDate: '2024-05-12',
    deadline: '2024-05-12',
    assignee: 'Minh Hằng',
    completedAt: '2024-05-12'
  },
  {
    id: 'task_011',
    title: 'Khởi tạo Schema Firestore & Firestore Rules',
    projectId: 'proj_001',
    projectName: 'Dự án NEXORA Platform',
    project: 'NEXORA Platform',
    priority: 'Thấp',
    status: 'Đã hoàn thành',
    dueDate: '2024-05-10',
    deadline: '2024-05-10',
    assignee: 'Anh Khoa',
    completedAt: '2024-05-10'
  }
];

export const mockCalendarEvents: CalendarEvent[] = [
  {
    id: 'evt_001',
    title: 'Họp khởi động dự án NEXORA',
    startTime: '09:00',
    endTime: '10:30',
    day: 'T3',
    date: '14/05',
    room: 'Phòng họp Alpha',
    type: 'meeting',
    color: 'blue'
  },
  {
    id: 'evt_002',
    title: 'Weekly Project Sync',
    startTime: '09:30',
    endTime: '10:30',
    day: 'T5',
    date: '16/05',
    room: 'Phòng họp Beta',
    type: 'meeting',
    color: 'green'
  },
  {
    id: 'evt_003',
    title: 'Rà soát tiến độ Sprint 12',
    startTime: '11:00',
    endTime: '12:00',
    day: 'T6',
    date: '17/05',
    room: 'Phòng họp Alpha',
    type: 'meeting',
    color: 'purple'
  },
  {
    id: 'evt_004',
    title: 'Hoàn thiện báo cáo hiệu suất hệ thống',
    startTime: '14:00',
    endTime: '15:30',
    day: 'T3',
    date: '14/05',
    type: 'task',
    color: 'purple'
  },
  {
    id: 'evt_005',
    title: 'Chuẩn bị tài liệu họp ban điều hành',
    startTime: '15:00',
    endTime: '16:00',
    day: 'T5',
    date: '16/05',
    type: 'task',
    color: 'amber'
  },
  {
    id: 'evt_006',
    title: 'Gửi báo cáo tiến độ tuần cho khách hàng',
    startTime: '16:00',
    endTime: '17:00',
    day: 'T6',
    date: '17/05',
    room: 'Phòng họp Beta',
    type: 'meeting',
    color: 'blue'
  }
];

export const mockChatSessions: ChatSession[] = [
  {
    id: 'sess_001',
    title: 'Tóm tắt tiến độ dự án NEXORA',
    time: '10:32',
    group: 'Hôm nay'
  },
  {
    id: 'sess_002',
    title: 'Phân tích rủi ro dự án',
    time: '09:15',
    group: 'Hôm nay'
  },
  {
    id: 'sess_003',
    title: 'Kế hoạch triển khai Q2/2024',
    time: '08:45',
    group: 'Hôm nay'
  },
  {
    id: 'sess_004',
    title: 'Ngân sách marketing tháng 5',
    time: '08:20',
    group: 'Hôm nay'
  },
  {
    id: 'sess_005',
    title: 'Tổng hợp cuộc họp tuần',
    time: '16:45',
    group: 'Hôm qua'
  },
  {
    id: 'sess_006',
    title: 'Đề xuất cải tiến quy trình',
    time: '14:30',
    group: 'Hôm qua'
  },
  {
    id: 'sess_007',
    title: 'Báo cáo hiệu suất hệ thống',
    time: '10:10',
    group: 'Tuần trước'
  }
];

export const mockChatMessages: ChatMessage[] = [
  {
    id: 'msg_001',
    sender: 'user',
    text: 'Tóm tắt tiến độ dự án NEXORA Platform',
    timestamp: '10:32'
  },
  {
    id: 'msg_002',
    sender: 'ai',
    text: `Dưới đây là tóm tắt tiến độ của dự án **NEXORA Platform** tính đến ngày 16/05/2024:

- **Tổng quan:** Dự án đang ở giai đoạn triển khai Sprint 6 của Phase 2.
- **Tiến độ tổng thể:** 68% hoàn thành (tăng 8% so với kỳ trước).
- **Hạng mục chính:**
  - Nền tảng cốt lõi: 100% hoàn thành ✅
  - Quản lý dữ liệu: 80% hoàn thành
  - AI Assistant: 65% hoàn thành
  - Báo cáo & Dashboard: 50% hoàn thành
- **Công việc nổi bật:**
  - Đã hoàn thành tích hợp SSO và phân quyền nâng cao.
  - Đang tối ưu hiệu suất truy vấn dữ liệu lớn.
- **Rủi ro & vấn đề:**
  - Phụ thuộc vào API bên thứ ba (dịch vụ OCR) – có nguy cơ chậm tiến độ.
  - Thiếu nhân sự FE cho hạng mục Dashboard.
- **Kế hoạch tiếp theo (tuần tới):**
  - Hoàn thành module Dashboard (phiên bản beta).
  - Kiểm thử hiệu năng và bảo mật.`,
    timestamp: '10:32',
    attachedDocs: [
      { name: 'Báo cáo tiến độ dự án.pdf', type: 'pdf' },
      { name: 'Kế hoạch dự án Phase 2.xlsx', type: 'xlsx' },
      { name: 'Biên bản họp 14-05.docx', type: 'docx' }
    ],
    sources: [
      {
        id: 1,
        title: 'Báo cáo tiến độ dự án.pdf',
        pageOrSheet: 'Trang 3 • Cập nhật 16/05/2024',
        snippet: 'Tiến độ tổng thể của dự án đạt 68% với các hạng mục chính...'
      },
      {
        id: 2,
        title: 'Biên bản họp 14-05.docx',
        pageOrSheet: 'Trang 2 • Cập nhật 14/05/2024',
        snippet: 'Thống nhất ưu tiên hoàn thành Dashboard phiên bản beta...'
      },
      {
        id: 3,
        title: 'Kế hoạch dự án Phase 2.xlsx',
        pageOrSheet: 'Sheet: Tiến độ • Cập nhật 10/05/2024',
        snippet: 'Bảng kế hoạch và phân bổ nguồn lực cho Phase 2...'
      }
    ]
  }
];

export const mockReportsList: ReportItem[] = [
  {
    id: 'rep_001',
    name: 'Báo cáo tiến độ dự án',
    typeText: 'Tiến độ dự án',
    project: 'NEXORA Platform',
    createdAt: '16/05/2024 10:30',
    creator: 'Anh Khoa'
  },
  {
    id: 'rep_002',
    name: 'Báo cáo hiệu suất hệ thống',
    typeText: 'Hiệu suất hệ thống',
    project: 'NEXORA Platform',
    createdAt: '15/05/2024 09:15',
    creator: 'Anh Khoa'
  },
  {
    id: 'rep_003',
    name: 'Báo cáo tiến độ dự án',
    typeText: 'Tiến độ dự án',
    project: 'Website doanh nghiệp',
    createdAt: '14/05/2024 16:45',
    creator: 'Anh Khoa'
  },
  {
    id: 'rep_004',
    name: 'Báo cáo tiến độ dự án',
    typeText: 'Tiến độ dự án',
    project: 'Ứng dụng di động',
    createdAt: '14/05/2024 10:20',
    creator: 'Anh Khoa'
  },
  {
    id: 'rep_005',
    name: 'Báo cáo hiệu suất hệ thống',
    typeText: 'Hiệu suất hệ thống',
    project: 'NEXORA Platform',
    createdAt: '13/05/2024 08:30',
    creator: 'Anh Khoa'
  }
];

import { z } from 'zod';

// ==========================================
// 1. Auth Schemas
// ==========================================
export const loginSchema = z.object({
  email: z.string().min(1, 'Vui lòng nhập email hoặc tên đăng nhập'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type LoginCredentials = LoginFormData & { username?: string };

// ==========================================
// 2. User CRUD Schemas
// ==========================================
export const userFormSchema = z.object({
  name: z.string().min(2, 'Họ và tên phải có ít nhất 2 ký tự').trim(),
  email: z.string().email('Email không hợp lệ').min(1, 'Vui lòng nhập email').trim(),
  password: z.string().optional(),
  department: z.string().min(1, 'Vui lòng chọn phòng ban'),
  role: z.string().min(1, 'Vui lòng chọn vai trò'),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[0-9+()-\s]{8,15}$/.test(val),
      'Số điện thoại không đúng định dạng'
    ),
});

export type UserFormData = z.infer<typeof userFormSchema>;

// Reset Password Schema
export const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(6, 'Mật khẩu mới phải có tối thiểu 6 ký tự'),
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu mới'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Xác nhận mật khẩu không trùng khớp',
    path: ['confirmPassword'],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// ==========================================
// 3. Department CRUD Schema
// ==========================================
export const departmentFormSchema = z.object({
  name: z.string().min(2, 'Tên phòng ban phải có ít nhất 2 ký tự').trim(),
  code: z.string().optional(),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[0-9+()-\s]{8,15}$/.test(val),
      'Số điện thoại không đúng định dạng'
    ),
  address: z.string().optional(),
  head: z.string().optional(),
  description: z.string().optional(),
});

export type DepartmentFormData = z.infer<typeof departmentFormSchema>;

// ==========================================
// 4. Project CRUD Schema
// ==========================================
export const projectFormSchema = z.object({
  name: z.string().min(3, 'Tên dự án phải có tối thiểu 3 ký tự').trim(),
  lead: z.string().min(2, 'Vui lòng nhập tên người quản lý dự án').trim(),
  department: z.string().min(1, 'Vui lòng chọn phòng ban phụ trách'),
  deadline: z.string().min(1, 'Vui lòng chọn hạn hoàn thành'),
  description: z.string().optional(),
});

export type ProjectFormData = z.infer<typeof projectFormSchema>;

// ==========================================
// 5. Task CRUD Schema
// ==========================================
export const taskFormSchema = z.object({
  title: z.string().min(3, 'Tên công việc phải có ít nhất 3 ký tự').trim(),
  project: z.string().min(1, 'Vui lòng chọn dự án liên quan'),
  assignee: z.string().min(1, 'Vui lòng chọn người thực hiện'),
  priority: z.enum(['Khẩn cấp', 'Cao', 'Trung bình', 'Thấp']),
  status: z.enum(['Cần làm', 'Đang làm', 'Review', 'Đã hoàn thành']),
  deadline: z.string().min(1, 'Vui lòng chọn hạn chót'),
});

export type TaskFormData = z.infer<typeof taskFormSchema>;

// ==========================================
// 6. Meeting CRUD Schema
// ==========================================
export const meetingFormSchema = z.object({
  title: z.string().min(3, 'Tên cuộc họp phải có ít nhất 3 ký tự').trim(),
  date: z.string().min(1, 'Vui lòng chọn ngày họp'),
  time: z.string().min(1, 'Vui lòng nhập khung giờ họp').trim(),
  location: z.string().optional(),
  project: z.string().min(1, 'Vui lòng chọn dự án liên quan'),
  organizer: z.string().min(2, 'Vui lòng nhập người chủ trì').trim(),
  participantsCount: z.coerce.number().min(1, 'Số người tham dự tối thiểu là 1'),
});

export type MeetingFormData = z.infer<typeof meetingFormSchema>;

// ==========================================
// 7. Document Upload Schema
// ==========================================
export const uploadDocumentSchema = z.object({
  accessScope: z.string().min(1, 'Vui lòng chọn quyền truy cập'),
});

export type UploadDocumentFormData = z.infer<typeof uploadDocumentSchema>;

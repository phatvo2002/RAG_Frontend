import * as yup from 'yup';
import { validationMessages } from '@/constants/validationMessages';

// ==========================================
// 1. Auth & Login Yup Schema
// ==========================================
export const loginYupSchema = yup.object({
  email: yup
    .string()
    .trim()
    .required(validationMessages.auth.emailRequired),
  password: yup
    .string()
    .required(validationMessages.auth.passwordRequired)
    .min(6, validationMessages.auth.passwordMin),
});

export type LoginFormData = yup.InferType<typeof loginYupSchema>;
export type LoginCredentials = LoginFormData & { username?: string };

// ==========================================
// 2. User CRUD Yup Schemas
// ==========================================
export const userYupSchema = yup.object({
  displayName: yup
    .string()
    .trim()
    .required(validationMessages.user.displayNameRequired)
    .min(2, validationMessages.user.displayNameMin),
  name: yup
    .string()
    .trim()
    .required(validationMessages.user.nameRequired)
    .min(2, validationMessages.user.nameMin),
  email: yup
    .string()
    .trim()
    .required(validationMessages.user.emailRequired)
    .email(validationMessages.user.emailInvalid),
  password: yup
    .string()
    .optional()
    .test('password-min', validationMessages.user.passwordMin, (val) => {
      if (!val) return true;
      return val.length >= 6;
    }),
  department: yup
    .string()
    .required(validationMessages.user.departmentRequired),
  organizationId: yup.string().optional(),
  role: yup
    .string()
    .required(validationMessages.user.roleRequired),
  phone: yup
    .string()
    .optional()
    .test('phone-format', validationMessages.user.phoneInvalid, (val) => {
      if (!val) return true;
      return /^[0-9+()-\s]{8,15}$/.test(val);
    }),
});

export type UserFormData = yup.InferType<typeof userYupSchema>;

// Reset Password Yup Schema
export const resetPasswordYupSchema = yup.object({
  newPassword: yup
    .string()
    .required(validationMessages.auth.newPasswordRequired)
    .min(6, validationMessages.auth.passwordMin),
  confirmPassword: yup
    .string()
    .required(validationMessages.auth.confirmPasswordRequired)
    .oneOf([yup.ref('newPassword')], validationMessages.auth.passwordMatch),
});

export type ResetPasswordFormData = yup.InferType<typeof resetPasswordYupSchema>;

// ==========================================
// 3. Department CRUD Yup Schema
// ==========================================
export const departmentYupSchema = yup.object({
  name: yup
    .string()
    .trim()
    .required(validationMessages.department.nameRequired)
    .min(2, validationMessages.department.nameMin),
  code: yup
    .string()
    .trim()
    .required(validationMessages.department.codeRequired)
    .min(2, validationMessages.department.codeMin)
    .max(20, validationMessages.department.codeMax),
  parentDepartmentId: yup.string().nullable().optional(),
  managerUserId: yup.string().nullable().optional(),
  status: yup.string().optional().default('Active'),
  phone: yup
    .string()
    .optional()
    .test('phone-format', validationMessages.department.phoneInvalid, (val) => {
      if (!val) return true;
      return /^[0-9+()-\s]{8,15}$/.test(val);
    }),
  address: yup.string().optional(),
  head: yup.string().optional(),
  description: yup.string().optional(),
});

export type DepartmentFormData = yup.InferType<typeof departmentYupSchema>;

// ==========================================
// 4. Project CRUD Yup Schema
// ==========================================
export const projectYupSchema = yup.object({
  name: yup
    .string()
    .trim()
    .required(validationMessages.project.nameRequired)
    .min(3, validationMessages.project.nameMin),
  lead: yup
    .string()
    .trim()
    .required(validationMessages.project.leadRequired)
    .min(2, validationMessages.project.leadMin),
  department: yup
    .string()
    .required(validationMessages.project.departmentRequired),
  deadline: yup
    .string()
    .required(validationMessages.project.deadlineRequired),
  description: yup.string().optional(),
});

export type ProjectFormData = yup.InferType<typeof projectYupSchema>;

// ==========================================
// 5. Task CRUD Yup Schema
// ==========================================
export const taskYupSchema = yup.object({
  title: yup
    .string()
    .trim()
    .required(validationMessages.task.titleRequired)
    .min(3, validationMessages.task.titleMin),
  project: yup
    .string()
    .required(validationMessages.task.projectRequired),
  assignee: yup
    .string()
    .required(validationMessages.task.assigneeRequired),
  priority: yup
    .mixed<'Khẩn cấp' | 'Cao' | 'Trung bình' | 'Thấp'>()
    .oneOf(['Khẩn cấp', 'Cao', 'Trung bình', 'Thấp'], validationMessages.task.priorityRequired)
    .required(validationMessages.task.priorityRequired),
  status: yup
    .mixed<'Cần làm' | 'Đang làm' | 'Review' | 'Đã hoàn thành'>()
    .oneOf(['Cần làm', 'Đang làm', 'Review', 'Đã hoàn thành'], validationMessages.task.statusRequired)
    .required(validationMessages.task.statusRequired),
  deadline: yup
    .string()
    .required(validationMessages.task.deadlineRequired),
});

export type TaskFormData = yup.InferType<typeof taskYupSchema>;

// ==========================================
// 6. Meeting CRUD Yup Schema
// ==========================================
export const meetingYupSchema = yup.object({
  title: yup
    .string()
    .trim()
    .required(validationMessages.meeting.titleRequired)
    .min(3, validationMessages.meeting.titleMin),
  date: yup
    .string()
    .required(validationMessages.meeting.dateRequired),
  time: yup
    .string()
    .trim()
    .required(validationMessages.meeting.timeRequired),
  location: yup.string().optional(),
  project: yup
    .string()
    .required(validationMessages.meeting.projectRequired),
  organizer: yup
    .string()
    .trim()
    .required(validationMessages.meeting.organizerRequired)
    .min(2, validationMessages.meeting.organizerMin),
  participantsCount: yup
    .number()
    .typeError(validationMessages.meeting.participantsCountMin)
    .min(1, validationMessages.meeting.participantsCountMin)
    .required(validationMessages.meeting.participantsCountMin),
});

export type MeetingFormData = yup.InferType<typeof meetingYupSchema>;

// ==========================================
// 7. Document Upload Yup Schema
// ==========================================
export const uploadDocumentYupSchema = yup.object({
  accessScope: yup
    .string()
    .required(validationMessages.document.accessScopeRequired),
});

export type UploadDocumentFormData = yup.InferType<typeof uploadDocumentYupSchema>;

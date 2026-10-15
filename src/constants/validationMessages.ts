import i18n from '@/i18n';

// Yup calls message functions during validation, allowing EN/VI to change at runtime.
const message = (en: string, vi: string) => () => i18n.language === 'vi' ? vi : en;

export const validationMessages = {
  required: (field: string) => message(`${field} is required`, `${field} không được để trống`)(),
  min: (field: string, min: number) => message(`${field} must be at least ${min} characters`, `${field} phải có tối thiểu ${min} ký tự`)(),
  max: (field: string, max: number) => message(`${field} must not exceed ${max} characters`, `${field} không được vượt quá ${max} ký tự`)(),
  email: message('Invalid email address (e.g. example@company.com)', 'Email không đúng định dạng (VD: example@congty.vn)'),
  phone: message('Invalid phone number (8–15 digits)', 'Số điện thoại không đúng định dạng (8 - 15 chữ số)'),
  select: (field: string) => message(`Select ${field}`, `Vui lòng chọn ${field}`)(),
  positiveNumber: (field: string) => message(`${field} must be greater than 0`, `${field} phải lớn hơn 0`)(),
  auth: {
    emailRequired: message('Enter your email or username', 'Vui lòng nhập email hoặc tên đăng nhập'),
    passwordRequired: message('Enter your password', 'Vui lòng nhập mật khẩu'),
    passwordMin: message('Password must be at least 6 characters', 'Mật khẩu phải có tối thiểu 6 ký tự'),
    newPasswordRequired: message('Enter a new password', 'Vui lòng nhập mật khẩu mới'),
    confirmPasswordRequired: message('Confirm your new password', 'Vui lòng xác nhận mật khẩu mới'),
    passwordMatch: message('Passwords do not match', 'Xác nhận mật khẩu không trùng khớp'),
  },
  user: {
    displayNameRequired: message('Display name is required', 'Tên hiển thị (Display Name) không được để trống'),
    displayNameMin: message('Display name must be at least 2 characters', 'Tên hiển thị phải có tối thiểu 2 ký tự'),
    nameRequired: message('Full name is required', 'Họ và tên không được để trống'),
    nameMin: message('Full name must be at least 2 characters', 'Họ và tên phải có tối thiểu 2 ký tự'),
    emailRequired: message('Login email is required', 'Email đăng nhập không được để trống'),
    emailInvalid: message('Invalid email address (e.g. a.nguyen@company.com)', 'Email không đúng định dạng (VD: a.nguyen@congty.vn)'),
    passwordRequired: message('Password is required', 'Mật khẩu không được để trống'),
    passwordMin: message('Initial password must be at least 6 characters', 'Mật khẩu khởi tạo phải có tối thiểu 6 ký tự'),
    departmentRequired: message('Select a department', 'Vui lòng chọn phòng ban'),
    roleRequired: message('Select a role', 'Vui lòng chọn vai trò'),
    phoneInvalid: message('Invalid phone number', 'Số điện thoại không đúng định dạng'),
  },
  department: {
    nameRequired: message('Department name is required', 'Tên phòng ban không được để trống'),
    nameMin: message('Department name must be at least 2 characters', 'Tên phòng ban phải có tối thiểu 2 ký tự'),
    codeRequired: message('Department code is required', 'Mã phòng ban không được để trống'),
    codeMin: message('Department code must be at least 2 characters', 'Mã phòng ban tối thiểu 2 ký tự'),
    codeMax: message('Department code must not exceed 20 characters', 'Mã phòng ban tối đa 20 ký tự'),
    phoneInvalid: message('Invalid phone number', 'Số điện thoại không đúng định dạng'),
  },
  project: {
    nameRequired: message('Project name is required', 'Tên dự án không được để trống'),
    nameMin: message('Project name must be at least 3 characters', 'Tên dự án phải có tối thiểu 3 ký tự'),
    leadRequired: message('Enter the project lead', 'Vui lòng nhập người quản lý dự án'),
    leadMin: message('Project lead name must be at least 2 characters', 'Tên người quản lý phải có tối thiểu 2 ký tự'),
    departmentRequired: message('Select the responsible department', 'Vui lòng chọn phòng ban phụ trách'),
    deadlineRequired: message('Select a project due date', 'Vui lòng chọn hạn hoàn thành dự án'),
  },
  task: {
    titleRequired: message('Task name is required', 'Tên công việc không được để trống'),
    titleMin: message('Task name must be at least 3 characters', 'Tên công việc phải có tối thiểu 3 ký tự'),
    projectRequired: message('Select a related project', 'Vui lòng chọn dự án liên quan'),
    assigneeRequired: message('Select an assignee', 'Vui lòng chọn người thực hiện'),
    deadlineRequired: message('Select a task deadline', 'Vui lòng chọn hạn chót công việc'),
    priorityRequired: message('Select a priority', 'Vui lòng chọn mức độ ưu tiên'),
    statusRequired: message('Select a task status', 'Vui lòng chọn trạng thái công việc'),
  },
  meeting: {
    titleRequired: message('Meeting title is required', 'Tên cuộc họp không được để trống'),
    titleMin: message('Meeting title must be at least 3 characters', 'Tên cuộc họp phải có tối thiểu 3 ký tự'),
    dateRequired: message('Select a meeting date', 'Vui lòng chọn ngày họp'),
    timeRequired: message('Enter a meeting time (e.g. 09:00–10:00)', 'Vui lòng nhập khung giờ họp (VD: 09:00 - 10:00)'),
    projectRequired: message('Select a related project', 'Vui lòng chọn dự án liên quan'),
    organizerRequired: message('Enter the meeting organizer', 'Vui lòng nhập người chủ trì'),
    organizerMin: message('Organizer name must be at least 2 characters', 'Tên người chủ trì phải có tối thiểu 2 ký tự'),
    participantsCountMin: message('At least one participant is required', 'Số người tham dự tối thiểu là 1'),
  },
  document: {
    fileRequired: message('Select or drop a file to upload', 'Vui lòng chọn hoặc kéo thả tập tin cần tải lên'),
    accessScopeRequired: message('Select document access rights', 'Vui lòng chọn quyền truy cập tài liệu'),
  },
};

export default validationMessages;

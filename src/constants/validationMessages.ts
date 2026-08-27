/**
 * File quản lý tập trung toàn bộ các câu thông báo Validation trong hệ thống
 */
export const validationMessages = {
  // Generic helpers
  required: (field: string) => `${field} không được để trống`,
  min: (field: string, min: number) => `${field} phải có tối thiểu ${min} ký tự`,
  max: (field: string, max: number) => `${field} không được vượt quá ${max} ký tự`,
  email: 'Email không đúng định dạng (VD: example@congty.vn)',
  phone: 'Số điện thoại không đúng định dạng (8 - 15 chữ số)',
  select: (field: string) => `Vui lòng chọn ${field}`,
  positiveNumber: (field: string) => `${field} phải lớn hơn 0`,

  // 1. Auth & Password Messages
  auth: {
    emailRequired: 'Vui lòng nhập email hoặc tên đăng nhập',
    passwordRequired: 'Vui lòng nhập mật khẩu',
    passwordMin: 'Mật khẩu phải có tối thiểu 6 ký tự',
    newPasswordRequired: 'Vui lòng nhập mật khẩu mới',
    confirmPasswordRequired: 'Vui lòng xác nhận mật khẩu mới',
    passwordMatch: 'Xác nhận mật khẩu không trùng khớp',
  },

  // 2. User Form Messages
  user: {
    displayNameRequired: 'Tên hiển thị (Display Name) không được để trống',
    displayNameMin: 'Tên hiển thị phải có tối thiểu 2 ký tự',
    nameRequired: 'Họ và tên không được để trống',
    nameMin: 'Họ và tên phải có tối thiểu 2 ký tự',
    emailRequired: 'Email đăng nhập không được để trống',
    emailInvalid: 'Email không đúng định dạng (VD: a.nguyen@congty.vn)',
    passwordRequired: 'Mật khẩu không được để trống',
    passwordMin: 'Mật khẩu khởi tạo phải có tối thiểu 6 ký tự',
    departmentRequired: 'Vui lòng chọn phòng ban',
    roleRequired: 'Vui lòng chọn vai trò',
    phoneInvalid: 'Số điện thoại không đúng định dạng',
  },

  // 3. Department Form Messages
  department: {
    nameRequired: 'Tên phòng ban không được để trống',
    nameMin: 'Tên phòng ban phải có tối thiểu 2 ký tự',
    phoneInvalid: 'Số điện thoại không đúng định dạng',
  },

  // 4. Project Form Messages
  project: {
    nameRequired: 'Tên dự án không được để trống',
    nameMin: 'Tên dự án phải có tối thiểu 3 ký tự',
    leadRequired: 'Vui lòng nhập người quản lý dự án',
    leadMin: 'Tên người quản lý phải có tối thiểu 2 ký tự',
    departmentRequired: 'Vui lòng chọn phòng ban phụ trách',
    deadlineRequired: 'Vui lòng chọn hạn hoàn thành dự án',
  },

  // 5. Task Form Messages
  task: {
    titleRequired: 'Tên công việc không được để trống',
    titleMin: 'Tên công việc phải có tối thiểu 3 ký tự',
    projectRequired: 'Vui lòng chọn dự án liên quan',
    assigneeRequired: 'Vui lòng chọn người thực hiện',
    deadlineRequired: 'Vui lòng chọn hạn chót công việc',
    priorityRequired: 'Vui lòng chọn mức độ ưu tiên',
    statusRequired: 'Vui lòng chọn trạng thái công việc',
  },

  // 6. Meeting Form Messages
  meeting: {
    titleRequired: 'Tên cuộc họp không được để trống',
    titleMin: 'Tên cuộc họp phải có tối thiểu 3 ký tự',
    dateRequired: 'Vui lòng chọn ngày họp',
    timeRequired: 'Vui lòng nhập khung giờ họp (VD: 09:00 - 10:00)',
    projectRequired: 'Vui lòng chọn dự án liên quan',
    organizerRequired: 'Vui lòng nhập người chủ trì',
    organizerMin: 'Tên người chủ trì phải có tối thiểu 2 ký tự',
    participantsCountMin: 'Số người tham dự tối thiểu là 1',
  },

  // 7. Document Upload Messages
  document: {
    fileRequired: 'Vui lòng chọn hoặc kéo thả tập tin cần tải lên',
    accessScopeRequired: 'Vui lòng chọn quyền truy cập tài liệu',
  },
};

export default validationMessages;

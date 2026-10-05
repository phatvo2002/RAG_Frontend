import React, { useState, useEffect, useMemo } from 'react';
import { Modal, ConfirmModal } from '@/components/disclosure';
import { CustomTable } from '@/components/customTable';
import { useApp } from '@/context/AppContext';
import {
  RoleItem,
  useRoleQuery,
  useUpdateRoleMutation,
  useCreateRoleMutation,
  useSyncRolePermissionsMutation,
  useDeactivateRoleMutation,
  useReactivateRoleMutation,
  ApiFunctionItem,
  RoleUserItem,
} from '@/api/roles.api';
import { useApiFunctionTreeQuery } from '@/api/api-functions.api';
import { useUsersQuery, useAssignRoleMutation, useRemoveRoleMutation } from '@/api/users.api';
import { useDepartmentsQuery } from '@/api/departments.api';
import { User } from '@/types';
import {
  Shield,
  Plus,
  Search,
  Trash2,
  X,
  CheckSquare,
  Square,
  Building,
  UserCheck,
  Phone,
  Mail,
  ChevronRight,
  ChevronDown,
  ChevronsUpDown,
  AlertCircle,
  Sparkles,
  Users,
  CheckCircle,
  Lock,
  Globe,
  Tag
} from 'lucide-react';

interface RoleDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  roleToEdit?: RoleItem | null;
  onSuccessToast?: (msg: string) => void;
}

// Cấu trúc danh mục phân quyền theo 3 cột nghiệp vụ của dự án
interface PermissionItem {
  id: string;
  code?: string;
  label: string;
  desc?: string | null;
  method?: string;
  route?: string;
}

interface PermissionGroup {
  id: string;
  name: string;
  items: PermissionItem[];
}

const DEFAULT_PROJECT_PERMISSIONS: { column: number; title: string; groups: PermissionGroup[] }[] = [
  {
    column: 1,
    title: 'AI & Tri thức (RAG)',
    groups: [
      {
        id: 'ai_chat',
        name: 'Trợ lý AI & Chat RAG',
        items: [
          { id: 'chat.view', label: 'Truy cập phòng chat AI' },
          { id: 'chat.send', label: 'Gửi prompt & truy vấn dữ liệu' },
          { id: 'chat.template', label: 'Sử dụng mẫu prompt nâng cao' },
          { id: 'chat.attach', label: 'Đính kèm tệp phân tích' },
        ],
      },
      {
        id: 'data_repo',
        name: 'Kho Tri thức & Tài liệu',
        items: [
          { id: 'doc.view', label: 'Xem danh sách tài liệu' },
          { id: 'doc.upload', label: 'Tải tài liệu mới lên' },
          { id: 'doc.vector_index', label: 'Kích hoạt Index Vector RAG' },
          { id: 'doc.delete', label: 'Xóa & Thu hồi tài liệu' },
        ],
      },
      {
        id: 'projects',
        name: 'Quản lý Dự án (Projects)',
        items: [
          { id: 'proj.view', label: 'Xem tổng quan dự án' },
          { id: 'proj.create', label: 'Tạo dự án mới' },
          { id: 'proj.update', label: 'Cập nhật tiến độ dự án' },
        ],
      },
    ],
  },
  {
    column: 2,
    title: 'Điều hành & Tác vụ',
    groups: [
      {
        id: 'tasks',
        name: 'Quản lý Công việc (Tasks)',
        items: [
          { id: 'task.view', label: 'Xem bảng công việc Kanban' },
          { id: 'task.create', label: 'Giao việc & Tạo task mới' },
          { id: 'task.update_status', label: 'Kéo thả đổi trạng thái công việc' },
          { id: 'task.priority', label: 'Thiết lập mức độ khẩn cấp' },
        ],
      },
      {
        id: 'meetings',
        name: 'Phòng họp & Biên bản',
        items: [
          { id: 'meet.view', label: 'Xem lịch phòng họp' },
          { id: 'meet.schedule', label: 'Đặt lịch họp mới' },
          { id: 'meet.ai_summary', label: 'Trích xuất tóm tắt AI Transcript' },
          { id: 'meet.export', label: 'Xuất biên bản họp (PDF/Word)' },
        ],
      },
      {
        id: 'reports',
        name: 'Báo cáo & Thống kê',
        items: [
          { id: 'rep.view', label: 'Xem bảng phân tích chỉ số' },
          { id: 'rep.export', label: 'Xuất báo cáo Excel / CSV' },
        ],
      },
    ],
  },
  {
    column: 3,
    title: 'Quản trị & Kiểm toán',
    groups: [
      {
        id: 'users',
        name: 'Quản trị Người dùng (Users)',
        items: [
          { id: 'user.view', label: 'Xem danh sách tài khoản' },
          { id: 'user.create_edit', label: 'Thêm & Chỉnh sửa người dùng' },
          { id: 'user.reset_pwd', label: 'Đặt lại mật khẩu' },
          { id: 'user.lock', label: 'Khóa & Mở khóa tài khoản' },
        ],
      },
      {
        id: 'departments',
        name: 'Quản trị Phòng ban',
        items: [
          { id: 'dept.view', label: 'Xem cơ cấu phòng ban' },
          { id: 'dept.manage', label: 'Thêm / Sửa / Phân cấp phòng ban' },
        ],
      },
      {
        id: 'roles',
        name: 'Phân quyền & Vai trò',
        items: [
          { id: 'role.manage', label: 'Cấu hình nhóm quyền & vai trò' },
          { id: 'role.assign', label: 'Gán nhân viên vào vai trò' },
        ],
      },
      {
        id: 'logs',
        name: 'Nhật ký Hoạt động (Logs)',
        items: [
          { id: 'log.view', label: 'Kiểm toán hoạt động thời gian thực' },
          { id: 'log.export', label: 'Xuất lịch sử kiểm toán' },
        ],
      },
    ],
  },
];

export const RoleDetailModal: React.FC<RoleDetailModalProps> = ({
  isOpen,
  onClose,
  roleToEdit,
  onSuccessToast,
}) => {
  const { showToast } = useApp();
  const isEditMode = Boolean(roleToEdit);
  const targetRoleId = roleToEdit?.id || '';

  // Form State
  const [roleName, setRoleName] = useState('');
  const [roleCode, setRoleCode] = useState('');
  const [department, setDepartment] = useState('');
  const [scopes, setScopes] = useState<string[]>(['Dự án NEXORA', 'Kho tri thức RAG']);
  const [isActive, setIsActive] = useState(true);
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());

  // Members in this role (Unified between backend API response and local state)
  const [memberSearch, setMemberSearch] = useState('');
  const [memberDeptFilter, setMemberDeptFilter] = useState('');
  const [memberStatusFilter, setMemberStatusFilter] = useState('all');
  const [assignedUsersList, setAssignedUsersList] = useState<RoleUserItem[]>([]);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [addUserSearch, setAddUserSearch] = useState('');
  const initializedRoleIdRef = React.useRef<string | null>(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [jumpPage, setJumpPage] = useState('');

  // Confirm Modal state
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    onConfirm: () => void;
    isLoading?: boolean;
    type?: 'danger' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // API Queries & Mutations
  const { data: allUsers = [] } = useUsersQuery();
  const { data: departments = [] } = useDepartmentsQuery();
  const { data: apiFunctionTree = [], isLoading: isLoadingAllApiFunctions } = useApiFunctionTreeQuery();
  const allApiFunctions = useMemo<ApiFunctionItem[]>(
    () => apiFunctionTree.flatMap((moduleNode) => moduleNode.childFunctions
      .filter((functionNode) => Boolean(functionNode.functionId))
      .map((functionNode) => ({
        apiFunctionId: functionNode.functionId!,
        code: functionNode.functionCode,
        module: functionNode.module || moduleNode.module,
        name: functionNode.functionName,
        description: functionNode.description,
        httpMethod: functionNode.httpMethod || 'GET',
        routeTemplate: functionNode.routeTemplate || '',
        actionType: functionNode.actionType || 'Read',
        riskLevel: functionNode.riskLevel || 'Low',
        requiresConfirmation: functionNode.requiresConfirmation,
        status: functionNode.status || 'Active',
        version: functionNode.version,
        createdAt: functionNode.createdAt,
        updatedAt: functionNode.updatedAt,
      }))),
    [apiFunctionTree],
  );

  // Call API for Role Detail when modal is open and has targetRoleId
  const {
    data: roleDetail,
    isLoading: isLoadingRoleDetail,
    isFetching: isFetchingRoleDetail,
    refetch: refetchRoleDetail,
  } = useRoleQuery(isOpen && targetRoleId ? targetRoleId : '');

  const createRoleMutation = useCreateRoleMutation();
  const updateRoleMutation = useUpdateRoleMutation();
  const syncRolePermissionsMutation = useSyncRolePermissionsMutation();
  const deactivateRoleMutation = useDeactivateRoleMutation();
  const reactivateRoleMutation = useReactivateRoleMutation();
  const assignRoleMutation = useAssignRoleMutation();
  const removeRoleMutation = useRemoveRoleMutation();

  // Render permission groups from the API's module/function tree.
  const permissionColumns = useMemo(() => {
    // Hợp nhất danh sách tổng allApiFunctions và roleDetail.apiFunctions để đảm bảo không bị thiếu bất kỳ quyền nào
    const mergedMap = new Map<string, ApiFunctionItem>();

    allApiFunctions.forEach((fn: ApiFunctionItem) => {
      const key = fn.apiFunctionId || fn.code;
      if (key) mergedMap.set(key, fn);
    });

    if (roleDetail?.apiFunctions && Array.isArray(roleDetail.apiFunctions)) {
      roleDetail.apiFunctions.forEach((fn: ApiFunctionItem) => {
        const key = fn.apiFunctionId || fn.code;
        if (key && !mergedMap.has(key)) {
          mergedMap.set(key, fn);
        }
      });
    }

    const sourceList = Array.from(mergedMap.values());

    if (sourceList.length > 0) {
      const representedKeys = new Set<string>();
      const dynamicGroups: PermissionGroup[] = apiFunctionTree.map((moduleNode) => {
        const items = moduleNode.childFunctions
          .filter((functionNode) => Boolean(functionNode.functionId))
          .map((functionNode) => {
            representedKeys.add(functionNode.functionId!);
            representedKeys.add(functionNode.functionCode);
            return {
              id: functionNode.functionId!,
              code: functionNode.functionCode,
              label: functionNode.functionName || functionNode.functionCode,
              desc: functionNode.description,
              route: functionNode.routeTemplate || undefined,
              method: functionNode.httpMethod || undefined,
            };
          });

        return {
          id: `module_${moduleNode.functionCode.toLowerCase()}`,
          name: `Phân hệ ${moduleNode.functionName}`,
          items,
        };
      });

      const missingFunctions = sourceList.filter((fn) =>
        !representedKeys.has(fn.apiFunctionId) && !representedKeys.has(fn.code));
      missingFunctions.forEach((fn) => {
        const modName = fn.module || 'Hệ thống';
        let group = dynamicGroups.find((item) => item.name === `Phân hệ ${modName}`);
        if (!group) {
          group = { id: `module_${modName.toLowerCase()}`, name: `Phân hệ ${modName}`, items: [] };
          dynamicGroups.push(group);
        }
        group.items.push({ id: fn.apiFunctionId || fn.code, code: fn.code, label: fn.name || fn.code });
      });

      // Distribute evenly across 3 columns
      const cols: { column: number; title: string; groups: PermissionGroup[] }[] = [
        { column: 1, title: 'Xác thực & Tổ chức', groups: [] },
        { column: 2, title: 'Phân quyền & Vai trò', groups: [] },
        { column: 3, title: 'Phòng ban & Người dùng', groups: [] },
      ];

      dynamicGroups.forEach((g, index) => {
        cols[index % 3].groups.push(g);
      });

      if (cols.some((c) => c.groups.length > 0)) {
        return cols.filter((c) => c.groups.length > 0);
      }
    }
    return DEFAULT_PROJECT_PERMISSIONS;
  }, [allApiFunctions, roleDetail?.apiFunctions]);

  // All permissions and groups flatten lists
  const allPermissionIds = useMemo(() => {
    return permissionColumns.flatMap((c) => c.groups.flatMap((g) => g.items.map((i) => i.id)));
  }, [permissionColumns]);

  const allGroupIds = useMemo(() => {
    return permissionColumns.flatMap((c) => c.groups.map((g) => g.id));
  }, [permissionColumns]);

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(allGroupIds));

  // Reset & Populate Form when Modal opens or when roleDetail is loaded/updated
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (roleDetail) {
      setRoleName(roleDetail.name || roleToEdit?.name || '');
      setRoleCode(roleDetail.code || (roleDetail.name || '').slice(0, 5).toUpperCase());
      setDepartment((roleDetail as any).department || 'Công nghệ thông tin');
      setScopes((roleDetail as any).scopes || ['Dự án NEXORA', 'Kho tri thức RAG']);
      setIsActive(roleDetail.isActive !== false);

      // Populate permissions by comparing roleDetail.apiFunctions against the master list
      if (roleDetail.apiFunctions && roleDetail.apiFunctions.length > 0) {
        const assignedIds = new Set<string>();
        roleDetail.apiFunctions.forEach((f) => {
          if (f.status !== 'Inactive') {
            if (f.apiFunctionId) assignedIds.add(f.apiFunctionId);
            if (f.code) assignedIds.add(f.code);
          }
        });
        setSelectedPermissions(assignedIds);
      } else {
        setSelectedPermissions(new Set());
      }

      // Populate users from API payload response
      if (roleDetail.users && roleDetail.users.length > 0) {
        setAssignedUsersList(roleDetail.users);
      } else {
        // Fallback to matching users from allUsers
        const matchingUsers = allUsers.filter(
          (u) =>
            u.role === roleDetail.name ||
            u.role === roleToEdit?.role ||
            u.roleId === roleDetail.roleId ||
            u.roles?.some((r) => r.roleId === roleDetail.roleId || r.roleName === roleDetail.name)
        );
        setAssignedUsersList(
          matchingUsers.map((u) => ({
            userId: u.id,
            email: u.email,
            userName: u.userName || u.email.split('@')[0],
            displayName: u.displayName || u.name,
            phoneNumber: u.phoneNumber || u.phone,
            isActive: u.isActive !== false,
            department: u.department || 'Công nghệ thông tin',
          }))
        );
      }
    } else if (roleToEdit) {
      setRoleName(roleToEdit.name || roleToEdit.role || '');
      setRoleCode(roleToEdit.code || (roleToEdit.name || '').slice(0, 5).toUpperCase());
      setDepartment((roleToEdit as any).department || 'Công nghệ thông tin');
      setScopes((roleToEdit as any).scopes || ['Dự án NEXORA', 'Kho tri thức RAG']);
      setIsActive(roleToEdit.status !== 'Vô hiệu hóa');
      setSelectedPermissions(new Set());
    } else {
      setRoleName('');
      setRoleCode('');
      setDepartment(departments[0]?.name || 'Công nghệ thông tin');
      setScopes(['Dự án NEXORA', 'Kho tri thức RAG']);
      setIsActive(true);
      setSelectedPermissions(new Set());
      setAssignedUsersList([]);
    }
    setPage(1);
    setMemberSearch('');
  }, [isOpen, roleDetail, roleToEdit]);

  // Keep expanded groups in sync whenever permission groups load or change
  useEffect(() => {
    if (isOpen && allGroupIds.length > 0) {
      setExpandedGroups(new Set(allGroupIds));
    }
  }, [isOpen, allGroupIds]);

  // Sync incoming users from server when refetched without dropping local additions
  useEffect(() => {
    const serverUsers = roleDetail?.users;
    if (serverUsers && serverUsers.length > 0 && isOpen) {
      setAssignedUsersList((prev) => {
        const map = new Map<string, RoleUserItem>();
        // Add existing local users first
        prev.forEach((u) => map.set(u.userId, u));
        // Merge server users
        serverUsers.forEach((u) => map.set(u.userId, u));
        return Array.from(map.values());
      });
    }
  }, [roleDetail?.users, isOpen]);

  const isAllExpanded = useMemo(() => {
    return allGroupIds.length > 0 && allGroupIds.every((id) => expandedGroups.has(id));
  }, [allGroupIds, expandedGroups]);

  const handleToggleExpandAll = () => {
    if (isAllExpanded) {
      setExpandedGroups(new Set());
    } else {
      setExpandedGroups(new Set(allGroupIds));
    }
  };

  const handleToggleExpandGroup = (groupId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  // Helper check if permission is selected by id or code
  const checkIsPermissionSelected = (item: PermissionItem) => {
    return selectedPermissions.has(item.id) || (item.code ? selectedPermissions.has(item.code) : false);
  };

  const totalSelectedCount = useMemo(() => {
    let count = 0;
    permissionColumns.forEach((c) => {
      c.groups.forEach((g) => {
        g.items.forEach((i) => {
          if (checkIsPermissionSelected(i)) {
            count++;
          }
        });
      });
    });
    return count;
  }, [permissionColumns, selectedPermissions]);

  const totalMasterCount = useMemo(() => {
    return permissionColumns.reduce(
      (sum, c) => sum + c.groups.reduce((gSum, g) => gSum + g.items.length, 0),
      0
    );
  }, [permissionColumns]);

  const isAllSelected = useMemo(() => {
    return totalMasterCount > 0 && totalSelectedCount === totalMasterCount;
  }, [totalMasterCount, totalSelectedCount]);

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedPermissions(new Set());
    } else {
      const allKeys = new Set<string>();
      permissionColumns.forEach((c) =>
        c.groups.forEach((g) =>
          g.items.forEach((i) => {
            allKeys.add(i.id);
            if (i.code) allKeys.add(i.code);
          })
        )
      );
      setSelectedPermissions(allKeys);
    }
  };

  const handleToggleGroup = (group: PermissionGroup) => {
    const isGroupAllSelected = group.items.every(checkIsPermissionSelected);
    const groupItemKeys = group.items.flatMap((i) => [i.id, i.code].filter(Boolean) as string[]);

    setSelectedPermissions((prev) => {
      const next = new Set(prev);
      if (isGroupAllSelected) {
        groupItemKeys.forEach((key) => next.delete(key));
      } else {
        group.items.forEach((i) => {
          next.add(i.id);
          if (i.code) next.add(i.code);
        });
      }
      return next;
    });
  };

  const handleTogglePermission = (item: PermissionItem) => {
    const isChecked = checkIsPermissionSelected(item);
    setSelectedPermissions((prev) => {
      const next = new Set(prev);
      if (isChecked) {
        next.delete(item.id);
        if (item.code) next.delete(item.code);
      } else {
        next.add(item.id);
        if (item.code) next.add(item.code);
      }
      return next;
    });
  };

  // Add/Remove Scope tags
  const handleRemoveScope = (scopeToRemove: string) => {
    setScopes((prev) => prev.filter((s) => s !== scopeToRemove));
  };

  const handleAddScope = (scopeToAdd: string) => {
    if (scopeToAdd && !scopes.includes(scopeToAdd)) {
      setScopes((prev) => [...prev, scopeToAdd]);
    }
  };

  // Filtered members in this role
  const filteredMembers = useMemo(() => {
    return assignedUsersList.filter((u) => {
      const q = memberSearch.toLowerCase();
      const matchQuery =
        !q ||
        (u.displayName && u.displayName.toLowerCase().includes(q)) ||
        (u.userName && u.userName.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.phoneNumber && u.phoneNumber.includes(q));

      const matchDept =
        !memberDeptFilter ||
        (u.department && u.department.toLowerCase() === memberDeptFilter.toLowerCase());

      const matchStatus =
        memberStatusFilter === 'all' ||
        (memberStatusFilter === 'active' && u.isActive !== false) ||
        (memberStatusFilter === 'inactive' && u.isActive === false);

      return matchQuery && matchDept && matchStatus;
    });
  }, [assignedUsersList, memberSearch, memberDeptFilter, memberStatusFilter]);

  // Paginated members
  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / pageSize));
  const paginatedMembers = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredMembers.slice(start, start + pageSize);
  }, [filteredMembers, page, pageSize]);

  const handleRemoveMember = (member: RoleUserItem) => {
    const userId = member.userId;
    const displayName = member.displayName || member.userName || member.email;
    setConfirmConfig({
      isOpen: true,
      title: 'Xóa nhân viên khỏi vai trò',
      message: `Bạn có chắc chắn muốn xóa "${displayName}" khỏi vai trò "${roleName || 'này'}" không? Sau khi xóa, vai trò của người dùng này sẽ được cập nhật lại.`,
      confirmText: 'Xóa khỏi vai trò',
      type: 'danger',
      onConfirm: () => {
        setAssignedUsersList((prev) => prev.filter((u) => u.userId !== userId));
        const rId = targetRoleId || roleToEdit?.id;
        if (rId) {
          removeRoleMutation.mutate(
            { userId, roleId: rId },
            {
              onSuccess: () => {
                showToast(
                  `Đã xóa "${displayName}" khỏi vai trò "${roleName}" và cập nhật thông tin người dùng thành công!`,
                  'success'
                );
                refetchRoleDetail();
                setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
              },
              onError: (err: any) => {
                showToast(err.message || 'Không thể thu hồi vai trò của người dùng', 'error');
                setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
              },
            }
          );
        } else {
          setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const handleClearAllMembers = () => {
    if (assignedUsersList.length === 0) return;
    setConfirmConfig({
      isOpen: true,
      title: 'Xóa tất cả nhân viên khỏi vai trò',
      message: `Bạn có chắc chắn muốn xóa toàn bộ ${assignedUsersList.length} nhân viên khỏi vai trò "${roleName}" không?`,
      confirmText: 'Xóa tất cả',
      type: 'danger',
      onConfirm: () => {
        const rId = targetRoleId || roleToEdit?.id;
        const userListToRemove = [...assignedUsersList];
        setAssignedUsersList([]);
        if (rId) {
          Promise.all(
            userListToRemove.map((u) =>
              removeRoleMutation.mutateAsync({ userId: u.userId, roleId: rId }).catch(() => {})
            )
          ).then(() => {
            showToast(
              `Đã xóa toàn bộ nhân viên khỏi vai trò "${roleName}" và cập nhật lại thông tin người dùng!`,
              'success'
            );
            refetchRoleDetail();
            setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
          });
        } else {
          setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const handleAddMember = (user: User) => {
    const userTargetId = user.id || (user as any).userId;
    const userTargetName = user.displayName || user.name || user.userName || user.email;

    if (assignedUsersList.some((u) => u.userId === userTargetId)) {
      showToast(`Nhân viên "${userTargetName}" đã có trong vai trò này!`, 'info');
      setIsAddUserModalOpen(false);
      return;
    }

    const newRoleUser: RoleUserItem = {
      userId: userTargetId,
      email: user.email,
      userName: user.userName || user.email.split('@')[0],
      displayName: userTargetName,
      phoneNumber: user.phoneNumber || user.phone,
      isActive: user.isActive !== false,
      department: user.department || department || 'Công nghệ thông tin',
    };

    // Cập nhật ngay trên giao diện danh sách
    setAssignedUsersList((prev) => [...prev, newRoleUser]);
    setIsAddUserModalOpen(false);

    const rId = targetRoleId || roleToEdit?.id;
    if (rId) {
      assignRoleMutation.mutate(
        { userId: userTargetId, roleId: rId, roleName: roleName || roleDetail?.name },
        {
          onSuccess: () => {
            showToast(
              `Đã gán vai trò "${roleName || 'này'}" cho nhân viên "${userTargetName}" thành công!`,
              'success'
            );
            refetchRoleDetail();
          },
          onError: (err: any) => {
            showToast(err.message || 'Không thể gán vai trò cho người dùng', 'error');
          },
        }
      );
    } else {
      showToast(`Đã thêm nhân viên "${userTargetName}" vào danh sách vai trò!`, 'success');
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSaveRole = async () => {
    if (!roleName.trim()) {
      showToast('Vui lòng nhập tên nhóm quyền / vai trò', 'error');
      return;
    }

    setIsSubmitting(true);

    // Lọc danh sách GUID của các ApiFunction được chọn
    const selectedFunctionGuids: string[] = [];
    permissionColumns.forEach((c) => {
      c.groups.forEach((g) => {
        g.items.forEach((item) => {
          if (checkIsPermissionSelected(item)) {
            // Tìm apiFunctionId tương ứng từ allApiFunctions hoặc item.id
            const matchedFn = allApiFunctions.find(
              (f) => f.apiFunctionId === item.id || f.code === item.id || (item.code && f.code === item.code)
            );
            if (matchedFn?.apiFunctionId) {
              selectedFunctionGuids.push(matchedFn.apiFunctionId);
            } else if (item.id && item.id.includes('-')) {
              selectedFunctionGuids.push(item.id);
            }
          }
        });
      });
    });

    const uniqueFunctionIds = Array.from(new Set(selectedFunctionGuids));

    try {
      if (isEditMode && (targetRoleId || roleToEdit?.id)) {
        const rId = targetRoleId || roleToEdit!.id;

        // 1. Cập nhật tên Role: PUT /api/roles/{roleId} { name: roleName }
        await updateRoleMutation.mutateAsync({
          roleId: rId,
          data: { name: roleName.trim() },
        });

        // 2. Đồng bộ toàn bộ ApiFunction của Role: PUT /api/roles/{roleId}/permissions { functionIds: [...] }
        await syncRolePermissionsMutation.mutateAsync({
          roleId: rId,
          functionIds: uniqueFunctionIds,
        });

        // Cập nhật trạng thái kích hoạt / vô hiệu hóa nếu có thay đổi
        if (roleDetail) {
          if (isActive && !roleDetail.isActive) {
            await reactivateRoleMutation.mutateAsync(rId).catch(() => {});
          } else if (!isActive && roleDetail.isActive) {
            await deactivateRoleMutation.mutateAsync(rId).catch(() => {});
          }
        }

        // Cả 2 API đều thành công -> hiển thị thông báo thành công và đóng modal
        const msg = `Đã cập nhật vai trò "${roleName.trim()}" và đồng bộ phân quyền thành công!`;
        if (onSuccessToast) onSuccessToast(msg);
        else showToast(msg, 'success');
        onClose();
      } else {
        // 1. Gọi API 1: Thêm mới Role: POST /api/roles { name: roleName }
        const createdRole = await createRoleMutation.mutateAsync({
          name: roleName.trim(),
        });

        const newRoleId = createdRole.id || (createdRole as any).roleId;
        if (!newRoleId) {
          throw new Error('Không lấy được mã định danh của vai trò mới tạo');
        }

        // 2. Gọi API 2: Đồng bộ toàn bộ ApiFunction cho Role mới tạo: PUT /api/roles/{newRoleId}/permissions { functionIds: [...] }
        await syncRolePermissionsMutation.mutateAsync({
          roleId: newRoleId,
          functionIds: uniqueFunctionIds,
        });

        // Nếu có nhân viên được gán vào vai trò mới
        if (assignedUsersList.length > 0) {
          await Promise.all(
            assignedUsersList.map((u) =>
              assignRoleMutation.mutateAsync({ userId: u.userId, roleId: newRoleId }).catch(() => {})
            )
          );
        }

        // Chỉ khi cả 2 API thành công mới hiển thị thông báo thành công và đóng modal
        const msg = `Đã thêm mới vai trò "${roleName.trim()}" và phân quyền thành công!`;
        if (onSuccessToast) onSuccessToast(msg);
        else showToast(msg, 'success');
        onClose();
      }
    } catch (err: any) {
      showToast(err.message || 'Không thể tạo mới vai trò hoặc phân quyền', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? `Cấu hình chi tiết vai trò: ${roleName || roleToEdit?.name}` : 'Thêm nhóm vai trò mới'}
      maxWidth="full"
    >
      {isLoadingRoleDetail ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <span className="loading loading-spinner loading-lg text-primary" />
          <span className="text-xs text-slate-500 dark:text-zinc-400 font-semibold">
            Đang tải dữ liệu chi tiết vai trò từ hệ thống...
          </span>
        </div>
      ) : (
        <div className="space-y-5 text-xs text-slate-800 dark:text-zinc-100 p-1">
          {/* ========================================================================= */}
          {/* 1. TOP SECTION: THÔNG TIN VAI TRÒ (FORM) */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 dark:bg-zinc-900/60 p-4 rounded-box border border-slate-200 dark:border-zinc-800 items-center">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1.5 text-xs">
                Tên nhóm người dùng / Vai trò <span className="text-rose-500">*</span>
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={roleName}
                  onChange={(e) => {
                    setRoleName(e.target.value);
                    if (!isEditMode && !roleCode) {
                      setRoleCode(e.target.value.slice(0, 6).toUpperCase());
                    }
                  }}
                  placeholder="VD: SupperAdmin, Quản trị viên hệ thống..."
                  className="input input-bordered input-sm w-full pl-9 text-xs bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 h-9"
                />
                <Shield className="w-4 h-4 absolute left-3 text-slate-400 dark:text-zinc-400 pointer-events-none z-10" />
              </div>
            </div>

            <div className="flex flex-col md:items-end justify-center">
              <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1.5 text-xs">
                Trạng thái hoạt động
              </label>
              <div className="flex items-center gap-3 h-9">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="toggle toggle-primary toggle-sm"
                  />
                  <span className="font-semibold text-xs text-slate-700 dark:text-zinc-300">
                    {isActive ? (
                      <span className="badge badge-sm badge-success text-white font-semibold gap-1 py-1 px-2.5">
                        <CheckCircle className="w-3 h-3" /> Đang hoạt động
                      </span>
                    ) : (
                      <span className="badge badge-sm badge-neutral font-semibold gap-1 py-1 px-2.5">
                        <Lock className="w-3 h-3" /> Tạm khóa
                      </span>
                    )}
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 2. CHỨC NĂNG THAO TÁC / MA TRẬN PHÂN QUYỀN (3 CỘT) */}
          {/* ========================================================================= */}
          <div className="bg-white dark:bg-zinc-900 rounded-box border border-slate-200 dark:border-zinc-800 p-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-zinc-800 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-zinc-200">
                  Chức năng thao tác
                </span>
                <span className="badge badge-sm badge-primary text-white text-[10px]">
                  {totalSelectedCount} / {totalMasterCount} quyền
                </span>
                {isLoadingAllApiFunctions && (
                  <span className="loading loading-spinner loading-xs text-primary ml-1" />
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleToggleExpandAll}
                  className="btn btn-xs btn-ghost text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 gap-1 text-[11px] font-medium"
                >
                  <ChevronsUpDown className="w-3.5 h-3.5" />
                  <span>{isAllExpanded ? 'Thu gọn tất cả' : 'Mở rộng tất cả'}</span>
                </button>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleToggleSelectAll}
                    className="checkbox checkbox-primary checkbox-xs rounded"
                  />
                  <span className="font-semibold text-xs text-blue-600 dark:text-blue-400">
                    Tất cả
                  </span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {permissionColumns.map((col) => (
                <div key={col.column} className="space-y-3">
                  <div className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider border-b border-slate-100 dark:border-zinc-800 pb-1 flex items-center justify-between">
                    <span>{col.title}</span>
                  </div>

                  {col.groups.map((group) => {
                    const isGroupAllSelected = group.items.every(checkIsPermissionSelected);
                    const selectedCountInGroup = group.items.filter(checkIsPermissionSelected).length;
                    const isGroupSomeSelected = !isGroupAllSelected && selectedCountInGroup > 0;
                    const isExpanded = expandedGroups.has(group.id);

                    return (
                      <div
                        key={group.id}
                        className="space-y-1 bg-slate-50/50 dark:bg-zinc-800/30 p-2.5 rounded-box border border-slate-100 dark:border-zinc-800/80 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-1.5">
                          <div className="flex items-center gap-1.5 flex-1 min-w-0">
                            {/* Nút mũi tên tắt mở chi tiết */}
                            <button
                              type="button"
                              onClick={() => handleToggleExpandGroup(group.id)}
                              className="p-0.5 rounded hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-500 dark:text-zinc-400 transition-colors cursor-pointer shrink-0"
                              title={isExpanded ? 'Thu gọn chi tiết' : 'Mở rộng chi tiết'}
                            >
                              <ChevronRight
                                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                                  isExpanded ? 'rotate-90 text-blue-600 dark:text-blue-400' : ''
                                }`}
                              />
                            </button>

                            <input
                              type="checkbox"
                              checked={isGroupAllSelected}
                              ref={(el) => {
                                if (el) el.indeterminate = isGroupSomeSelected;
                              }}
                              onChange={() => handleToggleGroup(group)}
                              className="checkbox checkbox-primary checkbox-xs rounded shrink-0"
                            />

                            <span
                              onClick={() => handleToggleExpandGroup(group.id)}
                              className="font-bold text-xs text-slate-800 dark:text-zinc-200 cursor-pointer select-none hover:text-blue-600 dark:hover:text-blue-400 truncate"
                              title={group.name}
                            >
                              {group.name}
                            </span>
                          </div>

                          <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono shrink-0">
                            {selectedCountInGroup}/{group.items.length}
                          </span>
                        </div>

                        {/* Danh sách các quyền chi tiết (chỉ hiển thị khi mở rộng) */}
                        {isExpanded && (
                          <div className="pl-6 space-y-1 border-l-2 border-slate-200 dark:border-zinc-700 ml-2 mt-1.5 pt-0.5 animate-fadeIn">
                            {group.items.map((item) => {
                              const isChecked = checkIsPermissionSelected(item);
                              return (
                                <label
                                  key={item.id}
                                  className="flex items-center gap-2 py-0.5 cursor-pointer text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 select-none text-[11px]"
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => handleTogglePermission(item)}
                                    className="checkbox checkbox-xs rounded border-slate-300 dark:border-zinc-600 shrink-0"
                                  />
                                  <span className="truncate">{item.label}</span>
                                </label>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 3. BOTTOM SECTION: NHÂN VIÊN THUỘC NHÓM */}
          {/* ========================================================================= */}
          <div className="rounded-box border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-xs">
            {/* Blue ribbon banner */}
            <div className="bg-blue-600 dark:bg-blue-700 text-white px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span className="font-bold text-xs uppercase tracking-wider">
                  Nhân viên thuộc nhóm ({assignedUsersList.length})
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsAddUserModalOpen(true)}
                className="btn btn-xs bg-white text-blue-700 hover:bg-blue-50 border-none font-bold gap-1 shadow-2xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Gán nhân viên</span>
              </button>
            </div>

            {/* Member Toolbar Filter */}
            <div className="bg-white dark:bg-zinc-900 p-3 border-b border-slate-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
                <div className="relative flex-1 max-w-xs">
                  <input
                    type="text"
                    value={memberSearch}
                    onChange={(e) => {
                      setMemberSearch(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Tìm kiếm theo mã NV, tên NV, email..."
                    className="input input-bordered input-sm w-full pl-8.5 pr-3 text-xs bg-slate-50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500"
                  />
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400 dark:text-zinc-400 pointer-events-none z-10" />
                </div>

                <select
                  value={memberDeptFilter}
                  onChange={(e) => {
                    setMemberDeptFilter(e.target.value);
                    setPage(1);
                  }}
                  className="select select-bordered select-sm text-xs bg-slate-50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100"
                >
                  <option value="">Tất cả phòng ban</option>
                  {departments.map((d) => (
                    <option key={d.id || d.name} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>

                <select
                  value={memberStatusFilter}
                  onChange={(e) => {
                    setMemberStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="select select-bordered select-sm text-xs bg-slate-50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="active">Đang hoạt động</option>
                  <option value="inactive">Tạm khóa</option>
                </select>
              </div>

              {assignedUsersList.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAllMembers}
                  className="btn btn-xs btn-outline btn-error text-[11px] gap-1 font-semibold"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Xóa tất cả</span>
                </button>
              )}
            </div>

            {/* Table */}
            <CustomTable<any> columns={[]} data={[]} className="rounded-none border-0 shadow-none bg-white dark:bg-zinc-900">
            <div className="overflow-x-auto">
              <table className="table table-sm table-zebra w-full text-xs">
                <thead>
                  <tr className="bg-slate-100/80 dark:bg-zinc-800/80 text-slate-600 dark:text-zinc-300 text-[11px]">
                    <th className="w-10 text-center">#</th>
                    <th>Mã nhân viên</th>
                    <th>Tên nhân viên</th>
                    <th>Công việc / Vị trí</th>
                    <th>Phòng ban</th>
                    <th>Số điện thoại / Email</th>
                    <th className="w-16 text-center">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedMembers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-6 text-slate-400 dark:text-zinc-500">
                        Chưa có nhân viên nào trong nhóm quyền này
                      </td>
                    </tr>
                  ) : (
                    paginatedMembers.map((member, idx) => {
                      const stt = (page - 1) * pageSize + idx + 1;
                      const memberDisplayName = member.displayName || member.userName || member.email;
                      const initials = memberDisplayName
                        .split(' ')
                        .map((w) => w[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase();

                      return (
                        <tr key={member.userId} className="hover">
                          <td className="text-center font-semibold text-slate-500 dark:text-zinc-400">
                            {stt}
                          </td>
                          <td className="font-mono text-slate-600 dark:text-zinc-300 font-semibold">
                            {member.userName || member.email.split('@')[0]}
                          </td>
                          <td>
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 text-[10px] font-bold flex items-center justify-center">
                                {initials}
                              </div>
                              <span className="font-bold text-slate-900 dark:text-zinc-100">
                                {memberDisplayName}
                              </span>
                            </div>
                          </td>
                          <td className="text-slate-600 dark:text-zinc-300">
                            {roleName || 'Nhân viên'}
                          </td>
                          <td className="text-slate-600 dark:text-zinc-300">
                            {member.department || department || 'Công nghệ thông tin'}
                          </td>
                          <td className="text-slate-500 dark:text-zinc-400 font-mono text-[11px]">
                            {member.phoneNumber || member.email}
                          </td>
                          <td className="text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveMember(member)}
                              className="btn btn-ghost btn-xs btn-square text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 cursor-pointer"
                              title="Xóa khỏi vai trò"
                            >
                              <X className="w-3.5 h-3.5 stroke-[2.5]" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Pagination Controls */}
            <div className="bg-white dark:bg-zinc-900 p-2.5 border-t border-slate-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="btn btn-xs btn-outline border-slate-200 dark:border-zinc-700 disabled:opacity-40"
                >
                  ‹
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPage(p)}
                    className={`btn btn-xs ${
                      page === p
                        ? 'btn-primary text-white'
                        : 'btn-ghost text-slate-600 dark:text-zinc-300'
                    }`}
                  >
                    {p}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="btn btn-xs btn-outline border-slate-200 dark:border-zinc-700 disabled:opacity-40"
                >
                  ›
                </button>

                <span className="text-[11px] text-slate-400 dark:text-zinc-500 ml-2">
                  Đi đến trang:
                </span>
                <input
                  type="number"
                  min={1}
                  max={totalPages}
                  value={jumpPage}
                  onChange={(e) => setJumpPage(e.target.value)}
                  placeholder={`${page}`}
                  className="input input-bordered input-xs w-12 text-center"
                />
                <button
                  type="button"
                  onClick={() => {
                    const p = parseInt(jumpPage, 10);
                    if (p >= 1 && p <= totalPages) {
                      setPage(p);
                      setJumpPage('');
                    }
                  }}
                  className="btn btn-xs btn-primary text-white"
                >
                  →
                </button>
              </div>

              <div className="flex items-center gap-2 text-slate-500 dark:text-zinc-400 text-xs">
                <span>Hiển thị:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  className="select select-bordered select-xs"
                >
                  <option value={5}>5 hàng</option>
                  <option value={10}>10 hàng</option>
                  <option value={20}>20 hàng</option>
                </select>
              </div>
            </div>
            </CustomTable>
          </div>

          {/* ========================================================================= */}
          {/* 4. MODAL PHỤ: CHỌN NHÂN VIÊN GÁN VÀO VAI TRÒ */}
          {/* ========================================================================= */}
          {isAddUserModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
              <div className="card w-full max-w-md bg-white dark:bg-zinc-900 p-5 rounded-box shadow-2xl border border-slate-200 dark:border-zinc-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
                  <h4 className="font-bold text-slate-900 dark:text-zinc-100 text-sm flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-blue-600" />
                    <span>Chọn nhân viên gán vào vai trò</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => setIsAddUserModalOpen(false)}
                    className="btn btn-xs btn-circle btn-ghost"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Search input in Add User modal */}
                <div className="relative">
                  <input
                    type="text"
                    value={addUserSearch}
                    onChange={(e) => setAddUserSearch(e.target.value)}
                    placeholder="Tìm kiếm nhân viên theo tên, email..."
                    className="input input-bordered input-sm w-full pl-8.5 text-xs bg-slate-50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 placeholder:text-slate-400"
                  />
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400 pointer-events-none z-10" />
                </div>

                <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-zinc-800">
                  {allUsers
                    .filter((u) => !assignedUsersList.some((au) => au.userId === u.id))
                    .filter((u) => {
                      if (!addUserSearch) return true;
                      const q = addUserSearch.toLowerCase();
                      return (
                        (u.name && u.name.toLowerCase().includes(q)) ||
                        (u.displayName && u.displayName.toLowerCase().includes(q)) ||
                        (u.userName && u.userName.toLowerCase().includes(q)) ||
                        (u.email && u.email.toLowerCase().includes(q))
                      );
                    })
                    .map((user) => (
                      <div
                        key={user.id}
                        onClick={() => handleAddMember(user)}
                        className="p-2.5 flex items-center justify-between hover:bg-blue-50/50 dark:hover:bg-zinc-800/60 cursor-pointer rounded-box transition-colors"
                      >
                        <div>
                          <p className="font-bold text-slate-900 dark:text-zinc-100 text-xs">
                            {user.name || user.displayName}
                          </p>
                          <p className="text-[11px] text-slate-400 dark:text-zinc-500">
                            {user.email} • {user.department || 'Chưa phân ban'}
                          </p>
                        </div>
                        <button
                          type="button"
                          className="btn btn-xs btn-primary text-white font-semibold cursor-pointer"
                        >
                          Thêm
                        </button>
                      </div>
                    ))}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddUserModalOpen(false);
                      setAddUserSearch('');
                    }}
                    className="btn btn-sm btn-ghost"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 5. FOOTER ACTIONS */}
          {/* ========================================================================= */}
          <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-sm btn-ghost text-slate-700 dark:text-zinc-300 font-medium"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSaveRole}
              disabled={
                isSubmitting ||
                createRoleMutation.isPending ||
                updateRoleMutation.isPending ||
                syncRolePermissionsMutation.isPending
              }
              className="btn btn-sm btn-primary text-white font-medium shadow-xs"
            >
              {(isSubmitting ||
                createRoleMutation.isPending ||
                updateRoleMutation.isPending ||
                syncRolePermissionsMutation.isPending) && (
                <span className="loading loading-spinner loading-xs" />
              )}
              <span>{isSubmitting ? 'Đang lưu...' : 'Lưu thông tin'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal cảnh báo xác nhận xóa */}
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmText={confirmConfig.confirmText}
        type={confirmConfig.type || 'danger'}
        isLoading={removeRoleMutation.isPending}
      />
    </Modal>
  );
};
export default RoleDetailModal;

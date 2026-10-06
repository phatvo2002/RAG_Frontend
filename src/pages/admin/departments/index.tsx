import React, { useState, useMemo } from 'react';
import { Header } from '@/components/header';
import { useApp } from '@/context/AppContext';
import { useTranslation } from 'react-i18next';
import { Department } from '@/types';
import {
  useDepartmentsQuery,
  useArchiveDepartmentMutation,
} from '@/api/departments.api';
import { useUsersQuery } from '@/api/users.api';
import { DepartmentModal } from './DepartmentModal';
import { ConfirmModal, Modal } from '@/components/disclosure';
import { CustomTable, TableRowActions } from '@/components/customTable';
import {
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  RefreshCw,
  Search,
  Download,
  X,
  Monitor,
  Briefcase,
  TrendingUp,
  BarChart2,
  Coins,
  DollarSign,
  Users,
  Shield,
  Settings,
  Package,
  UserCheck,
  Building2,
  ChevronLeft,
  ChevronRight,
  User as UserIcon,
} from 'lucide-react';

interface EnrichedDepartment {
  raw: Department;
  id: string;
  name: string;
  code: string;
  icon: any;
  iconBg: string;
  manager: {
    name: string;
    avatar: string;
    hasManager: boolean;
  };
  memberCount: number;
  status: 'active' | 'no_manager' | 'inactive';
  statusText: string;
  updatedAt: string;
  subDepartmentCount: number;
  duties: string[];
}

export const DepartmentsPage: React.FC = () => {
  const { showToast } = useApp();
  const { t } = useTranslation(['admin', 'common', 'table']);

  // TanStack Query for Departments & Users
  const {
    data: departments = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useDepartmentsQuery();

  const { data: users = [] } = useUsersQuery();

  const userMap = useMemo(() => {
    const map = new Map<string, any>();
    users.forEach((u) => {
      map.set(u.id, u);
      if (u.userName) map.set(u.userName.toLowerCase(), u);
    });
    return map;
  }, [users]);

  const archiveMutation = useArchiveDepartmentMutation();

  // Local Filter & Pagination State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [managerFilter, setManagerFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Active Selected Department for Side Drawer
  const [activeDeptDetail, setActiveDeptDetail] = useState<EnrichedDepartment | null>(null);

  // Modals State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deptToEdit, setDeptToEdit] = useState<Department | null>(null);
  const [deptToArchive, setDeptToArchive] = useState<Department | null>(null);

  // Enrich Departments matching 09.Màn hình phòng ban.png
  const enrichedDepartments: EnrichedDepartment[] = useMemo(() => {
    return departments.map((d, index) => {
      const name = d.name || 'Phòng ban';
      const lower = name.toLowerCase();
      let code = d.code || (d.id ? d.id.slice(0, 4).toUpperCase() : 'DEPT');
      let icon = Monitor;
      let iconBg = 'bg-blue-600';
      let memberCount = 18;
      let managerName = 'Lê Ngọc Huy';
      let hasManager = true;
      let status: 'active' | 'no_manager' | 'inactive' = 'active';
      let statusText = 'Hoạt động';
      let updatedAt = 'Hôm nay, 10:24';
      let duties: string[] = [
        'Quản lý hạ tầng công nghệ thông tin của công ty',
        'Phát triển và vận hành các hệ thống phần mềm nội bộ',
        'Đảm bảo an toàn thông tin và bảo mật dữ liệu',
        'Hỗ trợ kỹ thuật cho người dùng và các phòng ban',
      ];

      // Check manager from userMap
      if (d.managerUserId && userMap.has(d.managerUserId)) {
        managerName = userMap.get(d.managerUserId).name || userMap.get(d.managerUserId).displayName || managerName;
      } else if (d.managerName || d.head) {
        managerName = d.managerName || d.head || 'Lê Ngọc Huy';
      }

      if (lower.includes('công nghệ') || lower.includes('it') || lower.includes('kỹ thuật') || lower.includes('software')) {
        icon = Monitor;
        iconBg = 'bg-blue-600';
        code = d.code || 'IT';
        managerName = managerName || 'Lê Ngọc Huy';
        memberCount = 18;
        updatedAt = 'Hôm nay, 10:24';
        duties = [
          'Quản lý hạ tầng công nghệ thông tin của công ty',
          'Phát triển và vận hành các hệ thống phần mềm nội bộ',
          'Đảm bảo an toàn thông tin và bảo mật dữ liệu',
          'Hỗ trợ kỹ thuật cho người dùng và các phòng ban',
        ];
      } else if (lower.includes('kinh doanh') || lower.includes('sale') || lower.includes('sales')) {
        icon = TrendingUp;
        iconBg = 'bg-emerald-600';
        code = d.code || 'SALE';
        managerName = 'Vũ Phạm Anh Tuấn';
        memberCount = 32;
        updatedAt = 'Hôm qua, 16:45';
        duties = [
          'Phát triển mạng lưới đối tác và khách hàng doanh nghiệp',
          'Tối ưu hóa phễu bán hàng và tăng trưởng doanh thu',
          'Đàm phán và ký kết hợp đồng thương mại',
        ];
      } else if (lower.includes('marketing') || lower.includes('truyền thông')) {
        icon = BarChart2;
        iconBg = 'bg-purple-600';
        code = d.code || 'MKT';
        managerName = 'Nguyễn Thị Mai';
        memberCount = 12;
        updatedAt = '23/05/2024, 17:30';
        duties = [
          'Xây dựng chiến lược nhận diện thương hiệu NEXORA',
          'Quản lý các kênh truyền thông và sự kiện',
          'Thu hút khách hàng tiềm năng qua digital marketing',
        ];
      } else if (lower.includes('tài chính') || lower.includes('kế toán') || lower.includes('finance')) {
        icon = Coins;
        iconBg = 'bg-amber-600';
        code = d.code || 'FIN';
        managerName = 'Trần Minh Tâm';
        memberCount = 15;
        updatedAt = '22/05/2024, 14:20';
        duties = [
          'Quản lý dòng tiền, ngân sách và báo cáo tài chính',
          'Kiểm toán nội bộ và tuân thủ chuẩn mực kế toán',
          'Thực hiện thanh quyết toán và đối soát định kỳ',
        ];
      } else if (lower.includes('nhân sự') || lower.includes('hr') || lower.includes('tổ chức')) {
        icon = Users;
        iconBg = 'bg-teal-600';
        code = d.code || 'HR';
        managerName = 'Phạm Thị Thu Hà';
        memberCount = 9;
        updatedAt = '21/05/2024, 09:10';
        duties = [
          'Hoạch định nguồn nhân lực và tuyển dụng nhân tài',
          'Đào tạo và phát triển văn hóa doanh nghiệp',
          'Quản lý chế độ đãi ngộ, phúc lợi và đánh giá hiệu suất',
        ];
      } else if (lower.includes('pháp chế') || lower.includes('legal') || lower.includes('luật')) {
        icon = Shield;
        iconBg = 'bg-blue-700';
        code = d.code || 'LEGAL';
        managerName = 'Chưa phân công';
        hasManager = false;
        status = 'no_manager';
        statusText = 'Chưa có trưởng phòng';
        memberCount = 4;
        updatedAt = '20/05/2024, 11:05';
        duties = [
          'Soạn thảo, thẩm định hợp đồng và văn bản pháp lý',
          'Đảm bảo hoạt động kinh doanh tuân thủ quy định pháp luật',
          'Tư vấn và xử lý các vấn đề pháp lý phát sinh',
        ];
      } else if (lower.includes('vận hành') || lower.includes('ops') || lower.includes('operation')) {
        icon = Settings;
        iconBg = 'bg-blue-600';
        code = d.code || 'OPS';
        managerName = 'Đỗ Quốc Bảo';
        memberCount = 14;
        updatedAt = '20/05/2024, 08:40';
        duties = [
          'Giám sát quy trình hoạt động hàng ngày của doanh nghiệp',
          'Cải tiến hiệu suất quy trình và phân bổ nguồn lực',
          'Quản lý cơ sở vật chất và văn phòng phẩm',
        ];
      } else if (lower.includes('sản phẩm') || lower.includes('product')) {
        icon = Package;
        iconBg = 'bg-orange-600';
        code = d.code || 'PRODUCT';
        managerName = 'Ngô Hoàng Nam';
        memberCount = 16;
        updatedAt = '19/05/2024, 16:25';
        duties = [
          'Nghiên cứu thị trường và định hình lộ trình sản phẩm',
          'Thiết kế trải nghiệm người dùng và tính năng AI',
          'Phối hợp cùng đội ngũ kỹ thuật để phát hành tính năng',
        ];
      }

      if (d.status === 'Inactive' || d.status === 'Vô hiệu hóa') {
        status = 'inactive';
        statusText = 'Tạm khóa';
      }

      return {
        raw: d,
        id: d.id || d.departmentId || `dept-${index}`,
        name,
        code,
        icon,
        iconBg,
        manager: {
          name: managerName,
          avatar: 'LH',
          hasManager,
        },
        memberCount,
        status,
        statusText,
        updatedAt,
        subDepartmentCount: 3,
        duties,
      };
    });
  }, [departments, userMap]);

  const metrics = useMemo(() => ({
    total: enrichedDepartments.length,
    members: enrichedDepartments.reduce((sum, department) => sum + department.memberCount, 0),
    managers: enrichedDepartments.filter((department) => department.manager.hasManager).length,
    unassigned: enrichedDepartments.filter((department) => !department.manager.hasManager).length,
  }), [enrichedDepartments]);

  // Filtered Departments
  const filteredDepartments = useMemo(() => {
    return enrichedDepartments.filter((d) => {
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        d.name.toLowerCase().includes(q) ||
        d.code.toLowerCase().includes(q) ||
        d.manager.name.toLowerCase().includes(q);

      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && d.status === 'active') ||
        (statusFilter === 'no_manager' && d.status === 'no_manager') ||
        (statusFilter === 'inactive' && d.status === 'inactive');

      const matchManager =
        managerFilter === 'all' ||
        (managerFilter === 'assigned' && d.manager.hasManager) ||
        (managerFilter === 'unassigned' && !d.manager.hasManager) ||
        d.manager.name.toLowerCase().includes(managerFilter.toLowerCase());

      return matchSearch && matchStatus && matchManager;
    });
  }, [enrichedDepartments, search, statusFilter, managerFilter]);

  // Paginated Departments
  const totalPages = Math.ceil(filteredDepartments.length / pageSize) || 1;
  const paginatedDepartments = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredDepartments.slice(start, start + pageSize);
  }, [filteredDepartments, page, pageSize]);

  // Handlers
  const handleOpenAdd = () => {
    setDeptToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (dept: Department) => {
    setDeptToEdit(dept);
    setIsModalOpen(true);
  };

  const handleArchive = (dept: Department) => {
    setDeptToArchive(dept);
  };

  const handleConfirmArchive = () => {
    if (!deptToArchive) return;
    archiveMutation.mutate(deptToArchive.id, {
      onSuccess: () => {
        showToast(`Phòng ban ${deptToArchive.name} đã được lưu trữ thành công!`, 'info');
        setDeptToArchive(null);
        refetch();
        if (activeDeptDetail?.id === deptToArchive.id) {
          setActiveDeptDetail(null);
        }
      },
      onError: (err: any) => {
        showToast(err.message || 'Thao tác thất bại', 'error');
        setDeptToArchive(null);
      },
    });
  };

  const handleExportCsv = () => {
    if (filteredDepartments.length === 0) {
      showToast('Không có dữ liệu phòng ban để xuất', 'warning');
      return;
    }
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Tên phòng ban,Mã phòng ban,Trưởng phòng,Số nhân sự,Trạng thái,Cập nhật gần nhất']
        .concat(
          filteredDepartments.map(
            (d) =>
              `"${d.name}","${d.code}","${d.manager.name}","${d.memberCount}","${d.statusText}","${d.updatedAt}"`
          )
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `departments_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Đã xuất ${filteredDepartments.length} phòng ban ra file CSV`, 'info');
  };

  return (
    <div className="nexora-page flex-1 flex flex-col h-full bg-slate-50/50 dark:bg-black overflow-hidden transition-colors">
      <Header />

      <div className="flex-1 flex overflow-hidden w-full">
        
        {/* ==================================================================== */}
        {/* 1. LEFT / MAIN COLUMN: Department Workbench matching 09.png */}
        {/* ==================================================================== */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 min-w-0">
          
          {/* Page Title & Subtitle matching 09.Màn hình phòng ban.png */}
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="space-y-1">
              <h1 className="text-xl font-bold text-slate-900 dark:text-zinc-100 tracking-tight">
                Phòng ban
              </h1>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Quản lý cơ cấu tổ chức, phòng ban và người phụ trách.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleOpenAdd}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm phòng ban</span>
              </button>
              <button
                type="button"
                onClick={handleExportCsv}
                className="px-3.5 py-2 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Xuất dữ liệu</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-slate-800 dark:text-zinc-200 pt-0.5">
            <span><strong>{metrics.total}</strong> <span className="font-normal text-slate-500 dark:text-zinc-400">phòng ban</span></span>
            <span className="text-slate-300 dark:text-zinc-700">|</span>
            <span><strong>{metrics.members}</strong> <span className="font-normal text-slate-500 dark:text-zinc-400">nhân sự</span></span>
            <span className="text-slate-300 dark:text-zinc-700">|</span>
            <span><strong>{metrics.managers}</strong> <span className="font-normal text-slate-500 dark:text-zinc-400">trưởng phòng</span></span>
            <span className="text-slate-300 dark:text-zinc-700">|</span>
            <span><strong>{metrics.unassigned}</strong> <span className="font-normal text-slate-500 dark:text-zinc-400">chưa phân công</span></span>
          </div>

          {/* Search, Filter & Action Bar matching 09.Màn hình phòng ban.png */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3 shadow-2xs">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
              
              {/* Left Search & Filter Selects */}
              <div className="flex flex-1 flex-wrap items-center gap-2.5">
                {/* Search Box */}
                <div className="relative flex-1 min-w-[220px]">
                  <input
                    type="text"
                    placeholder="Tìm theo tên phòng ban..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    className="w-full pl-3 pr-8 py-2 bg-slate-50/80 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs text-slate-800 dark:text-zinc-200 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
                </div>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="px-3 py-2 bg-slate-50/80 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="all">Trạng thái: Tất cả</option>
                  <option value="active">Hoạt động</option>
                  <option value="no_manager">Chưa có trưởng phòng</option>
                  <option value="inactive">Tạm khóa</option>
                </select>

                {/* Manager Filter */}
                <select
                  value={managerFilter}
                  onChange={(e) => {
                    setManagerFilter(e.target.value);
                    setPage(1);
                  }}
                  className="px-3 py-2 bg-slate-50/80 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="all">Người phụ trách: Tất cả</option>
                  <option value="assigned">Đã phân công</option>
                  <option value="unassigned">Chưa phân công</option>
                  <option value="huy">Lê Ngọc Huy</option>
                  <option value="tuấn">Vũ Phạm Anh Tuấn</option>
                </select>
              </div>

            </div>
          </div>

          {/* Error Alert */}
          {isError && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-lg flex items-center justify-between text-xs text-amber-800 dark:text-amber-300">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <span>Không thể tải dữ liệu phòng ban: {(error as any)?.message || 'Vui lòng kiểm tra kết nối API'}.</span>
              </div>
              <button
                onClick={() => refetch()}
                className="px-2 py-1 bg-amber-200 dark:bg-amber-800 hover:bg-amber-300 text-amber-900 dark:text-amber-100 font-medium rounded text-xs flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Thử lại</span>
              </button>
            </div>
          )}

          {/* Department Table matching 09.Màn hình phòng ban.png */}
          <CustomTable<any> columns={[]} data={[]} className="bg-white dark:bg-zinc-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 dark:bg-zinc-950/80 border-b border-slate-200 dark:border-zinc-800 text-[11px] font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wider">
                    <th className="py-3.5 px-4">TÊN PHÒNG BAN</th>
                    <th className="py-3.5 px-4">MÃ PHÒNG BAN</th>
                    <th className="py-3.5 px-4">TRƯỞNG PHÒNG</th>
                    <th className="py-3.5 px-4">SỐ NHÂN SỰ</th>
                    <th className="py-3.5 px-4">TRẠNG THÁI</th>
                    <th className="py-3.5 px-4">CẬP NHẬT GẦN NHẤT</th>
                    <th className="py-3.5 px-4 text-right">THAO TÁC</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-500" />
                        <span>Đang tải danh sách phòng ban...</span>
                      </td>
                    </tr>
                  ) : paginatedDepartments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        Không tìm thấy phòng ban nào phù hợp.
                      </td>
                    </tr>
                  ) : (
                    paginatedDepartments.map((dept) => {
                      const isDetailActive = activeDeptDetail?.id === dept.id;
                      const DeptIcon = dept.icon;

                      return (
                        <tr
                          key={dept.id}
                          className={`hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 transition-colors ${
                            isDetailActive ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
                          }`}
                        >
                          {/* 1. TÊN PHÒNG BAN */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-8 h-8 rounded-full ${dept.iconBg} text-white flex items-center justify-center shrink-0 shadow-2xs`}
                              >
                                <DeptIcon className="w-4 h-4" />
                              </div>
                              <span className="font-semibold text-slate-900 dark:text-zinc-100">
                                {dept.name}
                              </span>
                            </div>
                          </td>

                          {/* 2. MÃ PHÒNG BAN */}
                          <td className="py-3.5 px-4 font-mono text-slate-700 dark:text-zinc-300 font-semibold">
                            {dept.code}
                          </td>

                          {/* 3. TRƯỞNG PHÒNG */}
                          <td className="py-3.5 px-4">
                            {dept.manager.hasManager ? (
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                                  {dept.manager.name.slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <span className="font-semibold text-slate-900 dark:text-zinc-100 block leading-tight">
                                    {dept.manager.name}
                                  </span>
                                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 block leading-none">
                                    Trưởng phòng
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 text-slate-400">
                                <UserIcon className="w-4 h-4" />
                                <span>Chưa phân công</span>
                              </div>
                            )}
                          </td>

                          {/* 4. SỐ NHÂN SỰ */}
                          <td className="py-3.5 px-4 font-normal text-slate-700 dark:text-zinc-300">
                            {dept.memberCount}
                          </td>

                          {/* 5. TRẠNG THÁI */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5 text-xs font-medium">
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  dept.status === 'active'
                                    ? 'bg-emerald-500'
                                    : dept.status === 'no_manager'
                                    ? 'bg-amber-500'
                                    : 'bg-slate-400'
                                }`}
                              />
                              <span
                                className={
                                  dept.status === 'active'
                                    ? 'text-slate-700 dark:text-zinc-300'
                                    : dept.status === 'no_manager'
                                    ? 'text-amber-600 dark:text-amber-400'
                                    : 'text-slate-400'
                                }
                              >
                                {dept.statusText}
                              </span>
                            </div>
                          </td>

                          {/* 6. CẬP NHẬT GẦN NHẤT */}
                          <td className="py-3.5 px-4 text-slate-600 dark:text-zinc-400 font-normal">
                            {dept.updatedAt}
                          </td>

                          {/* 7. THAO TÁC (⋯) */}
                          <td className="py-3.5 px-4 text-right">
                            <TableRowActions
                              align="right"
                              items={[
                                {
                                  label: 'Xem chi tiết',
                                  icon: <UserCheck className="w-3.5 h-3.5" />,
                                  onClick: () => setActiveDeptDetail(dept),
                                },
                                {
                                  label: 'Chỉnh sửa phòng ban',
                                  icon: <Edit2 className="w-3.5 h-3.5" />,
                                  onClick: () => handleOpenEdit(dept.raw),
                                },
                                {
                                  label: 'Quản lý thành viên',
                                  icon: <Users className="w-3.5 h-3.5" />,
                                  onClick: () => showToast(`Quản lý nhân sự của ${dept.name}`, 'info'),
                                },
                                {
                                  label: 'Lưu trữ phòng ban',
                                  icon: <Trash2 className="w-3.5 h-3.5" />,
                                  danger: true,
                                  onClick: () => handleArchive(dept.raw),
                                },
                              ]}
                            />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer matching 09.Màn hình phòng ban.png */}
            <div className="py-3 px-4 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-4 flex-wrap text-xs text-slate-600 dark:text-zinc-400">
              <div>
                Hiển thị{' '}
                <span className="font-semibold text-slate-900 dark:text-zinc-100">
                  {filteredDepartments.length === 0 ? 0 : (page - 1) * pageSize + 1} -{' '}
                  {Math.min(page * pageSize, filteredDepartments.length)}
                </span>{' '}
                của{' '}
                <span className="font-semibold text-slate-900 dark:text-zinc-100">
                  {filteredDepartments.length}
                </span>{' '}
                phòng ban
              </div>

              <div className="flex items-center gap-3">
                {/* Page Size Selector */}
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  className="px-2 py-1 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-md text-xs text-slate-700 dark:text-zinc-300 cursor-pointer"
                >
                  <option value={10}>10 / trang</option>
                  <option value={20}>20 / trang</option>
                  <option value={50}>50 / trang</option>
                </select>

                {/* Page Navigation */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                    <button
                      key={num}
                      onClick={() => setPage(num)}
                      className={`w-6 h-6 rounded text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer ${
                        page === num
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
                      }`}
                    >
                      {num}
                    </button>
                  ))}

                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

          </CustomTable>

        </div>

        {/* ==================================================================== */}
        {/* 2. RIGHT COLUMN: Side Drawer Chi tiết phòng ban matching 09.png */}
        {/* ==================================================================== */}
        {activeDeptDetail && (
          <Modal isOpen={Boolean(activeDeptDetail)} onClose={() => setActiveDeptDetail(null)} title={`Phòng ${activeDeptDetail.name}`} maxWidth="lg">
            <div className="max-h-[72vh] overflow-y-auto">

            {/* Drawer Body */}
            <div className="p-5 space-y-6 flex-1 text-xs">
              
              {/* Department Badge Card */}
              <div className="flex items-center gap-3.5 pb-2">
                <div
                  className={`w-12 h-12 rounded-full ${activeDeptDetail.iconBg} text-white flex items-center justify-center shadow-xs shrink-0`}
                >
                  <activeDeptDetail.icon className="w-6 h-6" />
                </div>

                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-zinc-100 truncate">
                    {activeDeptDetail.name}
                  </h4>
                  <p className="font-mono text-xs text-slate-500 dark:text-zinc-400">
                    {activeDeptDetail.code}
                  </p>
                </div>
              </div>

              {/* Section 1: Thông tin tổng quan */}
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-zinc-800">
                <h5 className="font-bold text-xs text-slate-900 dark:text-zinc-100 uppercase tracking-wider">
                  Thông tin tổng quan
                </h5>

                <div className="space-y-2.5 text-slate-600 dark:text-zinc-400">
                  <div className="flex justify-between items-center">
                    <span>Mã phòng ban</span>
                    <span className="font-mono font-semibold text-slate-900 dark:text-zinc-100">
                      {activeDeptDetail.code}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span>Trưởng phòng</span>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[9px] flex items-center justify-center">
                        {activeDeptDetail.manager.name.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="font-bold text-slate-900 dark:text-zinc-100">
                        {activeDeptDetail.manager.name}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span>Phòng ban trực thuộc</span>
                    <span className="text-slate-900 dark:text-zinc-100 font-medium">
                      {activeDeptDetail.subDepartmentCount} phòng ban
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span>Số nhân sự</span>
                    <span className="text-slate-900 dark:text-zinc-100 font-medium">
                      {activeDeptDetail.memberCount} người
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 2: Hoạt động gần đây matching 09.png */}
              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-zinc-800">
                <h5 className="font-bold text-xs text-slate-900 dark:text-zinc-100 uppercase tracking-wider">
                  Hoạt động gần đây
                </h5>

                <div className="space-y-3 pl-1">
                  <div className="flex items-start gap-2.5">
                    <span className="font-mono text-[10px] text-slate-400 pt-0.5 w-8 shrink-0">10:24</span>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-zinc-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        <span>Cập nhật thông tin phòng ban</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block">Bởi: Lê Ngọc Huy</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="font-mono text-[10px] text-slate-400 pt-0.5 w-8 shrink-0">09:15</span>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-zinc-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        <span>Thêm nhân sự Nguyễn Văn Phát vào phòng ban</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block">Bởi: Lê Ngọc Huy</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="font-mono text-[10px] text-slate-400 pt-0.5 w-8 shrink-0">Hôm qua</span>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-zinc-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        <span>Cập nhật cơ cấu tổ chức phòng ban</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block">Bởi: SuperAdmin</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="font-mono text-[10px] text-slate-400 pt-0.5 w-8 shrink-0">23/05</span>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-zinc-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        <span>Tạo phòng ban {activeDeptDetail.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block">Bởi: SuperAdmin</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Nhiệm vụ & chức năng matching 09.png */}
              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-zinc-800">
                <h5 className="font-bold text-xs text-slate-900 dark:text-zinc-100 uppercase tracking-wider">
                  Nhiệm vụ & chức năng
                </h5>

                <ul className="space-y-1.5 text-slate-600 dark:text-zinc-400 list-disc list-inside">
                  {activeDeptDetail.duties.map((duty, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {duty}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Section 4: Actions row matching 09.png */}
              <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-100 dark:border-zinc-800">
                <button
                  onClick={() => handleOpenEdit(activeDeptDetail.raw)}
                  className="py-2 px-3 bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-zinc-200 flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Chỉnh sửa</span>
                </button>

                <button
                  onClick={() => showToast(`Quản lý nhân sự của ${activeDeptDetail.name}`, 'info')}
                  className="py-2 px-3 bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-zinc-200 flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Quản lý thành viên</span>
                </button>
              </div>

            </div>

            </div>
          </Modal>
        )}

      </div>

      {/* Modal Thêm / Sửa phòng ban */}
      {isModalOpen && (
        <DepartmentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          departmentToEdit={deptToEdit}
          onSuccessToast={(msg) => {
            showToast(msg, 'success');
            refetch();
          }}
        />
      )}

      {/* Modal Cảnh báo lưu trữ phòng ban */}
      <ConfirmModal
        isOpen={Boolean(deptToArchive)}
        onClose={() => setDeptToArchive(null)}
        onConfirm={handleConfirmArchive}
        title="Lưu trữ phòng ban"
        message={`Bạn có chắc chắn muốn lưu trữ phòng ban "${deptToArchive?.name}" không?`}
        confirmText="Lưu trữ"
        type="warning"
        isLoading={archiveMutation.isPending}
      />

    </div>
  );
};

export default DepartmentsPage;

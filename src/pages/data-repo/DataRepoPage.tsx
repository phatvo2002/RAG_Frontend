import React, { useState, useMemo } from 'react';
import { Header } from '@/components/header';
import { useApp } from '@/context/AppContext';
import { UploadModal } from './UploadModal';
import { CustomTable } from '@/components/customTable';
import {
  Upload,
  FolderPlus,
  Search,
  Filter,
  List,
  Grid,
  Folder,
  Star,
  Clock,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  RefreshCw,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock3,
  HardDrive,
  Database,
  Share2,
  ShieldAlert,
  ShieldCheck,
  Plus,
  ExternalLink,
  ChevronLeft,
} from 'lucide-react';

interface KnowledgeDocItem {
  id: string;
  name: string;
  type: 'pdf' | 'docx' | 'xlsx' | 'pptx';
  folder: string;
  department: string;
  size: string;
  updatedAt: string;
  indexStatus: 'indexed' | 'processing' | 'needs_check';
  accessScope: 'Nội bộ' | 'Hạn chế' | 'Phòng ban';
  isStarred?: boolean;
}

interface KnowledgeFolderItem {
  name: string;
  count: number;
  group: 'mine' | 'system';
  isStarred?: boolean;
}

const mockKnowledgeDocs: KnowledgeDocItem[] = [
  {
    id: 'kd-1',
    name: 'Quy trình mua hàng 2024.pdf',
    type: 'pdf',
    folder: 'Quy trình & Hướng dẫn',
    department: 'PMO',
    size: '2.4 MB',
    updatedAt: '28/05/2024 10:24',
    indexStatus: 'indexed',
    accessScope: 'Nội bộ',
    isStarred: true,
  },
  {
    id: 'kd-2',
    name: 'Báo cáo tiến độ ERP — Tuần 21.docx',
    type: 'docx',
    folder: 'Báo cáo & Phân tích',
    department: 'PMO',
    size: '1.8 MB',
    updatedAt: '28/05/2024 09:12',
    indexStatus: 'indexed',
    accessScope: 'Nội bộ',
  },
  {
    id: 'kd-3',
    name: 'Chính sách bảo mật dữ liệu.pdf',
    type: 'pdf',
    folder: 'Chính sách & Quy định',
    department: 'IT',
    size: '1.3 MB',
    updatedAt: '27/05/2024 16:45',
    indexStatus: 'indexed',
    accessScope: 'Hạn chế',
  },
  {
    id: 'kd-4',
    name: 'Kế hoạch kiểm thử UAT.xlsx',
    type: 'xlsx',
    folder: 'Dự án ERP Nexora',
    department: 'QA',
    size: '2.1 MB',
    updatedAt: '27/05/2024 11:00',
    indexStatus: 'processing',
    accessScope: 'Phòng ban',
  },
  {
    id: 'kd-5',
    name: 'Biên bản họp Ban Điều hành.docx',
    type: 'docx',
    folder: 'Biên bản họp',
    department: 'Ban Điều hành',
    size: '1.6 MB',
    updatedAt: '26/05/2024 14:20',
    indexStatus: 'needs_check',
    accessScope: 'Nội bộ',
    isStarred: true,
  },
  {
    id: 'kd-6',
    name: 'Hướng dẫn sử dụng phần mềm.pdf',
    type: 'pdf',
    folder: 'Tài liệu đào tạo',
    department: 'IT',
    size: '3.2 MB',
    updatedAt: '26/05/2024 10:05',
    indexStatus: 'indexed',
    accessScope: 'Nội bộ',
  },
  {
    id: 'kd-7',
    name: 'Danh sách khách hàng Q2/2024.xlsx',
    type: 'xlsx',
    folder: 'Báo cáo & Phân tích',
    department: 'Kinh doanh',
    size: '1.1 MB',
    updatedAt: '25/05/2024 17:30',
    indexStatus: 'indexed',
    accessScope: 'Phòng ban',
  },
  {
    id: 'kd-8',
    name: 'Mẫu hợp đồng dịch vụ.docx',
    type: 'docx',
    folder: 'Biểu mẫu & Mẫu',
    department: 'Pháp chế',
    size: '1.4 MB',
    updatedAt: '24/05/2024 15:18',
    indexStatus: 'processing',
    accessScope: 'Hạn chế',
  },
  {
    id: 'kd-9',
    name: 'Quy định làm việc từ xa.pdf',
    type: 'pdf',
    folder: 'Chính sách & Quy định',
    department: 'Nhân sự',
    size: '912 KB',
    updatedAt: '24/05/2024 09:45',
    indexStatus: 'indexed',
    accessScope: 'Nội bộ',
  },
  {
    id: 'kd-10',
    name: 'Kế hoạch đào tạo nhân sự 2024.docx',
    type: 'docx',
    folder: 'Tài liệu đào tạo',
    department: 'Nhân sự',
    size: '2.7 MB',
    updatedAt: '23/05/2024 11:22',
    indexStatus: 'indexed',
    accessScope: 'Phòng ban',
  },
];

const knowledgeFolders: KnowledgeFolderItem[] = [
  { name: 'Dự án ERP Nexora', count: 128, group: 'mine', isStarred: true },
  { name: 'Phòng PMO', count: 86, group: 'mine' },
  { name: 'Phòng Kế toán', count: 64, group: 'mine', isStarred: true },
  { name: 'Phòng Nhân sự', count: 52, group: 'mine' },
  { name: 'Phòng Kinh doanh', count: 71, group: 'mine' },
  { name: 'Phòng IT', count: 43, group: 'mine' },
  { name: 'Chính sách & Quy định', count: 112, group: 'system' },
  { name: 'Quy trình & Hướng dẫn', count: 218, group: 'system' },
  { name: 'Biểu mẫu & Mẫu', count: 156, group: 'system' },
  { name: 'Tài liệu đào tạo', count: 98, group: 'system' },
  { name: 'Báo cáo & Phân tích', count: 204, group: 'system' },
  { name: 'Khác', count: 16, group: 'system' },
];

export const DataRepoPage: React.FC = () => {
  const { showToast } = useApp();
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [repositoryView, setRepositoryView] = useState<'folders' | 'documents'>('folders');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [indexFilter, setIndexFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);

  // Filtered Docs
  const filteredDocs = useMemo(() => {
    return mockKnowledgeDocs.filter((d) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        d.name.toLowerCase().includes(q) ||
        d.folder.toLowerCase().includes(q) ||
        d.department.toLowerCase().includes(q);

      const matchType = typeFilter === 'all' || d.type === typeFilter;
      const matchDept = deptFilter === 'all' || d.department === deptFilter;
      const matchIndex = indexFilter === 'all' || d.indexStatus === indexFilter;
      const matchFolder =
        selectedFolder === 'all' ||
        (selectedFolder === 'starred' ? d.isStarred :
          selectedFolder === 'recent' ? true : d.folder === selectedFolder);

      return matchSearch && matchType && matchDept && matchIndex && matchFolder;
    }).sort((a, b) => {
      if (selectedFolder === 'recent') return b.updatedAt.localeCompare(a.updatedAt);
      return 0;
    });
  }, [search, typeFilter, deptFilter, indexFilter, selectedFolder]);

  const folderRows = useMemo(() => knowledgeFolders.map((folder) => {
    const folderDocs = mockKnowledgeDocs.filter((doc) => doc.folder === folder.name);
    const latestDoc = [...folderDocs].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
    const hasProcessing = folderDocs.some((doc) => doc.indexStatus === 'processing');
    const hasCheck = folderDocs.some((doc) => doc.indexStatus === 'needs_check');

    return {
      ...folder,
      documentCount: folder.count,
      size: '—',
      manager: latestDoc?.department || '—',
      updatedAt: latestDoc?.updatedAt || '—',
      status: hasCheck ? 'needs_check' : hasProcessing ? 'processing' : 'indexed',
    };
  }), []);

  const filteredFolderRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return folderRows.filter((folder) => !q || folder.name.toLowerCase().includes(q));
  }, [folderRows, search]);

  const isFolderView = repositoryView === 'folders';
  const activeFolder = knowledgeFolders.find((folder) => folder.name === selectedFolder);

  const openFolder = (folderName: string) => {
    setSelectedFolder(folderName);
    setRepositoryView('documents');
    setSelectedDocIds([]);
  };

  const getDocTypeBadge = (type: string) => {
    switch (type) {
      case 'pdf':
        return <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400">PDF</span>;
      case 'docx':
        return <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-500/15 text-blue-600 dark:text-blue-400">DOCX</span>;
      case 'xlsx':
        return <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">XLSX</span>;
      default:
        return <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-500/15 text-slate-600">FILE</span>;
    }
  };

  const getIndexStatusBadge = (status: string) => {
    switch (status) {
      case 'indexed':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Đã lập chỉ mục
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-amber-500 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Đang xử lý
          </span>
        );
      case 'needs_check':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-rose-500 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Cần kiểm tra
          </span>
        );
      default:
        return null;
    }
  };

  const getAccessBadge = (scope: string) => {
    switch (scope) {
      case 'Hạn chế':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
            Hạn chế
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
            {scope}
          </span>
        );
    }
  };

  return (
    <div className="nexora-page flex-1 flex flex-col h-full bg-slate-50/50 dark:bg-black overflow-hidden transition-colors">
      
      {/* Global Header */}
      <Header />

      {/* Page Title & Actions Bar matching 02/03-knowledge-repository.png */}
      <div className="px-4 py-3 bg-white dark:bg-zinc-950 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-4 flex-wrap shrink-0">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 text-[11px] text-slate-400 dark:text-zinc-500">
            <span>Trang chủ</span>
            <ChevronRight className="w-3 h-3" />
            <button
              type="button"
              onClick={() => {
                setSelectedFolder('all');
                setRepositoryView('folders');
              }}
              className={`cursor-pointer hover:text-blue-600 transition-colors ${isFolderView ? 'text-slate-700 dark:text-zinc-300 font-semibold' : ''}`}
            >
              Kho tri thức RAG
            </button>
            {!isFolderView && activeFolder && (
              <>
                <ChevronRight className="w-3 h-3" />
                <span className="text-slate-700 dark:text-zinc-300 font-semibold truncate max-w-[220px]">{activeFolder.name}</span>
              </>
            )}
          </div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-zinc-100 tracking-tight">
            {isFolderView ? 'Kho tri thức RAG' : activeFolder?.name || 'Tất cả tài liệu'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            {isFolderView
              ? 'Quản lý thư mục, tài liệu, quyền truy cập và trạng thái lập chỉ mục'
              : `${activeFolder?.count || filteredDocs.length} tài liệu • Quản lý bởi ${activeFolder ? 'phòng ban' : 'Nexora'}`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => showToast('Tạo thư mục mới', 'info')}
            className="px-3 py-1.5 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 rounded-md text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>Tạo thư mục</span>
          </button>

          <button
            onClick={() => setIsUploadOpen(true)}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Tải tài liệu</span>
          </button>
        </div>
      </div>

      {/* Main 3-Column Content Body */}
      <div className="flex-1 flex overflow-hidden w-full">
        
        {/* ==================================================================== */}
        {/* 1. LEFT COLUMN: Cây Thư Mục (Folder Tree) 240px */}
        {/* ==================================================================== */}
        <aside className="hidden" aria-hidden="true">
          
          {/* Header */}
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-slate-800 dark:text-zinc-200">Thư mục</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => showToast('Thêm thư mục', 'info')}
                className="p-1 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 rounded cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => showToast('Làm mới danh sách thư mục', 'info')}
                className="p-1 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 rounded cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Root Links */}
          <div className="space-y-1">
            <div
              onClick={() => {
                setSelectedFolder('all');
                setRepositoryView('folders');
              }}
              className={`p-2 rounded-lg flex items-center justify-between cursor-pointer transition-colors ${
                selectedFolder === 'all'
                  ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-semibold'
                  : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <Folder className="w-4 h-4 fill-blue-500/20 text-blue-600 dark:text-blue-400" />
                <span>Tất cả tài liệu</span>
              </div>
              <span className="text-[11px] font-mono font-medium">1.248</span>
            </div>

            <div
              onClick={() => {
                setSelectedFolder('starred');
                setRepositoryView('documents');
              }}
              className={`p-2 rounded-lg flex items-center justify-between cursor-pointer transition-colors ${
                selectedFolder === 'starred' && !isFolderView
                  ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-semibold'
                  : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500/20" />
                <span>Yêu thích</span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">32</span>
            </div>

            <div
              onClick={() => {
                setSelectedFolder('recent');
                setRepositoryView('documents');
              }}
              className={`p-2 rounded-lg flex items-center justify-between cursor-pointer transition-colors ${
                selectedFolder === 'recent' && !isFolderView
                  ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-semibold'
                  : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>Gần đây</span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">28</span>
            </div>
          </div>

          {/* Group: Thư mục của tôi */}
          <div className="space-y-1 pt-2">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 px-1">
              <span>Thư mục của tôi</span>
              <span>0</span>
            </div>
            <div className="space-y-0.5">
              {[
                { name: 'Dự án ERP Nexora', count: 128 },
                { name: 'Phòng PMO', count: 86 },
                { name: 'Phòng Kế toán', count: 64 },
                { name: 'Phòng Nhân sự', count: 52 },
                { name: 'Phòng Kinh doanh', count: 71 },
                { name: 'Phòng IT', count: 43 },
              ].map((f) => (
                <div
                  key={f.name}
                  onClick={() => openFolder(f.name)}
                  className={`px-2 py-1.5 rounded-lg flex items-center justify-between text-xs cursor-pointer ${
                    selectedFolder === f.name
                      ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-semibold'
                      : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-900'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Folder className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{f.name}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0">{f.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Group: Thư mục hệ thống */}
          <div className="space-y-1 pt-2">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 px-1">
              <span>Thư mục hệ thống</span>
              <span>0</span>
            </div>
            <div className="space-y-0.5">
              {[
                { name: 'Chính sách & Quy định', count: 112 },
                { name: 'Quy trình & Hướng dẫn', count: 218 },
                { name: 'Biểu mẫu & Mẫu', count: 156 },
                { name: 'Tài liệu đào tạo', count: 98 },
                { name: 'Báo cáo & Phân tích', count: 204 },
                { name: 'Khác', count: 16 },
              ].map((f) => (
                <div
                  key={f.name}
                  onClick={() => openFolder(f.name)}
                  className={`px-2 py-1.5 rounded-lg flex items-center justify-between text-xs cursor-pointer ${
                    selectedFolder === f.name
                      ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-semibold'
                      : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-900'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Folder className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{f.name}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0">{f.count}</span>
                </div>
              ))}
            </div>
          </div>

        </aside>

        {/* ==================================================================== */}
        {/* 2. MIDDLE COLUMN: Bảng Tài Liệu RAG */}
        {/* ==================================================================== */}
        <main className="flex-1 overflow-y-auto p-4 md:p-5 space-y-3.5 min-w-0">

          {/* Repository views matching 02/03-knowledge-repository.png */}
          <div className="flex items-center gap-6 border-b border-slate-200 dark:border-zinc-800 text-xs font-semibold text-slate-500 dark:text-zinc-400">
            <button
              type="button"
              onClick={() => {
                setSelectedFolder('all');
                setRepositoryView('documents');
              }}
              className={`relative -mb-px min-h-10 px-1 transition-colors cursor-pointer ${
                !isFolderView && selectedFolder === 'all' ? 'text-blue-600 dark:text-blue-400' : 'hover:text-slate-800 dark:hover:text-zinc-200'
              }`}
            >
              Tất cả tài liệu
              {!isFolderView && selectedFolder === 'all' && <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-blue-600" />}
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedFolder('all');
                setRepositoryView('folders');
              }}
              className={`relative -mb-px min-h-10 px-1 transition-colors cursor-pointer ${
                isFolderView ? 'text-blue-600 dark:text-blue-400' : 'hover:text-slate-800 dark:hover:text-zinc-200'
              }`}
            >
              Theo thư mục
              {isFolderView && <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-blue-600" />}
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedFolder('all');
                setRepositoryView('documents');
                setIndexFilter('processing');
              }}
              className="relative -mb-px min-h-10 px-1 hover:text-slate-800 dark:hover:text-zinc-200 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Cần xử lý
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedFolder('starred');
                setRepositoryView('documents');
              }}
              className="relative -mb-px min-h-10 px-1 hover:text-slate-800 dark:hover:text-zinc-200 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Star className="w-3.5 h-3.5 text-amber-500" />
              Đã lưu
            </button>
          </div>
          
          {/* Toolbar Filters matching 02/03-knowledge-repository.png */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 flex-1 min-w-[240px]">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  placeholder={isFolderView ? 'Tìm kiếm thư mục...' : 'Tìm tài liệu, nội dung hoặc người cập nhật...'}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs text-slate-800 dark:text-zinc-200 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 shadow-2xs"
                />
              </div>

              {!isFolderView && <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs text-slate-700 dark:text-zinc-300 focus:outline-none cursor-pointer shadow-2xs"
              >
                <option value="all">Loại tài liệu</option>
                <option value="pdf">PDF</option>
                <option value="docx">DOCX</option>
                <option value="xlsx">XLSX</option>
              </select>}

              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="px-3 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs text-slate-700 dark:text-zinc-300 focus:outline-none cursor-pointer shadow-2xs"
              >
                <option value="all">Phòng ban</option>
                <option value="PMO">PMO</option>
                <option value="IT">IT</option>
                <option value="QA">QA</option>
                <option value="Ban Điều hành">Ban Điều hành</option>
                <option value="Kinh doanh">Kinh doanh</option>
                <option value="Nhân sự">Nhân sự</option>
              </select>

              {!isFolderView && <select
                value={indexFilter}
                onChange={(e) => setIndexFilter(e.target.value)}
                className="px-3 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs text-slate-700 dark:text-zinc-300 focus:outline-none cursor-pointer shadow-2xs"
              >
                <option value="all">Trạng thái chỉ mục</option>
                <option value="indexed">Đã lập chỉ mục</option>
                <option value="processing">Đang xử lý</option>
                <option value="needs_check">Cần kiểm tra</option>
              </select>}

              {isFolderView && (
                <>
                  <select className="px-3 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs text-slate-700 dark:text-zinc-300 focus:outline-none cursor-pointer shadow-2xs">
                    <option>Quyền truy cập</option>
                    <option>Phòng ban</option>
                    <option>Nội bộ</option>
                    <option>Hạn chế</option>
                  </select>
                  <select className="px-3 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs text-slate-700 dark:text-zinc-300 focus:outline-none cursor-pointer shadow-2xs">
                    <option>Cập nhật gần nhất</option>
                    <option>Tên thư mục</option>
                    <option>Số tài liệu</option>
                  </select>
                </>
              )}

              <button
                onClick={() => showToast('Mở bộ lọc nâng cao', 'info')}
                className="px-3 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Bộ lọc</span>
              </button>
            </div>
          </div>

          {/* Folder-first / document detail table cards matching 02/03 */}
          {isFolderView ? (
          <CustomTable<any> columns={[]} data={[]} className="bg-white dark:bg-zinc-900">
            <div className="px-4 py-2.5 bg-slate-50/60 dark:bg-zinc-900/60 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between text-xs text-slate-500">
              <span>Hiển thị 1–{filteredFolderRows.length} trong {knowledgeFolders.length}</span>
              <button
                type="button"
                onClick={() => showToast('Chọn cột hiển thị thư mục', 'info')}
                className="px-2.5 py-1.5 border border-slate-200 dark:border-zinc-800 rounded-md bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-300 flex items-center gap-1.5 hover:border-blue-400 transition-colors cursor-pointer"
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Cột hiển thị</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-left text-xs border-collapse">
                <thead className="bg-slate-50/70 dark:bg-zinc-900 text-[11px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider border-b border-slate-200 dark:border-zinc-800">
                  <tr>
                    <th className="w-10 px-4 py-3 text-center"><input type="checkbox" className="rounded border-slate-300 dark:border-zinc-700" /></th>
                    <th className="px-3 py-3">TÊN THƯ MỤC <span className="text-blue-600">↑</span></th>
                    <th className="px-3 py-3">SỐ TÀI LIỆU</th>
                    <th className="px-3 py-3">DUNG LƯỢNG</th>
                    <th className="px-3 py-3">ĐƠN VỊ QUẢN LÝ</th>
                    <th className="px-3 py-3">CẬP NHẬT GẦN NHẤT ↓</th>
                    <th className="px-3 py-3">TÌNH TRẠNG CHỈ MỤC</th>
                    <th className="px-3 py-3">QUYỀN TRUY CẬP</th>
                    <th className="w-10 px-4 py-3 text-right" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                  {filteredFolderRows.map((folder) => (
                    <tr
                      key={folder.name}
                      onDoubleClick={() => openFolder(folder.name)}
                      className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      <td className="px-4 py-3 text-center"><input type="checkbox" className="rounded border-slate-300 dark:border-zinc-700 cursor-pointer" /></td>
                      <td className="px-3 py-3">
                        <button
                          type="button"
                          onClick={() => openFolder(folder.name)}
                          className="flex items-center gap-2.5 text-left font-semibold text-slate-900 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                        >
                          <Folder className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                          <span>{folder.name}</span>
                          {folder.isStarred && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />}
                        </button>
                      </td>
                      <td className="px-3 py-3 text-slate-600 dark:text-zinc-400 font-medium">{folder.documentCount}</td>
                      <td className="px-3 py-3 text-slate-600 dark:text-zinc-400">{folder.size}</td>
                      <td className="px-3 py-3">
                        <span className="inline-flex items-center gap-2 text-slate-700 dark:text-zinc-300">
                          <span className="w-6 h-6 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center text-[10px] font-bold">{folder.manager === '—' ? '—' : folder.manager.slice(0, 2).toUpperCase()}</span>
                          {folder.manager}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-slate-500 dark:text-zinc-400 font-mono text-[11px]">{folder.updatedAt}</td>
                      <td className="px-3 py-3">{getIndexStatusBadge(folder.status)}</td>
                      <td className="px-3 py-3">{getAccessBadge('Phòng ban')}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => openFolder(folder.name)}
                          className="p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded cursor-pointer"
                          title={`Mở thư mục ${folder.name}`}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-4 py-3 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
              <span>Hiển thị 1–{filteredFolderRows.length} trong {knowledgeFolders.length}</span>
              <div className="flex items-center gap-2"><span>Số dòng mỗi trang</span><span className="px-2 py-1 border border-slate-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-900">25⌄</span><button className="p-1 border border-slate-200 dark:border-zinc-800 rounded opacity-40" disabled><ChevronLeft className="w-3.5 h-3.5" /></button><span className="px-2 py-1 rounded bg-blue-600 text-white">1</span><button className="p-1 border border-slate-200 dark:border-zinc-800 rounded"><ChevronRight className="w-3.5 h-3.5" /></button></div>
            </div>
          </CustomTable>
          ) : (
          <CustomTable<any> columns={[]} data={[]} className="bg-white dark:bg-zinc-900">
            
            {/* Table Header Info Row */}
            <div className="px-4 py-2.5 bg-slate-50/60 dark:bg-zinc-900/60 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between text-xs text-slate-500">
              <span>Hiển thị 1–{filteredDocs.length} trong 1.248</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded transition-colors ${
                    viewMode === 'list' ? 'bg-white dark:bg-zinc-800 text-blue-600 shadow-2xs font-bold' : 'text-slate-400'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded transition-colors ${
                    viewMode === 'grid' ? 'bg-white dark:bg-zinc-800 text-blue-600 shadow-2xs font-bold' : 'text-slate-400'
                  }`}
                >
                  <Grid className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Main Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50/70 dark:bg-zinc-900 text-[11px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider border-b border-slate-200 dark:border-zinc-800">
                  <tr>
                    <th className="w-10 px-4 py-3 text-center">
                      <input type="checkbox" className="rounded border-slate-300 dark:border-zinc-700" />
                    </th>
                    <th className="px-3 py-3">TÊN TÀI LIỆU</th>
                    <th className="px-3 py-3">THƯ MỤC</th>
                    <th className="px-3 py-3">PHÒNG BAN</th>
                    <th className="px-3 py-3">KÍCH THƯỚC</th>
                    <th className="px-3 py-3">CẬP NHẬT ⇣</th>
                    <th className="px-3 py-3">CHỈ MỤC</th>
                    <th className="px-3 py-3">QUYỀN TRUY CẬP</th>
                    <th className="w-10 px-4 py-3 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                  {filteredDocs.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition-colors">
                      <td className="px-4 py-3 text-center">
                        <input type="checkbox" className="rounded border-slate-300 dark:border-zinc-700 cursor-pointer" />
                      </td>
                      <td className="px-3 py-3 font-semibold text-slate-900 dark:text-zinc-100">
                        <div className="flex items-center gap-2.5">
                          {getDocTypeBadge(doc.type)}
                          <span
                            onClick={() => showToast(`Xem tài liệu ${doc.name}`, 'info')}
                            className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors truncate max-w-[220px]"
                          >
                            {doc.name}
                          </span>
                          {doc.isStarred && (
                            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-slate-600 dark:text-zinc-400">
                        {doc.folder}
                      </td>
                      <td className="px-3 py-3 text-slate-700 dark:text-zinc-300 font-medium">
                        {doc.department}
                      </td>
                      <td className="px-3 py-3 font-mono text-slate-500 text-[11px]">
                        {doc.size}
                      </td>
                      <td className="px-3 py-3 font-mono text-slate-500 text-[11px]">
                        {doc.updatedAt}
                      </td>
                      <td className="px-3 py-3">
                        {getIndexStatusBadge(doc.indexStatus)}
                      </td>
                      <td className="px-3 py-3">
                        {getAccessBadge(doc.accessScope)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => showToast(`Tùy chọn ${doc.name}`, 'info')}
                          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 rounded cursor-pointer"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="px-4 py-3 bg-white dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span>Số dòng mỗi trang</span>
                <select className="px-2 py-1 border border-slate-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-900 text-xs">
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>
              <div className="flex items-center gap-3">
                <span>1 / 50</span>
                <div className="flex items-center gap-1">
                  <button className="p-1 border border-slate-200 dark:border-zinc-800 rounded hover:bg-slate-50 disabled:opacity-40" disabled>
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button className="p-1 border border-slate-200 dark:border-zinc-800 rounded hover:bg-slate-50">
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

          </CustomTable>
          )}

        </main>

        {/* ==================================================================== */}
        {/* 3. RIGHT COLUMN: Sức Khỏe Kho Tri Thức 300px */}
        {/* ==================================================================== */}
        <aside className="hidden" aria-hidden="true">
          
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs text-slate-800 dark:text-zinc-200">Sức khỏe kho tri thức</h3>
            <span className="text-slate-400">⌃</span>
          </div>

          {/* Storage & Index Metrics */}
          <div className="space-y-4">
            {/* Storage Progress */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-slate-600 dark:text-zinc-400">
                <span>Dung lượng lưu trữ</span>
                <span className="font-bold text-slate-800 dark:text-zinc-200">43%</span>
              </div>
              <p className="font-mono text-[11px] text-slate-400">215.6 GB / 500 GB</p>
              <div className="w-full bg-slate-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full w-[43%]" />
              </div>
            </div>

            {/* Indexed Progress */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-slate-600 dark:text-zinc-400">
                <span>Tài liệu đã lập chỉ mục</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">85%</span>
              </div>
              <p className="font-mono text-[11px] text-slate-400">1.062 / 1.248</p>
              <div className="w-full bg-slate-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[85%]" />
              </div>
            </div>

            {/* Error Progress */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-slate-600 dark:text-zinc-400">
                <span>Tài liệu lỗi chỉ mục</span>
                <span className="font-bold text-rose-500">1%</span>
              </div>
              <p className="font-mono text-[11px] text-slate-400">12</p>
              <div className="w-full bg-slate-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full w-[1%]" />
              </div>
            </div>
          </div>

          {/* Kết nối nguồn dữ liệu */}
          <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 dark:text-zinc-200">Kết nối nguồn dữ liệu</span>
              <button
                onClick={() => showToast('Mở chi tiết kết nối dữ liệu', 'info')}
                className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                Xem chi tiết
              </button>
            </div>
            <p className="text-[11px] text-slate-500">5 / 6 kết nối hoạt động</p>
            
            {/* Cloud Storage Source Icons */}
            <div className="flex items-center gap-2 pt-1">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                S
              </div>
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 flex items-center justify-center">
                <Database className="w-3.5 h-3.5" />
              </div>
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 flex items-center justify-center font-bold text-xs">
                G
              </div>
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                D
              </div>
              <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400 flex items-center justify-center font-bold text-xs">
                O
              </div>
              <button
                onClick={() => showToast('Thêm kết nối kho lưu trữ đám mây', 'info')}
                className="w-7 h-7 rounded-lg border border-dashed border-slate-300 dark:border-zinc-700 text-slate-400 hover:text-slate-600 flex items-center justify-center cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Tải lên gần đây */}
          <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 dark:text-zinc-200">Tải lên gần đây</span>
              <button
                onClick={() => showToast('Mở toàn bộ tài liệu gần đây', 'info')}
                className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                Xem tất cả
              </button>
            </div>

            <div className="space-y-2 text-[11px]">
              <div className="flex items-center justify-between gap-2 p-2 bg-slate-50/70 dark:bg-zinc-900 rounded-lg">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-800 dark:text-zinc-200 truncate">Quy trình mua hàng 2024.pdf</p>
                  <span className="text-[10px] text-slate-400">28/05/2024 10:24 • PMO</span>
                </div>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              </div>

              <div className="flex items-center justify-between gap-2 p-2 bg-slate-50/70 dark:bg-zinc-900 rounded-lg">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-800 dark:text-zinc-200 truncate">Báo cáo tiến độ ERP — Tuần 21.docx</p>
                  <span className="text-[10px] text-slate-400">28/05/2024 09:12 • PMO</span>
                </div>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              </div>

              <div className="flex items-center justify-between gap-2 p-2 bg-slate-50/70 dark:bg-zinc-900 rounded-lg">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-800 dark:text-zinc-200 truncate">Chính sách bảo mật dữ liệu.pdf</p>
                  <span className="text-[10px] text-slate-400">27/05/2024 16:45 • IT</span>
                </div>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              </div>
            </div>
          </div>

          {/* Kiểm tra lỗi chỉ mục CTA */}
          <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/80 space-y-2">
            <span className="font-bold text-slate-800 dark:text-zinc-200 block">Kiểm tra lỗi chỉ mục</span>
            <p className="text-[11px] text-slate-500">Phát hiện và đề xuất cách khắc phục lỗi chỉ mục.</p>
            <button
              onClick={() => showToast('Bắt đầu quét & kiểm tra lỗi chỉ mục Vector DB', 'success')}
              className="w-full py-2 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Kiểm tra ngay</span>
            </button>
          </div>

        </aside>

        {/* ==================================================================== */}
        {/* 4. RIGHT COLUMN: Hoạt động matching 02/03-knowledge-repository.png */}
        {/* ==================================================================== */}
        <aside className="w-72 xl:w-80 border-l border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col h-full shrink-0 overflow-y-auto p-4 space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900 dark:text-zinc-100">Hoạt động</h3>
            <button
              type="button"
              onClick={() => showToast('Đóng bảng hoạt động', 'info')}
              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 rounded cursor-pointer"
              aria-label="Đóng bảng hoạt động"
            >
              <span className="text-lg leading-none">×</span>
            </button>
          </div>

          <div className="flex items-center gap-6 border-b border-slate-200 dark:border-zinc-800 text-xs font-semibold">
            <button type="button" className="relative -mb-px min-h-9 text-blue-600 dark:text-blue-400 cursor-default">
              Vấn đề lập chỉ mục
              <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-blue-600" />
            </button>
            <button
              type="button"
              onClick={() => showToast('Hiển thị tài liệu tải lên gần đây', 'info')}
              className="min-h-9 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 cursor-pointer"
            >
              Tải lên gần đây
            </button>
          </div>

          <div className="divide-y divide-slate-200 dark:divide-zinc-800">
            {[
              { tone: 'error', title: 'Không trích xuất được nội dung', file: 'Mẫu hợp đồng dịch vụ.docx', detail: 'Lỗi định dạng tệp', date: '03/09/2026 15:18' },
              { tone: 'warning', title: 'Vượt quá giới hạn kích thước', file: 'Tài liệu hướng dẫn.pptx', detail: 'Tệp 120 MB (giới hạn 100 MB)', date: '01/09/2026 14:32' },
              { tone: 'warning', title: 'Không hỗ trợ định dạng tệp', file: 'Dữ liệu khoa học.rar', detail: 'Định dạng .rar chưa được hỗ trợ', date: '30/08/2026 09:15' },
              { tone: 'error', title: 'Lỗi xử lý văn bản', file: 'Báo cáo tài chính 2023.pdf', detail: 'Không đọc được nội dung', date: '28/08/2026 11:03' },
            ].map((issue) => (
              <div key={`${issue.title}-${issue.file}`} className="py-3 flex items-start gap-2.5">
                <span className={`w-5 h-5 rounded-full shrink-0 flex items-center justify-center text-white font-bold ${issue.tone === 'error' ? 'bg-rose-500' : 'bg-amber-500'}`}>
                  {issue.tone === 'error' ? '×' : '!'}
                </span>
                <div className="min-w-0 space-y-0.5">
                  <p className="font-bold text-slate-800 dark:text-zinc-200 leading-snug">{issue.title}</p>
                  <p className="text-slate-600 dark:text-zinc-400 truncate">{issue.file}</p>
                  <p className="text-slate-400 dark:text-zinc-500">{issue.detail}</p>
                  <p className="text-slate-400 dark:text-zinc-500">{issue.date}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-slate-900 dark:text-zinc-100">Tải lên gần đây</h4>
              <button
                type="button"
                onClick={() => showToast('Mở toàn bộ tài liệu gần đây', 'info')}
                className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                Xem tất cả
              </button>
            </div>
            <div className="space-y-2">
              {mockKnowledgeDocs.slice(0, 4).map((doc) => (
                <div key={doc.id} className="flex items-center gap-2 p-2 bg-slate-50/70 dark:bg-zinc-900 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-800 dark:text-zinc-200 truncate">{doc.name}</p>
                    <span className="text-[10px] text-slate-400">{doc.updatedAt} • {doc.department}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => showToast('Mở toàn bộ hoạt động kho tri thức', 'info')}
            className="pt-2 text-left text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
          >
            Xem tất cả hoạt động <span className="ml-1">→</span>
          </button>
        </aside>

      </div>

      {/* Upload Modal */}
      <UploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
    </div>
  );
};

export default DataRepoPage;

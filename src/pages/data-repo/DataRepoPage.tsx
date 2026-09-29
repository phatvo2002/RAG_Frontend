import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Header } from '@/components/header';
import { useApp } from '@/context/AppContext';
import { UploadModal } from './UploadModal';
import { FolderModal } from './FolderModal';
import { FolderDetailPanel } from './FolderDetailPanel';
import { useDepartmentsQuery } from '@/api/departments.api';
import { FolderItem, useDocumentFoldersQuery } from '@/api/document-folders.api';
import { DocumentListItem, DocumentUploadResponse, useDeleteDocumentMutation, useDocumentsQuery } from '@/api/documents.api';
import { CustomTable } from '@/components/customTable';
import { ConfirmModal } from '@/components/disclosure';
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
  Trash2,
} from 'lucide-react';

interface FolderTreeNode extends FolderItem {
  children: FolderTreeNode[];
}

const buildFolderTree = (folders: FolderItem[]): FolderTreeNode[] => {
  const byId = new Map(folders.map((folder) => [folder.id, folder]));
  const childrenByParent = new Map<string, FolderItem[]>();
  folders.forEach((folder) => {
    if (!folder.parentFolderId || !byId.has(folder.parentFolderId)) return;
    const children = childrenByParent.get(folder.parentFolderId) || [];
    children.push(folder);
    childrenByParent.set(folder.parentFolderId, children);
  });

  const visited = new Set<string>();
  const buildNode = (folder: FolderItem, ancestors: Set<string>): FolderTreeNode => {
    visited.add(folder.id);
    const nextAncestors = new Set(ancestors).add(folder.id);
    const children = (childrenByParent.get(folder.id) || [])
      .filter((child) => !nextAncestors.has(child.id))
      .map((child) => buildNode(child, nextAncestors));
    return { ...folder, children };
  };

  const roots = folders.filter((folder) => !folder.parentFolderId || !byId.has(folder.parentFolderId));
  const tree = roots.map((folder) => buildNode(folder, new Set<string>()));
  folders.forEach((folder) => {
    if (!visited.has(folder.id)) tree.push(buildNode(folder, new Set<string>()));
  });
  return tree;
};

export const DataRepoPage: React.FC = () => {
  const { showToast, currentUser } = useApp();
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [repositoryView, setRepositoryView] = useState<'folders' | 'documents'>('folders');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [indexFilter, setIndexFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [isActivityOpen, setIsActivityOpen] = useState(false);
  const [detailFolderId, setDetailFolderId] = useState<string | null>(null);
  const [folderDepartmentFilter, setFolderDepartmentFilter] = useState('all');
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [documentToDelete, setDocumentToDelete] = useState<DocumentListItem | null>(null);
  const [documentPage, setDocumentPage] = useState(1);
  const [documentPageSize, setDocumentPageSize] = useState(25);
  const deleteDocumentMutation = useDeleteDocumentMutation();

  const { data: departments = [] } = useDepartmentsQuery();
  const {
    data: folders = [],
    isLoading: isFoldersLoading,
    isError: isFoldersError,
    error: foldersError,
    refetch: refetchFolders,
  } = useDocumentFoldersQuery(folderDepartmentFilter === 'all' ? undefined : folderDepartmentFilter);

  const activeFolder = folders.find((folder) => folder.id === selectedFolder);
  const isFolderView = repositoryView === 'folders';
  const folderTree = useMemo(() => buildFolderTree(folders), [folders]);

  const documentQueryParams = useMemo(() => ({
    folderId: selectedFolder,
    page: documentPage,
    pageSize: documentPageSize,
    search,
    fileType: typeFilter,
    processingStatus: indexFilter === 'all' ? undefined : indexFilter,
    departmentId: deptFilter === 'all' ? undefined : deptFilter,
  }), [selectedFolder, documentPage, documentPageSize, search, typeFilter, indexFilter, deptFilter]);

  const {
    data: documentResult,
    isLoading: isDocumentsLoading,
    isFetching: isDocumentsFetching,
    isError: isDocumentsError,
    error: documentsError,
    refetch: refetchDocuments,
  } = useDocumentsQuery(documentQueryParams, !isFolderView && Boolean(activeFolder));

  const documentItems = documentResult?.items ?? [];
  const documentStart = documentResult && documentResult.totalCount > 0
    ? (documentResult.page - 1) * documentResult.pageSize + 1
    : 0;
  const documentEnd = documentResult
    ? Math.min(documentResult.page * documentResult.pageSize, documentResult.totalCount)
    : 0;

  useEffect(() => {
    setDocumentPage(1);
  }, [selectedFolder, search, typeFilter, deptFilter, indexFilter, documentPageSize]);

  const handleUploaded = useCallback(
    (_receipt: DocumentUploadResponse, file: File, folder: FolderItem, _accessScope: string) => {
      setSelectedFolder(folder.id);
      setRepositoryView('documents');
      setDetailFolderId(null);
      showToast(`Đã tải ${file.name} lên máy chủ. Tài liệu đang được Index RAG.`, 'success');
    },
    [showToast]
  );

  const handleDeleteDocument = async () => {
    if (!documentToDelete) return;

    try {
      await deleteDocumentMutation.mutateAsync(documentToDelete.documentId);
      showToast(`Đã xóa tài liệu ${documentToDelete.originalFileName || documentToDelete.title}.`, 'success');
      setDocumentToDelete(null);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Không thể xóa tài liệu.', 'error');
    }
  };

  const folderRows = useMemo(() => folders.map((folder) => ({
    ...folder,
    departmentName: departments.find((department) => department.id === folder.departmentId)?.name || '—',
    latestUpdatedAt: folder.latestDocumentUpdatedAt || folder.updatedAt || folder.createdAt || '',
  })), [folders, departments]);

  const filteredFolderRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return folderRows.filter((folder) => !q || folder.name.toLowerCase().includes(q));
  }, [folderRows, search]);

  const openFolder = (folderId: string) => {
    setSelectedFolder(folderId);
    setRepositoryView('documents');
    setSelectedDocIds([]);
    setDetailFolderId(folderId);
  };

  const getDocTypeBadge = (type: string) => {
    switch (type) {
      case 'pdf':
        return <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400">PDF</span>;
      case 'docx':
        return <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-500/15 text-blue-600 dark:text-blue-400">DOCX</span>;
      case 'txt':
        return <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-500/15 text-slate-600 dark:text-zinc-400">TXT</span>;
      case 'md':
        return <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-violet-500/15 text-violet-600 dark:text-violet-400">MD</span>;
      default:
        return <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-500/15 text-slate-600">FILE</span>;
    }
  };

  const getIndexStatusBadge = (status: string) => {
    const normalizedStatus = status.toUpperCase() === 'READY'
      ? 'indexed'
      : status.toUpperCase() === 'FAILED'
        ? 'needs_check'
        : 'processing';

    switch (normalizedStatus) {
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

  const formatDocumentSize = (sizeBytes: number) => {
    if (!sizeBytes) return '—';
    if (sizeBytes < 1024 * 1024) return `${Math.max(1, Math.round(sizeBytes / 1024))} KB`;
    return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatFolderSize = (sizeBytes: number) => {
    if (sizeBytes === 0) return '0 B';
    if (sizeBytes < 1024 * 1024) return `${Math.max(1, Math.round(sizeBytes / 1024))} KB`;
    return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDocumentDate = (value: string) => {
    if (!value) return '—';
    return new Date(value).toLocaleString('vi-VN');
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
              ? `${folders.length} thư mục • ${folders.reduce((total, folder) => total + (folder.documentCount || 0), 0)} tài liệu • ${folders.reduce((total, folder) => total + (folder.failedCount || 0), 0)} cần kiểm tra`
              : `${activeFolder ? (documentResult?.totalCount ?? 0) : 0} tài liệu • Quản lý bởi ${activeFolder ? 'phòng ban' : 'Nexora'}`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFolderModalOpen(true)}
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
        <aside className="hidden w-60 shrink-0 flex-col overflow-y-auto border-r border-slate-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 lg:flex">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">Cây thư mục</span>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => setIsFolderModalOpen(true)} className="btn btn-ghost btn-xs btn-square" title="Tạo folder"><Plus className="h-3.5 w-3.5" /></button>
              <button type="button" onClick={() => refetchFolders()} className="btn btn-ghost btn-xs btn-square" title="Làm mới"><RefreshCw className={`h-3.5 w-3.5 ${isFoldersLoading ? 'animate-spin' : ''}`} /></button>
            </div>
          </div>
          <button
            type="button"
            onClick={() => { setSelectedFolder('all'); setRepositoryView('folders'); setDetailFolderId(null); }}
            className={`mb-2 flex items-center gap-2 rounded-lg px-2 py-2 text-left text-xs ${selectedFolder === 'all' && isFolderView ? 'bg-blue-50 font-semibold text-blue-600 dark:bg-blue-950/50 dark:text-blue-400' : 'text-slate-600 hover:bg-slate-50 dark:text-zinc-400 dark:hover:bg-zinc-900'}`}
          >
            <Folder className="h-4 w-4 text-blue-600" /> Tất cả folder
            <span className="ml-auto font-mono text-[10px]">{folders.length}</span>
          </button>
          <div className="space-y-0.5">
            {folderTree.map((node) => {
              const renderNode = (item: FolderTreeNode, depth: number): React.ReactNode => (
                <React.Fragment key={item.id}>
                  <button
                    type="button"
                    onClick={() => openFolder(item.id)}
                    className={`flex w-full items-center gap-1.5 rounded-lg py-1.5 pr-1 text-left text-xs ${selectedFolder === item.id ? 'bg-blue-50 font-semibold text-blue-600 dark:bg-blue-950/50 dark:text-blue-400' : 'text-slate-600 hover:bg-slate-50 dark:text-zinc-400 dark:hover:bg-zinc-900'}`}
                    style={{ paddingLeft: `${8 + depth * 14}px` }}
                  >
                    <Folder className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    <span className="truncate">{item.name}</span>
                  </button>
                  {item.children.map((child) => renderNode(child, depth + 1))}
                </React.Fragment>
              );
              return renderNode(node, 0);
            })}
            {!isFoldersLoading && folderTree.length === 0 && <p className="px-2 py-4 text-center text-[11px] text-slate-400">Chưa có folder</p>}
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
                <option value="txt">TXT</option>
                <option value="md">MD</option>
              </select>}

              {isFolderView ? (
                <select
                  value={folderDepartmentFilter}
                  onChange={(e) => setFolderDepartmentFilter(e.target.value)}
                  className="px-3 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs text-slate-700 dark:text-zinc-300 focus:outline-none cursor-pointer shadow-2xs"
                >
                  <option value="all">Phòng ban</option>
                  {departments.map((department) => (
                    <option key={department.id} value={department.id}>{department.name}</option>
                  ))}
                </select>
              ) : (
                <select
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                  className="px-3 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs text-slate-700 dark:text-zinc-300 focus:outline-none cursor-pointer shadow-2xs"
                >
                  <option value="all">Phòng ban</option>
                  {departments.map((department) => (
                    <option key={department.id} value={department.id}>{department.name}</option>
                  ))}
                </select>
              )}

              {!isFolderView && <select
                value={indexFilter}
                onChange={(e) => setIndexFilter(e.target.value)}
                className="px-3 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs text-slate-700 dark:text-zinc-300 focus:outline-none cursor-pointer shadow-2xs"
              >
                <option value="all">Trạng thái chỉ mục</option>
                <option value="READY">Đã lập chỉ mục</option>
                <option value="PROCESSING">Đang xử lý</option>
                <option value="QUEUED">Đang chờ xử lý</option>
                <option value="FAILED">Cần kiểm tra</option>
              </select>}

              {!isFolderView && <button
                onClick={() => showToast('Mở bộ lọc nâng cao', 'info')}
                className="px-3 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Bộ lọc</span>
              </button>}
            </div>
          </div>

          {/* Folder-first / document detail table cards matching 02/03 */}
          {isFolderView ? (
          <CustomTable<any> columns={[]} data={[]} className="bg-white dark:bg-zinc-900">
            <div className="px-4 py-2.5 bg-slate-50/60 dark:bg-zinc-900/60 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between text-xs text-slate-500">
              <span>{isFoldersLoading ? 'Đang tải folder...' : `Hiển thị 1–${filteredFolderRows.length} trong ${folders.length}`}</span>
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
              <table className="w-full min-w-[760px] text-left text-xs border-collapse">
                <thead className="bg-slate-50/70 dark:bg-zinc-900 text-[11px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider border-b border-slate-200 dark:border-zinc-800">
                  <tr>
                    <th className="w-10 px-4 py-3 text-center"><input type="checkbox" className="rounded border-slate-300 dark:border-zinc-700" /></th>
                    <th className="px-3 py-3">TÊN THƯ MỤC <span className="text-blue-600">↑</span></th>
                    <th className="w-28 px-3 py-3">SỐ TÀI LIỆU</th>
                    <th className="w-28 px-3 py-3">DUNG LƯỢNG</th>
                    <th className="w-40 px-3 py-3">PHÒNG BAN</th>
                    <th className="w-40 px-3 py-3">CẬP NHẬT GẦN NHẤT</th>
                    <th className="min-w-52 px-3 py-3">TRẠNG THÁI TÀI LIỆU</th>
                    <th className="w-10 px-4 py-3 text-right" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                  {isFoldersError ? (
                    <tr>
                      <td colSpan={8} className="py-10 text-center text-rose-600 dark:text-rose-400">
                        <div className="mb-2 flex items-center justify-center gap-2"><AlertCircle className="h-4 w-4" /> Không thể tải danh sách folder.</div>
                        <p className="mb-3 text-[11px] text-slate-400">{(foldersError as Error)?.message || 'Vui lòng kiểm tra kết nối API.'}</p>
                        <button type="button" onClick={() => refetchFolders()} className="btn btn-xs btn-outline">Thử lại</button>
                      </td>
                    </tr>
                  ) : isFoldersLoading ? (
                    <tr><td colSpan={8} className="py-10 text-center text-slate-400"><RefreshCw className="mx-auto mb-2 h-5 w-5 animate-spin text-blue-500" />Đang tải danh sách folder...</td></tr>
                  ) : filteredFolderRows.length === 0 ? (
                    <tr><td colSpan={8} className="py-10 text-center text-slate-400">Không tìm thấy folder phù hợp.</td></tr>
                  ) : filteredFolderRows.map((folder) => (
                    <tr
                      key={folder.id}
                      onClick={() => { setDetailFolderId(folder.id); openFolder(folder.id); }}
                      className={`cursor-pointer transition-colors hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 ${detailFolderId === folder.id ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''}`}
                    >
                      <td className="px-4 py-3 text-center"><input type="checkbox" className="rounded border-slate-300 dark:border-zinc-700 cursor-pointer" /></td>
                      <td className="px-3 py-3">
                        <button
                          type="button"
                          onClick={(event) => { event.stopPropagation(); openFolder(folder.id); }}
                          className="flex items-center gap-2.5 text-left font-semibold text-slate-900 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                        >
                          <Folder className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                          <span>{folder.name}</span>
                        </button>
                      </td>
                      <td className="px-3 py-3 text-slate-600 dark:text-zinc-400 font-medium">{folder.documentCount}</td>
                      <td className="px-3 py-3 whitespace-nowrap text-slate-600 dark:text-zinc-400">{formatFolderSize(folder.totalSizeBytes || 0)}</td>
                      <td className="px-3 py-3 text-slate-700 dark:text-zinc-300">{folder.departmentName}</td>
                      <td className="px-3 py-3 whitespace-nowrap text-slate-500 dark:text-zinc-400 text-[11px]">{formatDocumentDate(folder.latestUpdatedAt)}</td>
                      <td className="px-3 py-3">
                        {folder.documentCount === 0 ? (
                          <span className="text-slate-400 dark:text-zinc-500">Chưa có tài liệu</span>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {(folder.indexedCount ?? 0) > 0 && <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-medium text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">{folder.indexedCount} đã lập chỉ mục</span>}
                            {(folder.processingCount ?? 0) > 0 && <span className="rounded-full bg-amber-50 px-2 py-1 text-[10px] font-medium text-amber-700 dark:bg-amber-950/50 dark:text-amber-400">{folder.processingCount} đang xử lý</span>}
                            {(folder.failedCount ?? 0) > 0 && <span className="rounded-full bg-rose-50 px-2 py-1 text-[10px] font-medium text-rose-700 dark:bg-rose-950/50 dark:text-rose-400">{folder.failedCount} cần kiểm tra</span>}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={(event) => { event.stopPropagation(); openFolder(folder.id); }}
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
              <span>{isFoldersLoading ? 'Đang tải folder...' : `Hiển thị 1–${filteredFolderRows.length} trong ${folders.length}`}</span>
              <div className="flex items-center gap-2"><span>Số dòng mỗi trang</span><span className="px-2 py-1 border border-slate-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-900">25⌄</span><button className="p-1 border border-slate-200 dark:border-zinc-800 rounded opacity-40" disabled><ChevronLeft className="w-3.5 h-3.5" /></button><span className="px-2 py-1 rounded bg-blue-600 text-white">1</span><button className="p-1 border border-slate-200 dark:border-zinc-800 rounded"><ChevronRight className="w-3.5 h-3.5" /></button></div>
            </div>
          </CustomTable>
          ) : (
          <CustomTable<any> columns={[]} data={[]} className="bg-white dark:bg-zinc-900">
            
            {/* Table Header Info Row */}
            <div className="px-4 py-2.5 bg-slate-50/60 dark:bg-zinc-900/60 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between text-xs text-slate-500">
              <span>
                {isDocumentsLoading ? 'Đang tải tài liệu...' : `Hiển thị ${documentStart}–${documentEnd} trong ${documentResult?.totalCount ?? 0}`}
                {isDocumentsFetching && !isDocumentsLoading ? ' · Đang cập nhật...' : ''}
              </span>
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
                  {isDocumentsError ? (
                    <tr>
                      <td colSpan={9} className="py-10 text-center text-rose-600 dark:text-rose-400">
                        <div className="mb-2 flex items-center justify-center gap-2"><AlertCircle className="h-4 w-4" /> Không thể tải danh sách tài liệu.</div>
                        <p className="mb-3 text-[11px] text-slate-400">{(documentsError as Error)?.message || 'Vui lòng kiểm tra kết nối API.'}</p>
                        <button type="button" onClick={() => refetchDocuments()} className="btn btn-xs btn-outline">Thử lại</button>
                      </td>
                    </tr>
                  ) : isDocumentsLoading ? (
                    <tr><td colSpan={9} className="py-10 text-center text-slate-400"><RefreshCw className="mx-auto mb-2 h-5 w-5 animate-spin text-blue-500" />Đang tải danh sách tài liệu...</td></tr>
                  ) : !activeFolder ? (
                    <tr><td colSpan={9} className="py-10 text-center text-slate-400">Hãy chọn một folder để xem tài liệu.</td></tr>
                  ) : documentItems.length === 0 ? (
                    <tr><td colSpan={9} className="py-10 text-center text-slate-400">Folder này chưa có tài liệu phù hợp.</td></tr>
                  ) : documentItems.map((doc) => {
                    const documentName = doc.originalFileName || doc.title;
                    const extension = documentName.split('.').pop()?.toLowerCase() || '';
                    const departmentName = departments.find((department) => department.id === doc.departmentId)?.name || '—';
                    return (
                      <tr key={doc.documentId} className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition-colors">
                        <td className="px-4 py-3 text-center">
                          <input type="checkbox" className="rounded border-slate-300 dark:border-zinc-700 cursor-pointer" />
                        </td>
                        <td className="px-3 py-3 font-semibold text-slate-900 dark:text-zinc-100">
                          <div className="flex items-center gap-2.5">
                            {getDocTypeBadge(extension)}
                            <span
                              onClick={() => showToast(`Xem tài liệu ${documentName}`, 'info')}
                              className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors truncate max-w-[220px]"
                            >
                              {documentName}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-slate-600 dark:text-zinc-400">{doc.folderName}</td>
                        <td className="px-3 py-3 text-slate-700 dark:text-zinc-300 font-medium">{departmentName}</td>
                        <td className="px-3 py-3 font-mono text-slate-500 text-[11px]">{formatDocumentSize(doc.sizeBytes)}</td>
                        <td className="px-3 py-3 font-mono text-slate-500 text-[11px]">{formatDocumentDate(doc.updatedAt)}</td>
                        <td className="px-3 py-3">{getIndexStatusBadge(doc.processingStatus)}</td>
                        <td className="px-3 py-3 text-slate-400 dark:text-zinc-500">—</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => setDocumentToDelete(doc)}
                            disabled={deleteDocumentMutation.isPending}
                            aria-label={`Xóa tài liệu ${documentName}`}
                            title="Xóa tài liệu"
                            className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded cursor-pointer disabled:opacity-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="px-4 py-3 bg-white dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span>Số dòng mỗi trang</span>
                <select
                  value={documentPageSize}
                  onChange={(event) => setDocumentPageSize(Number(event.target.value))}
                  className="px-2 py-1 border border-slate-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-900 text-xs"
                >
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>
              <div className="flex items-center gap-3">
                <span>{documentResult?.page ?? 1} / {documentResult?.totalPages ?? 0}</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setDocumentPage((page) => Math.max(1, page - 1))}
                    className="p-1 border border-slate-200 dark:border-zinc-800 rounded hover:bg-slate-50 disabled:opacity-40"
                    disabled={!documentResult || documentResult.page <= 1 || isDocumentsFetching}
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDocumentPage((page) => Math.min(documentResult?.totalPages ?? page, page + 1))}
                    className="p-1 border border-slate-200 dark:border-zinc-800 rounded hover:bg-slate-50 disabled:opacity-40"
                    disabled={!documentResult || documentResult.page >= documentResult.totalPages || isDocumentsFetching}
                  >
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
        {isActivityOpen ? (
        <aside className="w-72 xl:w-80 border-l border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col h-full shrink-0 overflow-y-auto p-4 space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900 dark:text-zinc-100">Hoạt động</h3>
            <button
              type="button"
              onClick={() => setIsActivityOpen(false)}
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
              {documentItems.slice(0, 4).map((doc) => {
                const documentName = doc.originalFileName || doc.title;
                return (
                <div key={doc.documentId} className="flex items-center gap-2 p-2 bg-slate-50/70 dark:bg-zinc-900 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-800 dark:text-zinc-200 truncate">{documentName}</p>
                    <span className="text-[10px] text-slate-400">{formatDocumentDate(doc.updatedAt)} • {doc.processingStatus}</span>
                  </div>
                </div>
                );
              })}
              {documentItems.length === 0 && <p className="py-3 text-xs text-slate-400">Chưa có tài liệu trong folder hiện tại.</p>}
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
        ) : (
          <aside className="flex w-10 shrink-0 items-start justify-center border-l border-slate-200 bg-white pt-4 dark:border-zinc-800 dark:bg-zinc-950">
            <button
              type="button"
              onClick={() => setIsActivityOpen(true)}
              className="btn btn-ghost btn-sm btn-square text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200"
              aria-label="Mở bảng hoạt động"
              title="Mở bảng hoạt động"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </aside>
        )}

      </div>

      <FolderModal
        isOpen={isFolderModalOpen}
        onClose={() => setIsFolderModalOpen(false)}
        folders={folders}
        defaultDepartmentId={activeFolder?.departmentId || (folderDepartmentFilter === 'all' ? undefined : folderDepartmentFilter)}
        defaultParentFolderId={activeFolder?.id || null}
      />

      {detailFolderId && folders.some((folder) => folder.id === detailFolderId) && (
        <FolderDetailPanel
          folder={folders.find((folder) => folder.id === detailFolderId) as FolderItem}
          folders={folders}
          currentUser={currentUser}
          onClose={() => setDetailFolderId(null)}
          onDeleted={() => {
            setDetailFolderId(null);
            setSelectedFolder('all');
            setRepositoryView('folders');
          }}
        />
      )}

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        defaultFolderId={activeFolder?.id}
        onUploaded={handleUploaded}
      />

      <ConfirmModal
        isOpen={Boolean(documentToDelete)}
        onClose={() => setDocumentToDelete(null)}
        onConfirm={handleDeleteDocument}
        isLoading={deleteDocumentMutation.isPending}
        title="Xóa tài liệu"
        message={documentToDelete
          ? `Bạn có chắc muốn xóa "${documentToDelete.originalFileName || documentToDelete.title}"? File gốc, nội dung các đoạn và vector RAG sẽ bị xóa.`
          : ''}
        confirmText="Xóa tài liệu"
      />
    </div>
  );
};

export default DataRepoPage;

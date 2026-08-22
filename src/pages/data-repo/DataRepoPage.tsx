import React, { useState } from 'react';
import { Header } from '@/components/header';
import { useApp } from '@/context/AppContext';
import { Badge } from '@/components/button';
import { CustomTable, Column } from '@/components/customTable';
import { UploadModal } from './UploadModal';
import { DocumentItem } from '@/types';
import {
  Upload,
  Search,
  Filter,
  List,
  Grid,
  Folder,
  MoreHorizontal,
  FileText
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { mockFolders, mockRecentUploads, mockSharedDocuments } from '@/data/mockData';

export const DataRepoPage: React.FC = () => {
  const { documents, showToast } = useApp();
  const [activeTab, setActiveTab] = useState<'all' | 'proj' | 'dept' | 'shared' | 'recent'>('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [search, setSearch] = useState('');
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const filteredDocs = documents.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    (d.updatedBy || d.uploadedBy || '').toLowerCase().includes(search.toLowerCase())
  );

  const pieData = [
    { name: 'Đã sử dụng', value: 13.6, color: '#2563eb' },
    { name: 'Còn trống', value: 6.4, color: '#3f3f46' }
  ];

  // Cấu hình Column cho CustomTable
  const docColumns: Column<DocumentItem>[] = [
    {
      header: 'Tên tài liệu',
      render: (doc) => {
        const fileTypeColor =
          doc.type === 'pdf'
            ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
            : doc.type === 'xlsx'
            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
            : 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300';

        return (
          <div className="flex items-center gap-3">
            <span className={`p-1.5 rounded text-[10px] font-bold uppercase shrink-0 ${fileTypeColor}`}>
              {doc.type}
            </span>
            <span className="font-semibold text-slate-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
              {doc.name}
            </span>
          </div>
        );
      },
    },
    {
      header: 'Quyền truy cập',
      render: (doc) => (
        <Badge variant="secondary">{doc.accessScope || doc.department || 'Chung'}</Badge>
      ),
    },
    {
      header: 'Cập nhật',
      render: (doc) => (
        <div>
          <p className="text-slate-800 dark:text-zinc-200 font-medium">{doc.updatedAt || doc.uploadedAt}</p>
          <p className="text-[10px] text-slate-400 dark:text-zinc-500">{doc.updatedBy || doc.uploadedBy}</p>
        </div>
      ),
    },
    {
      header: 'Kích thước',
      render: (doc) => <span className="font-medium text-slate-600 dark:text-zinc-300">{doc.size || '1.5 MB'}</span>,
    },
    {
      header: 'Thao tác',
      className: 'text-right',
      render: (doc) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            showToast(`Tùy chọn ${doc.name}`, 'info');
          }}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 p-1 cursor-pointer"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-black transition-colors">
      <Header title="Kho dữ liệu" subTitle="Quản lý tài liệu và thư mục doanh nghiệp" />

      <div className="flex-1 flex overflow-hidden">
        {/* Main Content Column */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 w-full">
          {/* Header Action & Tabs Row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-3">
            <div className="flex items-center gap-6 overflow-x-auto text-xs font-semibold">
              {[
                { id: 'all', label: 'Tất cả tài liệu' },
                { id: 'proj', label: 'Dự án' },
                { id: 'dept', label: 'Phòng ban' },
                { id: 'shared', label: 'Được chia sẻ' },
                { id: 'recent', label: 'Gần đây' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`pb-3 relative transition-colors cursor-pointer ${
                    activeTab === tab.id
                      ? 'text-blue-600 dark:text-blue-400 font-bold'
                      : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
                  }`}
                >
                  <span>{tab.label}</span>
                  {activeTab === tab.id && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsUploadOpen(true)}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs rounded shadow-2xs shadow-blue-500/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Tải tài liệu lên</span>
            </button>
          </div>

          {/* Folder Categories Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wider">
                Thư mục ({mockFolders.length})
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {mockFolders.map((folder) => (
                <div
                  key={folder.id}
                  className="bg-white dark:bg-zinc-900 p-4 rounded-lg border border-slate-200/80 dark:border-zinc-800 shadow-2xs hover:border-blue-300 dark:hover:border-zinc-700 hover:shadow-xs transition-all cursor-pointer group"
                  onClick={() => showToast(`Mở thư mục ${folder.name}`, 'info')}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded bg-blue-50 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Folder className="w-5 h-5 fill-blue-100 dark:fill-zinc-700 text-blue-600 dark:text-blue-400" />
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        showToast(`Tùy chọn ${folder.name}`, 'info');
                      }}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 p-1 cursor-pointer"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-zinc-100 text-xs truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {folder.name}
                  </h4>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-zinc-500 mt-1">
                    <span>{folder.itemCount} tệp</span>
                    <span>{folder.updatedAt}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Filter, Search & View Controls */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-zinc-900 p-4 rounded-lg border border-slate-200/80 dark:border-zinc-800 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative flex-1 w-full max-w-md">
                <Search className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Tìm kiếm tài liệu theo tên, người cập nhật..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded text-xs placeholder:text-slate-400 dark:placeholder:text-zinc-500 text-slate-800 dark:text-zinc-100 focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-zinc-800 transition-colors"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={() => showToast('Mở bộ lọc nâng cao', 'info')}
                  className="px-3 py-2 border border-slate-200 dark:border-zinc-700 rounded text-xs font-semibold text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Filter className="w-3.5 h-3.5" />
                  <span>Bộ lọc</span>
                </button>

                <div className="flex items-center border border-slate-200 dark:border-zinc-700 rounded p-0.5 bg-slate-50 dark:bg-zinc-800">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded transition-colors cursor-pointer ${
                      viewMode === 'list'
                        ? 'bg-white dark:bg-zinc-900 shadow-2xs text-blue-600 dark:text-blue-400 font-bold'
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded transition-colors cursor-pointer ${
                      viewMode === 'grid'
                        ? 'bg-white dark:bg-zinc-900 shadow-2xs text-blue-600 dark:text-blue-400 font-bold'
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300'
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Documents Table / Grid View */}
            {viewMode === 'list' ? (
              <CustomTable<DocumentItem>
                columns={docColumns}
                data={filteredDocs}
                keyExtractor={(doc) => doc.id}
                onRowClick={(doc) => showToast(`Xem tài liệu: ${doc.name}`, 'info')}
                emptyText="Không tìm thấy tài liệu nào"
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {filteredDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-4 bg-white dark:bg-zinc-900 rounded-lg border border-slate-200/80 dark:border-zinc-800 space-y-2 hover:border-blue-300 dark:hover:border-zinc-700 transition-all cursor-pointer shadow-2xs"
                    onClick={() => showToast(`Xem tài liệu ${doc.name}`, 'info')}
                  >
                    <div className="flex items-center justify-between">
                      <span className="p-1.5 rounded text-[10px] font-bold uppercase bg-blue-100 dark:bg-zinc-800 text-blue-700 dark:text-blue-300">
                        {doc.type}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-zinc-500">{doc.size || '1.5 MB'}</span>
                    </div>
                    <p className="font-bold text-slate-800 dark:text-zinc-200 text-xs truncate">{doc.name}</p>
                    <p className="text-[10px] text-slate-400 dark:text-zinc-500">Cập nhật: {doc.updatedAt || doc.uploadedAt}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Info & Statistics Sidebar */}
        <aside className="w-80 bg-white dark:bg-zinc-950 border-l border-slate-200 dark:border-zinc-800 p-5 flex flex-col gap-6 shrink-0 overflow-y-auto hidden lg:flex select-none text-xs transition-colors">
          {/* Dung lượng lưu trữ */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-zinc-100 text-sm">Dung lượng lưu trữ</h3>
            <div className="h-44 w-full flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={68}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-bold text-slate-900 dark:text-zinc-100">13.6 GB</span>
                <span className="text-[10px] text-slate-400 dark:text-zinc-500">/ 20 GB</span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between items-center text-slate-600 dark:text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                  <span>Đã sử dụng (68%)</span>
                </span>
                <span className="font-bold text-slate-800 dark:text-zinc-200">13.6 GB</span>
              </div>
              <div className="flex justify-between items-center text-slate-600 dark:text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-zinc-700" />
                  <span>Còn trống (32%)</span>
                </span>
                <span className="font-bold text-slate-800 dark:text-zinc-200">6.4 GB</span>
              </div>
            </div>
          </div>

          {/* Tải lên gần đây */}
          <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 dark:text-zinc-200">Tải lên gần đây</span>
              <button onClick={() => showToast('Xem toàn bộ lịch sử tải lên', 'info')} className="text-blue-600 dark:text-blue-400 hover:underline font-semibold text-[11px] cursor-pointer">
                Xem tất cả
              </button>
            </div>

            <div className="space-y-2">
              {mockRecentUploads.map((up) => (
                <div key={up.id} className="p-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded space-y-0.5">
                  <p className="font-semibold text-slate-800 dark:text-zinc-200 truncate">{up.name}</p>
                  <p className="text-[10px] text-slate-400 dark:text-zinc-500 flex justify-between">
                    <span>{(up.updatedAt || up.uploadedAt || '').split(' ')[0]}</span>
                    <span>{up.updatedBy || up.uploadedBy || ''}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Tài liệu được chia sẻ */}
          <div className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 dark:text-zinc-200">Tài liệu được chia sẻ</span>
              <button onClick={() => showToast('Quản lý chia sẻ', 'info')} className="text-blue-600 dark:text-blue-400 hover:underline font-semibold text-[11px] cursor-pointer">
                Quản lý
              </button>
            </div>

            <div className="space-y-2">
              {mockSharedDocuments.map((sh) => (
                <div key={sh.id} className="p-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded space-y-0.5">
                  <p className="font-semibold text-slate-800 dark:text-zinc-200 truncate">{sh.title}</p>
                  <p className="text-[10px] text-slate-400 dark:text-zinc-500">{sh.sharedWithText}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <UploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
    </div>
  );
};
export default DataRepoPage;

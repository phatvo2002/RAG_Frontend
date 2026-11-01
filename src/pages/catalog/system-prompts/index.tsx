import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Check, Eye, History, Play, Search, Save, Sparkles } from 'lucide-react';
import { ConfirmModal } from '@/components/disclosure';
import { Column, CustomTable, TableRowActions } from '@/components/customTable';
import { Header } from '@/components/header';
import { useApp } from '@/context/AppContext';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { PromptType, PromptVersion, SystemPrompt, systemPromptsApi } from '@/api/system-prompts.api';

export const SystemPromptsPage: React.FC = () => {
  const { language, showToast } = useApp();
  const tr = (en: string, vi: string) => language === 'vi' ? vi : en;
  const { hasModuleAccess } = useUserPermissions();
  const queryClient = useQueryClient();
  const [selectedType, setSelectedType] = useState<PromptType | null>(null);
  const type = selectedType ?? 'CHAT';
  const [instructions, setInstructions] = useState('');
  const [sample, setSample] = useState('');
  const [preview, setPreview] = useState('');
  const [search, setSearch] = useState('');
  const [draftFilter, setDraftFilter] = useState<'all' | 'draft' | 'no-draft'>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [confirm, setConfirm] = useState<{ kind: 'publish' | 'restore'; version?: PromptVersion } | null>(null);
  const promptsQuery = useQuery({ queryKey: ['system-prompts'], queryFn: systemPromptsApi.list });
  const versionsQuery = useQuery({ queryKey: ['system-prompts', type, 'versions'], queryFn: () => systemPromptsApi.versions(type), enabled: selectedType !== null });
  const prompt = promptsQuery.data?.find((item) => item.promptType === selectedType);
  useEffect(() => { if (prompt) setInstructions(prompt.draft?.instructions ?? prompt.activeVersion.instructions); }, [selectedType, prompt?.draft?.id, prompt?.activeVersion.id]);
  const refresh = async () => { await queryClient.invalidateQueries({ queryKey: ['system-prompts'] }); await queryClient.invalidateQueries({ queryKey: ['system-prompts', type, 'versions'] }); };
  const save = useMutation({ mutationFn: () => systemPromptsApi.saveDraft(type, instructions), onSuccess: async () => { showToast(tr('Draft saved.', 'Đã lưu bản nháp.'), 'success'); await refresh(); }, onError: (error) => showToast(error instanceof Error ? error.message : tr('Could not save draft.', 'Không thể lưu bản nháp.'), 'error') });
  const runPreview = useMutation({ mutationFn: () => systemPromptsApi.preview(type, sample, instructions), onSuccess: (value) => setPreview(value.answer), onError: (error) => showToast(error instanceof Error ? error.message : tr('Preview failed.', 'Không thể thử prompt.'), 'error') });
  const publish = useMutation({ mutationFn: () => confirm?.kind === 'restore' && confirm.version ? systemPromptsApi.restore(type, confirm.version.id) : systemPromptsApi.publish(type), onSuccess: async () => { setConfirm(null); showToast(tr('Published version updated.', 'Đã cập nhật phiên bản đang xuất bản.'), 'success'); await refresh(); }, onError: (error) => showToast(error instanceof Error ? error.message : tr('Could not publish prompt.', 'Không thể xuất bản prompt.'), 'error') });
  const canWrite = hasModuleAccess('SYSTEM_PROMPT.DRAFT.UPDATE');
  const canPreview = hasModuleAccess('SYSTEM_PROMPT.PREVIEW');
  const canPublish = hasModuleAccess('SYSTEM_PROMPT.PUBLISH');
  const canRestore = hasModuleAccess('SYSTEM_PROMPT.RESTORE');
  const allPrompts = promptsQuery.data ?? [];
  const filteredPrompts = allPrompts.filter((item) => {
    const label = item.promptType === 'CHAT' ? tr('AI Chat', 'Chat AI') : tr('Meeting translation', 'Dịch cuộc họp');
    return label.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()) &&
      (draftFilter === 'all' || (draftFilter === 'draft' ? !!item.draft : !item.draft));
  });
  const totalPages = Math.max(1, Math.ceil(filteredPrompts.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagePrompts = filteredPrompts.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const columns: Column<SystemPrompt>[] = [
    { id: 'promptType', header: tr('PROMPT', 'PROMPT'), sortable: false, render: (item) => <span className="font-semibold text-slate-900 dark:text-zinc-100">{item.promptType === 'CHAT' ? tr('AI Chat', 'Chat AI') : tr('Meeting translation', 'Dịch cuộc họp')}</span> },
    { id: 'activeVersion', header: tr('ACTIVE VERSION', 'PHIÊN BẢN ĐANG DÙNG'), sortable: false, render: (item) => `v${item.activeVersion.versionNo}` },
    { id: 'draft', header: tr('DRAFT', 'BẢN NHÁP'), sortable: false, render: (item) => item.draft ? `v${item.draft.versionNo}` : tr('None', 'Không có') },
    { id: 'status', header: tr('STATUS', 'TRẠNG THÁI'), sortable: false, render: (item) => <span className="inline-flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />{item.draft ? tr('Draft available', 'Có bản nháp') : tr('Published', 'Đang xuất bản')}</span> },
    { id: 'action', header: tr('ACTION', 'THAO TÁC'), align: 'right', sortable: false, className: 'nexora-table-action-cell', render: (item) => <TableRowActions items={[{ label: tr('View details', 'Xem chi tiết'), icon: <Eye className="h-4 w-4" />, onClick: () => { setSelectedType(item.promptType); setPreview(''); setSample(''); } }]} /> },
  ];
  return <div className="nexora-page flex h-full flex-1 flex-col overflow-hidden bg-slate-50/50 text-slate-900 dark:bg-black dark:text-zinc-100">
    <Header />
    <main className="min-w-0 flex-1 space-y-4 overflow-y-auto p-4 md:p-6">
      <header><h1 className="text-xl font-bold tracking-tight">System Prompt</h1><p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">{tr('Manage organization instructions, test changes, and publish versioned prompts.', 'Quản lý hướng dẫn của tổ chức, thử thay đổi và xuất bản prompt theo phiên bản.')}</p></header>
      {selectedType === null && <>
        <div className="flex flex-wrap items-center gap-4 pt-0.5 text-xs font-semibold">
          <span><strong>{allPrompts.length}</strong> <span className="font-normal text-slate-500 dark:text-zinc-400">{tr('prompts', 'prompt')}</span></span>
          <span className="text-slate-300 dark:text-zinc-700">|</span>
          <span><strong>{allPrompts.filter((item) => item.draft).length}</strong> <span className="font-normal text-slate-500 dark:text-zinc-400">{tr('drafts', 'bản nháp')}</span></span>
        </div>
        <div className="nexora-table-filters flex flex-wrap items-center gap-3 bg-white shadow-2xs dark:bg-zinc-900">
          <label className="relative min-w-[220px] flex-1">
            <span className="sr-only">{tr('Search prompts', 'Tìm prompt')}</span>
            <input className="w-full pl-3 pr-9 text-xs" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder={tr('Search prompts...', 'Tìm prompt...')} />
            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </label>
          <select aria-label={tr('Draft filter', 'Lọc bản nháp')} className="min-w-44 px-3 text-xs" value={draftFilter} onChange={(event) => { setDraftFilter(event.target.value as typeof draftFilter); setPage(1); }}>
            <option value="all">{tr('Draft: All', 'Bản nháp: Tất cả')}</option>
            <option value="draft">{tr('Has draft', 'Có bản nháp')}</option>
            <option value="no-draft">{tr('No draft', 'Không có bản nháp')}</option>
          </select>
        </div>
      </>}
      {promptsQuery.isError ? <p role="alert" className="text-rose-600">{promptsQuery.error.message}</p> : selectedType === null ? (
        <CustomTable<SystemPrompt>
          columns={columns}
          data={pagePrompts}
          keyExtractor={(item) => item.id}
          isLoading={promptsQuery.isLoading}
          emptyText={tr('No prompts found.', 'Không tìm thấy prompt.')}
          className="bg-white dark:bg-zinc-900"
          pagination={{ currentPage, totalPages, pageSize, totalItems: filteredPrompts.length, onPageChange: setPage, onPageSizeChange: (size) => { setPageSize(size); setPage(1); }, pageSizeOptions: [10, 20, 50] }}
        />
      ) : <>
      <button type="button" className="btn btn-sm btn-ghost" onClick={() => setSelectedType(null)}><ArrowLeft className="h-4 w-4" />{tr('Back to prompts', 'Quay lại danh sách prompt')}</button>
      {prompt && <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="space-y-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex flex-wrap items-center justify-between gap-2"><div><h2 className="font-semibold">{tr('Custom instructions', 'Hướng dẫn tùy chỉnh')}</h2><p className="text-xs text-slate-500">{tr(`Active version ${prompt.activeVersion.versionNo}`, `Phiên bản đang dùng ${prompt.activeVersion.versionNo}`)}{prompt.draft ? ` · ${tr(`Draft v${prompt.draft.versionNo}`, `Bản nháp v${prompt.draft.versionNo}`)}` : ''}</p></div><span className="badge badge-success badge-outline"><Check className="mr-1 h-3 w-3" />{tr('Published', 'Đang xuất bản')}</span></div>
          <div className="rounded-lg bg-blue-50 p-3 text-xs text-blue-800 dark:bg-blue-950/40 dark:text-blue-200">{tr('Core safety and access rules are fixed by the system and cannot be overridden by this prompt.', 'Quy tắc an toàn và quyền truy cập cốt lõi do hệ thống cố định, không thể bị ghi đè tại đây.')}</div>
          <textarea aria-label={tr('Prompt instructions', 'Nội dung prompt')} className="textarea textarea-bordered min-h-64 w-full font-mono text-sm" maxLength={8000} value={instructions} onChange={(event) => setInstructions(event.target.value)} disabled={!canWrite} />
          <div className="flex flex-wrap justify-between gap-2 text-xs text-slate-500"><span>{instructions.length.toLocaleString()}/8,000 {tr('characters', 'ký tự')}</span><div className="flex gap-2">{canWrite && <button className="btn btn-sm btn-outline" disabled={save.isPending || !instructions.trim()} onClick={() => save.mutate()}><Save className="h-4 w-4" />{tr('Save draft', 'Lưu nháp')}</button>}{canPublish && prompt.draft && <button className="btn btn-sm btn-primary" disabled={publish.isPending} onClick={() => setConfirm({ kind: 'publish' })}><Sparkles className="h-4 w-4" />{tr('Publish', 'Xuất bản')}</button>}</div></div>
          <div className="border-t border-slate-200 pt-4 dark:border-zinc-800"><h3 className="mb-2 font-semibold">{tr('Try this prompt', 'Thử prompt')}</h3><textarea className="textarea textarea-bordered min-h-20 w-full" value={sample} onChange={(event) => setSample(event.target.value)} placeholder={type === 'CHAT' ? tr('Enter a question…', 'Nhập câu hỏi…') : tr('Enter sample speech…', 'Nhập câu nói mẫu…')} />{canPreview && <button className="btn btn-sm btn-secondary mt-2" disabled={runPreview.isPending || !sample.trim()} onClick={() => runPreview.mutate()}><Play className="h-4 w-4" />{runPreview.isPending ? tr('Running…', 'Đang thử…') : tr('Preview', 'Chạy thử')}</button>}{preview && <div className="mt-3 whitespace-pre-wrap rounded-lg bg-slate-50 p-4 text-sm dark:bg-zinc-800">{preview}</div>}</div>
        </section>
        <aside className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"><h2 className="mb-4 flex items-center gap-2 font-semibold"><History className="h-4 w-4" />{tr('Version history', 'Lịch sử phiên bản')}</h2>{versionsQuery.isLoading ? <p className="text-sm">{tr('Loading…', 'Đang tải…')}</p> : versionsQuery.isError ? <p role="alert" className="text-sm text-rose-600">{versionsQuery.error.message}</p> : <ol className="space-y-3">{versionsQuery.data?.map((version) => <li key={version.id} className="rounded-lg border border-slate-200 p-3 dark:border-zinc-700"><div className="flex justify-between gap-2"><strong className="text-sm">v{version.versionNo}</strong><span className="text-xs text-slate-500">{version.status === 'PUBLISHED' ? tr('Published', 'Đã xuất bản') : tr('Draft', 'Bản nháp')}</span></div><p className="mt-1 text-xs text-slate-500">{new Date(version.publishedAt || version.createdAt).toLocaleString()}</p>{canRestore && version.status === 'PUBLISHED' && version.id !== prompt.activeVersion.id && <button className="btn btn-xs btn-outline mt-2" onClick={() => setConfirm({ kind: 'restore', version })}>{tr('Restore as new version', 'Khôi phục thành phiên bản mới')}</button>}</li>)}</ol>}</aside>
      </div>}
      </>}
    </main>
    <ConfirmModal isOpen={!!confirm} onClose={() => setConfirm(null)} isLoading={publish.isPending} onConfirm={() => publish.mutate()} type="warning" title={confirm?.kind === 'restore' ? tr('Restore prompt version', 'Khôi phục phiên bản prompt') : tr('Publish prompt', 'Xuất bản prompt')} message={confirm?.kind === 'restore' ? tr('This will create and publish a new version from the selected historical version.', 'Thao tác sẽ tạo và xuất bản phiên bản mới từ nội dung đã chọn.') : tr('The current draft will become active for new chats or translations.', 'Bản nháp hiện tại sẽ được dùng cho các lượt chat hoặc dịch mới.')} confirmText={confirm?.kind === 'restore' ? tr('Restore', 'Khôi phục') : tr('Publish', 'Xuất bản')} />
  </div>;
};

export default SystemPromptsPage;

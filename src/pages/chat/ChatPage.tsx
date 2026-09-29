import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ChevronDown, FileText, LayoutDashboard, LoaderCircle, Menu, Paperclip, Plus, Search, Send, Sparkles, Trash2, X } from 'lucide-react';
import { chatApi } from '@/api/chat.api';
import type { ChatConversation, ChatMessage, ChatModel, ChatSource } from '@/api/chat.api';
import { useApp } from '@/context/AppContext';

export const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useApp();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [models, setModels] = useState<ChatModel[]>([]);
  const [modelId, setModelId] = useState('gemini');
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [streamText, setStreamText] = useState('');
  const [streamSources, setStreamSources] = useState<ChatSource[]>([]);
  const [error, setError] = useState('');
  const [hasOlder, setHasOlder] = useState(false);
  const [hasMoreConversations, setHasMoreConversations] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [sourcesOpen, setSourcesOpen] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 1280);
  const [focusedMessageId, setFocusedMessageId] = useState<string | null>(null);
  const [selectedSourceIndex, setSelectedSourceIndex] = useState(0);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    chatApi.models().then(async available => {
      if (cancelled) return;
      setModels(available.models);
      setModelId(available.models.some(model => model.id === available.defaultModel) ? available.defaultModel : available.models[0]?.id ?? '');
      if (available.configurationError) {
        setError(available.configurationError);
      }
      const history = await chatApi.conversations();
      if (cancelled) return;
      setConversations(history);
      setHasMoreConversations(history.length === 50);
      if (history.length > 0) {
        const latestMessages = await chatApi.messages(history[0].id);
        if (!cancelled) {
          setActiveId(history[0].id);
          setMessages(latestMessages);
          setHasOlder(latestMessages.length === 50);
        }
      }
    }).catch(err => { if (!cancelled) setError(err instanceof Error ? err.message : 'Không thể tải lịch sử hội thoại.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, streamText]);

  const refreshConversations = async () => {
    const history = await chatApi.conversations();
    setConversations(history);
    setHasMoreConversations(history.length === 50);
  };

  const openConversation = async (id: string) => {
    if (sending) return;
    setHistoryOpen(false);
    setFocusedMessageId(null);
    setSelectedSourceIndex(0);
    setActiveId(id);
    setMessages([]);
    setError('');
    setLoading(true);
    try {
      const history = await chatApi.messages(id);
      setMessages(history);
      setHasOlder(history.length === 50);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải tin nhắn.');
    } finally {
      setLoading(false);
    }
  };

  const newChat = () => {
    if (sending) return;
    setHistoryOpen(false);
    setFocusedMessageId(null);
    setSelectedSourceIndex(0);
    setActiveId(null);
    setMessages([]);
    setStreamText('');
    setStreamSources([]);
    setError('');
    setHasOlder(false);
  };

  const send = async () => {
    const question = input.trim();
    if (!question || !modelId || sending) return;
    setInput('');
    setError('');
    setStreamText('');
    setStreamSources([]);
    setSending(true);
    setFocusedMessageId(null);
    setSelectedSourceIndex(0);
    const temporaryId = crypto.randomUUID();
    setMessages(previous => [...previous, {
      id: temporaryId, conversationId: activeId ?? '', role: 'user', content: question,
      sequenceNo: 0, createdAt: new Date().toISOString(), status: 'PENDING', sources: [],
    }]);
    let conversationId = activeId;
    try {
      await chatApi.streamTurn({ conversationId: activeId, question, modelId, clientRequestId: crypto.randomUUID() }, event => {
        if (event.type === 'started') {
          conversationId = event.data.conversationId;
          setActiveId(conversationId);
          setMessages(previous => previous.map(message => message.id === temporaryId
            ? { ...message, id: event.data.requestMessageId, conversationId: event.data.conversationId } : message));
        }
        if (event.type === 'sources') setStreamSources(event.data);
        if (event.type === 'delta') setStreamText(previous => previous + event.data.text);
        if (event.type === 'completed') {
          setMessages(previous => [...previous, event.data]);
          setFocusedMessageId(event.data.id);
          setStreamText('');
          setStreamSources([]);
        }
      });
      await refreshConversations();
      if (conversationId) {
        const history = await chatApi.messages(conversationId);
        setMessages(history);
        setHasOlder(history.length === 50);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tạo câu trả lời.');
      setStreamText('');
      setStreamSources([]);
      if (conversationId) {
        try { setMessages(await chatApi.messages(conversationId)); await refreshConversations(); } catch { /* retain error */ }
      } else {
        setMessages(previous => previous.map(message => message.id === temporaryId ? { ...message, status: 'FAILED' } : message));
      }
    } finally {
      setSending(false);
    }
  };

  const deleteMessage = async (message: ChatMessage) => {
    if (!activeId || sending || !window.confirm('Xóa tin nhắn này khỏi hội thoại?')) return;
    try {
      await chatApi.deleteMessage(activeId, message.id);
      setMessages(previous => previous.filter(item => item.id !== message.id));
      if (focusedMessageId === message.id) setFocusedMessageId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể xóa tin nhắn.');
    }
  };

  const loadOlder = async () => {
    if (!activeId || messages.length === 0) return;
    try {
      const older = await chatApi.messages(activeId, messages[0].sequenceNo);
      setMessages(previous => [...older, ...previous]);
      setHasOlder(older.length === 50);
    } catch (err) { setError(err instanceof Error ? err.message : 'Không thể tải tin nhắn cũ.'); }
  };

  const latestAssistant = [...messages].reverse().find(message => message.role === 'assistant');
  const focusedAssistant = messages.find(message => message.id === focusedMessageId && message.role === 'assistant');
  const sources = sending ? streamSources : (focusedAssistant ?? latestAssistant)?.sources ?? [];
  const filteredConversations = conversations.filter(item => item.title.toLowerCase().includes(search.toLowerCase()));
  const formatTime = (date: string) => new Date(date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  const formatDate = (date: string) => new Date(date).toLocaleDateString('vi-VN');
  const formatDayLabel = (date: string) => formatDate(date) === formatDate(new Date().toISOString()) ? 'Hôm nay' : formatDate(date);
  const userInitial = (currentUser?.name || 'B').trim().charAt(0).toUpperCase();

  return (
    <div className="flex h-screen min-h-0 overflow-hidden bg-white text-[#182744]" style={{ colorScheme: 'light' }}>
      {historyOpen && <button aria-label="Đóng lịch sử hội thoại" onClick={() => setHistoryOpen(false)} className="fixed inset-0 z-20 bg-slate-950/30 md:hidden" />}
      <aside className={`${historyOpen ? 'flex' : 'hidden'} fixed inset-y-0 left-0 z-30 w-[300px] flex-col border-r border-[#e5ebf4] bg-[#f8fafd] md:static md:z-auto md:flex md:w-[260px] lg:w-[300px] shrink-0`}>
        <div className="space-y-2.5 border-b border-[#e6ebf4] p-3">
          <button onClick={() => navigate({ to: '/dashboard' as any })} className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-white text-sm font-medium text-[#233658] hover:bg-[#eef3fc]">
            <LayoutDashboard size={17} strokeWidth={1.8} />Dashboard Quản lý
          </button>
          <button onClick={newChat} disabled={sending} className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#1762f4] text-sm font-semibold text-white shadow-sm hover:bg-[#0d52d9] disabled:opacity-50">
            <Plus size={18} />Đoạn chat mới
          </button>
          <label className="flex h-11 items-center gap-2 rounded-xl border border-[#dce5f2] bg-white px-3 text-[#7588a9] focus-within:border-[#1762f4]">
            <Search size={18} aria-hidden="true" />
            <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Tìm đoạn chat..." aria-label="Tìm đoạn chat" className="min-w-0 flex-1 bg-transparent text-sm text-[#182744] outline-none placeholder:text-[#8190aa]" />
          </label>
        </div>
        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
          {filteredConversations.map(item => (
            <button key={item.id} onClick={() => void openConversation(item.id)} className={`relative w-full rounded-xl border px-3.5 py-3 text-left transition-colors ${activeId === item.id ? 'border-[#d8e6ff] bg-[#eaf2ff] text-[#1353cf]' : 'border-[#e5ebf4] bg-white text-[#253653] hover:border-[#bbd0f2]'}`}>
              {activeId === item.id && <span className="absolute inset-y-3 left-0 w-0.5 rounded-full bg-[#1762f4]" />}
              <span className="flex items-center justify-between gap-2"><strong className="truncate text-[13px] font-semibold">{item.title}</strong><time className="shrink-0 text-[11px] font-normal text-[#8493ad]">{formatDate(item.updatedAt)}</time></span>
              <span className="mt-1 block truncate text-xs text-[#8593ac]">Mở lại cuộc hội thoại</span>
            </button>
          ))}
          {!loading && filteredConversations.length === 0 && <p className="px-2 py-5 text-center text-xs text-[#8190aa]">{search ? 'Không tìm thấy đoạn chat.' : 'Chưa có đoạn chat nào.'}</p>}
          {hasMoreConversations && <button onClick={async () => { try { const more = await chatApi.conversations(conversations.length); setConversations(previous => [...previous, ...more]); setHasMoreConversations(more.length === 50); } catch (err) { setError(err instanceof Error ? err.message : 'Không thể tải hội thoại.'); } }} className="px-2 py-2 text-xs font-semibold text-[#1762f4] hover:underline">Xem thêm hội thoại</button>}
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col bg-white">
        <header className="flex h-[66px] shrink-0 items-center justify-between gap-3 border-b border-[#e6ebf4] px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <button onClick={() => setHistoryOpen(true)} aria-label="Mở lịch sử hội thoại" className="rounded-lg p-2 text-[#52678b] hover:bg-[#eef3fc] md:hidden"><Menu size={20} /></button>
            <h1 className="truncate text-base font-bold tracking-tight text-[#101f3b] sm:text-lg">Trợ lý AI NEXORA</h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <label htmlFor="chat-model" className="hidden text-sm text-[#7485a2] sm:block">Mô hình</label>
            <div className="relative">
              <select id="chat-model" value={modelId} onChange={event => setModelId(event.target.value)} disabled={sending || models.length === 0} className="h-11 max-w-[165px] appearance-none rounded-xl border border-[#dfe7f3] bg-white py-2 pl-3 pr-8 text-xs font-medium text-[#243652] outline-none focus:border-[#1762f4] disabled:opacity-60 sm:max-w-[210px] sm:text-sm">
                {models.length === 0 && <option value="">Chưa có mô hình</option>}
                {models.map(model => <option key={model.id} value={model.id}>{model.name}</option>)}
              </select>
              <ChevronDown size={15} className="pointer-events-none absolute right-2.5 top-3.5 text-[#657997]" />
            </div>
            <button onClick={() => setSourcesOpen(true)} aria-label="Mở nguồn tham khảo" title="Nguồn tham khảo" className={`rounded-lg p-2 text-[#52678b] hover:bg-[#eef3fc] ${sourcesOpen ? 'hidden' : ''}`}><FileText size={19} /></button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-7">
          <div className="mx-auto max-w-[880px] space-y-6">
            {loading && <p className="flex items-center gap-2 text-sm text-[#8291aa]"><LoaderCircle size={17} className="animate-spin" />Đang tải hội thoại...</p>}
            {!loading && messages.length === 0 && !sending && <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-center"><Sparkles size={30} className="text-[#1762f4]" /><strong className="text-lg text-[#1b2d4e]">Hỏi về tài liệu bạn được phép truy cập</strong><p className="text-sm text-[#8190aa]">Câu trả lời sẽ được lưu trong lịch sử hội thoại của bạn.</p></div>}
            {messages.length > 0 && <div className="flex justify-center"><span className="rounded-xl bg-[#f2f5f9] px-5 py-2 text-xs font-medium text-[#7283a0]">{formatDayLabel(messages[0].createdAt)}</span></div>}
            {hasOlder && <button onClick={() => void loadOlder()} className="block w-full text-center text-xs font-semibold text-[#1762f4] hover:underline">Tải tin nhắn cũ hơn</button>}

            {messages.map(message => message.role === 'user' ? (
              <article key={message.id} className="group flex justify-end gap-3">
                <div className="flex max-w-[min(78%,680px)] flex-col items-end gap-1.5">
                  <div className="rounded-2xl rounded-tr-md bg-[#1762f4] px-4 py-3 text-sm leading-relaxed text-white shadow-sm whitespace-pre-wrap">{message.content}</div>
                  <div className="flex items-center gap-2 text-[11px] text-[#8999b2]">
                    {message.status === 'FAILED' && <span className="text-rose-600">Không thể tạo câu trả lời cho tin nhắn này.</span>}
                    <button onClick={() => void deleteMessage(message)} disabled={sending || !activeId} aria-label="Xóa tin nhắn" title="Xóa tin nhắn" className="opacity-0 transition-opacity hover:text-rose-600 focus:opacity-100 disabled:hidden group-hover:opacity-100"><Trash2 size={13} /></button>
                    <time>{formatTime(message.createdAt)}</time>
                  </div>
                </div>
                <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e4edff] text-sm font-bold text-[#1762f4]">{userInitial}</span>
              </article>
            ) : (
              <article key={message.id} className="group flex items-start gap-3">
                <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e4edff] text-sm font-bold text-[#1762f4]">N</span>
                <div className="min-w-0 max-w-[min(88%,760px)] space-y-2">
                  <div className="rounded-2xl rounded-tl-md bg-[#f1f4f9] px-4 py-3 text-sm leading-relaxed text-[#243653]">
                    <span className="whitespace-pre-wrap">{message.content}</span>
                    {message.sources.length > 0 && <span className="ml-1.5 inline-flex flex-wrap gap-1 align-baseline">{message.sources.slice(0, 2).map((source, index) => <button key={source.chunkId} onClick={() => { setFocusedMessageId(message.id); setSelectedSourceIndex(index); setSourcesOpen(true); }} title={source.fileName} className="rounded bg-[#dfebff] px-1.5 py-0.5 text-xs font-semibold text-[#1762f4] hover:bg-[#ccddff]">[{index + 1}]</button>)}</span>}
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-[#8999b2]">
                    <time>{formatTime(message.createdAt)}</time>
                    {message.modelName && <span>{message.modelName}</span>}
                    <button onClick={() => void deleteMessage(message)} disabled={sending || !activeId} aria-label="Xóa tin nhắn" title="Xóa tin nhắn" className="opacity-0 transition-opacity hover:text-rose-600 focus:opacity-100 disabled:hidden group-hover:opacity-100"><Trash2 size={13} /></button>
                  </div>
                  {message.sources.length > 0 && <button onClick={() => { setFocusedMessageId(message.id); setSelectedSourceIndex(0); setSourcesOpen(true); }} className="inline-flex items-center gap-2 rounded-full bg-[#edf4ff] px-4 py-2 text-xs font-semibold text-[#1762f4] hover:bg-[#e0edff]"><FileText size={15} />Xem {message.sources.length} nguồn<ChevronDown size={14} /></button>}
                </div>
              </article>
            ))}

            {sending && <article className="flex items-start gap-3"><span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e4edff] text-sm font-bold text-[#1762f4]">N</span><div className="max-w-[85%] rounded-2xl rounded-tl-md bg-[#f1f4f9] px-4 py-3 text-sm leading-relaxed text-[#243653] whitespace-pre-wrap">{streamText || <span className="flex items-center gap-2 text-[#7587a5]"><LoaderCircle size={15} className="animate-spin" />Đang tìm tài liệu và tạo câu trả lời...</span>}</div></article>}
            {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}{models.length === 0 && <button onClick={() => navigate({ to: '/account' })} className="ml-2 font-semibold text-[#1762f4] underline">Thiết lập khóa API</button>}</div>}
            <div ref={endRef} />
          </div>
        </div>

        <div className="shrink-0 border-t border-[#e7ecf5] bg-white px-3 py-3 sm:px-5 sm:py-4">
          <div className="mx-auto flex max-w-[930px] items-end gap-2 rounded-2xl border border-[#dce5f2] bg-white p-2 shadow-sm focus-within:border-[#9ebdff]">
            <button type="button" disabled title="Đính kèm tài liệu chưa được hỗ trợ" aria-label="Đính kèm tài liệu chưa được hỗ trợ" className="mb-1 rounded-lg p-2 text-[#637797] opacity-70"><Paperclip size={20} /></button>
            <textarea value={input} onChange={event => setInput(event.target.value)} onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); void send(); } }} disabled={sending || models.length === 0} maxLength={2000} rows={1} placeholder={models.length ? 'Hỏi về dữ liệu nội bộ...' : 'Chưa cấu hình mô hình AI'} aria-label="Nội dung tin nhắn" className="max-h-36 min-h-10 min-w-0 flex-1 resize-none bg-transparent px-1 py-2.5 text-sm text-[#243653] outline-none placeholder:text-[#8191ac] disabled:opacity-60" />
            <button onClick={() => void send()} disabled={sending || !input.trim() || !modelId} className="flex h-10 items-center gap-2 rounded-xl bg-[#1762f4] px-4 text-sm font-semibold text-white hover:bg-[#0d52d9] disabled:opacity-50"><Send size={17} />Gửi</button>
          </div>
        </div>
      </main>

      {sourcesOpen && <>
        <button aria-label="Đóng nguồn tham khảo" onClick={() => setSourcesOpen(false)} className="fixed inset-0 z-20 bg-slate-950/30 xl:hidden" />
        <aside className="fixed inset-y-0 right-0 z-30 flex w-[min(360px,90vw)] shrink-0 flex-col border-l border-[#e6ebf4] bg-[#fbfcfe] xl:static xl:z-auto xl:w-[334px]">
          <div className="flex items-center justify-between px-5 pb-2 pt-6"><h2 className="text-base font-bold text-[#172744]">Nguồn tham khảo</h2><button onClick={() => setSourcesOpen(false)} aria-label="Đóng nguồn tham khảo" className="rounded-lg p-1 text-[#627694] hover:bg-[#eaf0f8]"><X size={19} /></button></div>
          <p className="px-5 pb-4 text-xs leading-relaxed text-[#7486a4]">Chỉ sử dụng tài liệu đã lập chỉ mục mà bạn được phép truy cập.</p>
          <div className="mx-5 border-t border-[#e6ebf4]" />
          <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto px-3.5 pb-5 pt-4">
            {sources.length === 0 && <p className="px-2 py-4 text-sm text-[#8190aa]">Nguồn phù hợp sẽ xuất hiện khi có câu trả lời từ tài liệu.</p>}
            {sources.map((source, index) => <button key={`${source.chunkId}-${index}`} onClick={() => setSelectedSourceIndex(index)} className={`block w-full rounded-xl border bg-white p-3 text-left transition-colors ${selectedSourceIndex === index ? 'border-[#6c9bff] shadow-[0_0_0_1px_#dbe7ff]' : 'border-[#e5ebf4] hover:border-[#acc7f8]'}`}>
              <div className="flex items-start gap-2.5"><FileText size={18} className="mt-0.5 shrink-0 text-[#1762f4]" /><div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold text-[#223452]"><span className="text-[#1762f4]">[{index + 1}]</span> {source.fileName}</p><p className="mt-1 text-[11px] text-[#8090aa]">Điểm tương đồng: {source.score.toFixed(3)}</p></div><ChevronDown size={14} className={`mt-0.5 shrink-0 text-[#7285a4] ${selectedSourceIndex === index ? 'rotate-180' : ''}`} /></div>
              {selectedSourceIndex === index && <div className="mt-3 rounded-lg bg-[#f4f7fc] px-3 py-3 text-xs leading-relaxed text-[#304363]"><p>{source.pageNo != null ? `Trang ${source.pageNo}` : 'Vị trí trong tài liệu'}{source.charStart != null && source.charEnd != null ? ` · Ký tự ${source.charStart}–${source.charEnd}` : ''}</p><p className="mt-1.5 truncate text-[11px] text-[#8292ac]">{source.fileName}</p></div>}
            </button>)}
          </div>
        </aside>
      </>}
    </div>
  );
};

export default ChatPage;

import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { FileText, FolderOpen, LayoutDashboard, LoaderCircle, Menu, MessageCircle, Mic, Paperclip, Plus, Search, Send, ShieldCheck, Trash2, X } from 'lucide-react';
import { chatApi } from '@/api/chat.api';
import type { ChatConversation, ChatMessage, ChatSource } from '@/api/chat.api';
import { ConfirmModal } from '@/components/disclosure';
import { useApp } from '@/context/AppContext';
import { LanguageSwitcher } from '@/components/languageSwitcher';
import { ChatAnswerContent } from './ChatAnswerContent';
import { ChatSourcesPanel } from './ChatSourcesPanel';
import './chat-animations.css';

type ChatComposerProps = {
  input: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  loading: boolean;
  sending: boolean;
  modelsAvailable: boolean;
  language: 'en' | 'vi';
};

type DeleteTarget = { kind: 'conversation'; value: ChatConversation } | { kind: 'message'; value: ChatMessage };

const ChatComposer: React.FC<ChatComposerProps> = ({ input, onInputChange, onSend, loading, sending, modelsAvailable, language }) => {
  const tr = (en: string, vi: string) => language === 'vi' ? vi : en;

  return <div className="w-full">
    <div className="flex items-end gap-1.5 rounded-md border border-[#dce5f2] bg-white p-1.5 shadow-[0_1px_3px_rgba(16,36,86,0.05)] focus-within:border-[#8eb3ff] focus-within:ring-2 focus-within:ring-[#e8f0ff]">
      <button type="button" disabled title={tr('Attaching documents is not supported yet', 'Đính kèm tài liệu chưa được hỗ trợ')} aria-label={tr('Attaching documents is not supported yet', 'Đính kèm tài liệu chưa được hỗ trợ')} className="rounded-md p-2 text-[#637797] opacity-60"><Paperclip size={18} /></button>
      <button type="button" disabled title={tr('Voice input is not supported yet', 'Nhập bằng giọng nói chưa được hỗ trợ')} aria-label={tr('Voice input is not supported yet', 'Nhập bằng giọng nói chưa được hỗ trợ')} className="rounded-md p-2 text-[#637797] opacity-60"><Mic size={18} /></button>
      <span aria-hidden="true" className="my-2 h-6 w-px shrink-0 bg-[#e1e8f3]" />
      <textarea value={input} onChange={event => onInputChange(event.target.value)} onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); onSend(); } }} disabled={loading || sending || !modelsAvailable} maxLength={2000} rows={1} placeholder={loading ? tr('Loading AI assistant...', 'Đang tải trợ lý AI...') : modelsAvailable ? tr('Ask about your internal data...', 'Hỏi về dữ liệu nội bộ của bạn...') : tr('No AI model configured', 'Chưa cấu hình mô hình AI')} aria-label={tr('Message content', 'Nội dung tin nhắn')} className="max-h-32 min-h-10 min-w-0 flex-1 resize-none bg-transparent px-1 py-2.5 text-sm text-[#243653] outline-none placeholder:text-[#8191ac] disabled:opacity-60" />
      <button type="button" onClick={onSend} disabled={loading || sending || !input.trim() || !modelsAvailable} className="chat-action flex h-10 items-center gap-2 rounded-md bg-[#0759ee] px-3.5 text-sm font-semibold text-white hover:bg-[#126bff] disabled:opacity-50"><Send size={17} />{tr('Send', 'Gửi')}</button>
    </div>
    <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-relaxed text-[#7d8eaa]"><ShieldCheck size={14} className="mt-0.5 shrink-0 text-emerald-600" />{tr('NEXORA AI uses internal documents you can access. Conversation history is stored in the system.', 'NEXORA AI sử dụng tài liệu nội bộ bạn được phép truy cập. Lịch sử hội thoại được lưu trong hệ thống.')}</p>
  </div>;
};

export const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, language, showToast } = useApp();
  const tr = (en: string, vi: string) => language === 'vi' ? vi : en;
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [modelsAvailable, setModelsAvailable] = useState(false);
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [streamText, setStreamText] = useState('');
  const [streamSources, setStreamSources] = useState<ChatSource[]>([]);
  const [error, setError] = useState('');
  const [hasOlder, setHasOlder] = useState(false);
  const [hasMoreConversations, setHasMoreConversations] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const [sourceFilter, setSourceFilter] = useState('all');
  const [focusedMessageId, setFocusedMessageId] = useState<string | null>(null);
  const [selectedSourceIndex, setSelectedSourceIndex] = useState(0);
  const [now, setNow] = useState(() => new Date());
  const endRef = useRef<HTMLDivElement>(null);
  const conversationLoadId = useRef(0);

  useEffect(() => {
    let cancelled = false;
    chatApi.models().then(async available => {
      if (cancelled) return;
      setModelsAvailable(available.models.length > 0);
      if (available.configurationError) setError(available.configurationError);
      const history = await chatApi.conversations();
      if (cancelled) return;
      setConversations(history);
      setHasMoreConversations(history.length === 50);
    }).catch(err => { if (!cancelled) setError(err instanceof Error ? err.message : tr('Could not load conversation history.', 'Không thể tải lịch sử hội thoại.')); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }, [messages, streamText]);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const refreshConversations = async () => {
    const history = await chatApi.conversations();
    setConversations(history);
    setHasMoreConversations(history.length === 50);
  };

  const openConversation = async (id: string) => {
    if (sending || isDeleting) return;
    const loadId = ++conversationLoadId.current;
    setHistoryOpen(false);
    setFocusedMessageId(null);
    setSelectedSourceIndex(0);
    setSourceFilter('all');
    setActiveId(id);
    setMessages([]);
    setError('');
    setLoading(true);
    try {
      const history = await chatApi.messages(id);
      if (loadId === conversationLoadId.current) {
        setMessages(history);
        setHasOlder(history.length === 50);
      }
    } catch (err) {
      if (loadId === conversationLoadId.current) setError(err instanceof Error ? err.message : tr('Could not load messages.', 'Không thể tải tin nhắn.'));
    } finally {
      if (loadId === conversationLoadId.current) setLoading(false);
    }
  };

  const newChat = () => {
    if (sending || isDeleting) return;
    conversationLoadId.current++;
    setLoading(false);
    setHistoryOpen(false);
    setSourcesOpen(false);
    setFocusedMessageId(null);
    setSelectedSourceIndex(0);
    setSourceFilter('all');
    setActiveId(null);
    setMessages([]);
    setStreamText('');
    setStreamSources([]);
    setError('');
    setHasOlder(false);
  };

  const send = async () => {
    const question = input.trim();
    if (!question || !modelsAvailable || sending || isDeleting) return;
    setInput('');
    setError('');
    setStreamText('');
    setStreamSources([]);
    setSending(true);
    setFocusedMessageId(null);
    setSelectedSourceIndex(0);
    setSourceFilter('all');
    const temporaryId = crypto.randomUUID();
    setMessages(previous => [...previous, {
      id: temporaryId, conversationId: activeId ?? '', role: 'user', content: question,
      sequenceNo: 0, createdAt: new Date().toISOString(), status: 'PENDING', sources: [],
    }]);
    let conversationId = activeId;
    try {
      await chatApi.streamTurn({ conversationId: activeId, question, clientRequestId: crypto.randomUUID() }, event => {
        if (event.type === 'started') {
          conversationId = event.data.conversationId;
          setActiveId(conversationId);
          setMessages(previous => previous.map(message => message.id === temporaryId
            ? { ...message, id: event.data.requestMessageId, conversationId: event.data.conversationId } : message));
        }
        if (event.type === 'sources') setStreamSources(event.data);
        if (event.type === 'delta') setStreamText(previous => previous + event.data.text);
        if (event.type === 'reset') setStreamText('');
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
      setError(err instanceof Error ? err.message : tr('Could not generate a response.', 'Không thể tạo câu trả lời.'));
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

  const confirmDelete = async () => {
    if (!deleteTarget || sending || isDeleting) return;
    setIsDeleting(true);
    try {
      if (deleteTarget.kind === 'message') {
        const message = deleteTarget.value;
        await chatApi.deleteMessage(message.conversationId, message.id);
        setMessages(previous => previous.filter(item => item.id !== message.id));
        if (focusedMessageId === message.id) setFocusedMessageId(null);
      } else {
        const conversation = deleteTarget.value;
        await chatApi.deleteConversation(conversation.id);
        setConversations(previous => previous.filter(item => item.id !== conversation.id));
        if (activeId === conversation.id) {
          conversationLoadId.current++;
          setActiveId(null);
          setMessages([]);
          setHasOlder(false);
          setSourcesOpen(false);
          setFocusedMessageId(null);
          setLoading(false);
        }
      }
      setError('');
      setDeleteTarget(null);
      showToast(deleteTarget.kind === 'message'
        ? tr('Message deleted.', 'Đã xóa tin nhắn.')
        : tr('Conversation deleted.', 'Đã xóa đoạn chat.'), 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : deleteTarget.kind === 'message'
        ? tr('Could not delete the message.', 'Không thể xóa tin nhắn.')
        : tr('Could not delete the conversation.', 'Không thể xóa đoạn chat.'), 'error');
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const loadOlder = async () => {
    if (!activeId || messages.length === 0) return;
    const loadId = conversationLoadId.current;
    try {
      const older = await chatApi.messages(activeId, messages[0].sequenceNo);
      if (loadId !== conversationLoadId.current) return;
      setMessages(previous => [...older, ...previous]);
      setHasOlder(older.length === 50);
    } catch (err) { if (loadId === conversationLoadId.current) setError(err instanceof Error ? err.message : tr('Could not load older messages.', 'Không thể tải tin nhắn cũ.')); }
  };

  const latestAssistant = [...messages].reverse().find(message => message.role === 'assistant');
  const focusedAssistant = messages.find(message => message.id === focusedMessageId && message.role === 'assistant');
  const sources = sending ? streamSources : (focusedAssistant ?? latestAssistant)?.sources ?? [];
  const filteredConversations = conversations.filter(item => item.title.toLowerCase().includes(search.toLowerCase()));
  const locale = language === 'vi' ? 'vi-VN' : 'en-US';
  const formatTime = (date: string) => new Date(date).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
  const formatDate = (date: string) => new Date(date).toLocaleDateString(locale);
  const formatHistoryGroup = (date: string) => {
    if (formatDate(date) === formatDate(new Date().toISOString())) return tr('TODAY', 'HÔM NAY');
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (formatDate(date) === formatDate(yesterday.toISOString())) return tr('YESTERDAY', 'HÔM QUA');
    return formatDate(date);
  };
  const userName = currentUser?.displayName || currentUser?.name || tr('You', 'Bạn');
  const userInitial = userName.trim().split(/\s+/).map(part => part[0]).slice(-2).join('').toUpperCase() || 'B';
  const activeConversation = conversations.find(item => item.id === activeId);
  const showWelcome = activeId === null && messages.length === 0 && !sending;
  const greeting = now.getHours() < 12 ? tr('Good morning', 'Chào buổi sáng') : now.getHours() < 18 ? tr('Good afternoon', 'Chào buổi chiều') : tr('Good evening', 'Chào buổi tối');
  const welcomeDate = `${new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit' }).format(now)} · ${new Intl.DateTimeFormat(locale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(now)}`;
  const composer = <ChatComposer input={input} onInputChange={setInput} onSend={() => void send()} loading={loading} sending={sending || isDeleting} modelsAvailable={modelsAvailable} language={language} />;
  const showSource = (index: number, messageId?: string) => {
    if (messageId) setFocusedMessageId(messageId);
    setSelectedSourceIndex(index);
    setSourceFilter('all');
    setSourcesOpen(true);
  };

  return (
    <div className="flex h-screen min-h-0 overflow-hidden bg-white font-sans text-[#182744]" style={{ colorScheme: 'light' }}>
      {historyOpen && <button type="button" aria-label={tr('Close conversation history', 'Đóng lịch sử hội thoại')} onClick={() => setHistoryOpen(false)} className="fixed inset-0 z-20 bg-[#07172b]/55 md:hidden" />}
      <aside className={`${historyOpen ? 'flex' : 'hidden'} fixed inset-y-0 left-0 z-30 w-[270px] shrink-0 flex-col bg-[#0c2137] text-[#eaf2ff] md:static md:z-auto md:flex md:w-[238px]`} aria-label={tr('Conversation history', 'Lịch sử hội thoại')}>
        <div className="flex h-[62px] shrink-0 items-center gap-2.5 border-b border-white/10 px-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#1762f4] text-lg font-bold text-white">N</span>
          <div className="min-w-0 flex-1"><strong className="block text-sm leading-tight">NEXORA AI</strong><span className="text-[11px] text-[#9fb2cc]">{tr('AI assistant', 'Trợ lý AI')}</span></div>
          <button type="button" onClick={() => setHistoryOpen(false)} aria-label={tr('Close conversation history', 'Đóng lịch sử hội thoại')} className="rounded-md p-1.5 text-[#9fb2cc] hover:bg-white/10 md:hidden"><X size={17} /></button>
        </div>

        <div className="space-y-3 px-3 pb-3 pt-3">
          <button type="button" onClick={newChat} disabled={sending || isDeleting} className="chat-action flex h-10 w-full items-center justify-center gap-2 rounded-md bg-[#0759ee] text-[13px] font-semibold text-white hover:bg-[#126bff] disabled:opacity-50"><Plus size={19} />{tr('New chat', 'Đoạn chat mới')}</button>
          <label className="flex h-9 items-center gap-2 rounded-md border border-[#344e69] bg-[#112b45] px-2.5 text-[#9fb2cc] focus-within:border-[#70a2ff]">
            <Search size={16} aria-hidden="true" />
            <input value={search} onChange={event => setSearch(event.target.value)} placeholder={tr('Search chats...', 'Tìm đoạn chat...')} aria-label={tr('Search chats', 'Tìm đoạn chat')} className="min-w-0 flex-1 bg-transparent text-xs text-white outline-none placeholder:text-[#9fb2cc]" />
          </label>
          <div className="flex items-center gap-2 rounded-md border-l-[3px] border-[#2f86ff] bg-[#1b3d65] px-3 py-2.5 text-xs font-semibold"><MessageCircle size={17} />{tr('Conversations', 'Hội thoại')}</div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-3">
          {filteredConversations.map((item, index) => {
            const group = formatHistoryGroup(item.updatedAt);
            const previousGroup = index > 0 ? formatHistoryGroup(filteredConversations[index - 1].updatedAt) : null;
            return <React.Fragment key={item.id}>
              {group !== previousGroup && <div className="mb-1 mt-3 border-b border-white/10 pb-1 text-[10px] font-semibold uppercase tracking-wide text-[#9fb2cc]">{group}</div>}
              <div className={`chat-history-item group relative mb-0.5 flex w-full items-center rounded-md border-l-[3px] transition-colors ${activeId === item.id ? 'border-[#2f86ff] bg-[#1b3d65] text-white' : 'border-transparent text-[#d5e2f3] hover:bg-white/10'}`}>
                <button type="button" onClick={() => void openConversation(item.id)} disabled={sending || isDeleting} aria-current={activeId === item.id ? 'page' : undefined}
                  className="flex min-w-0 flex-1 items-center gap-2 py-2.5 pl-2 pr-8 text-left text-xs disabled:opacity-60 md:pr-2">
                  <span className="min-w-0 flex-1 truncate" title={item.title}>{item.title}</span>
                  <time className="hidden shrink-0 text-[10px] text-[#9fb2cc] group-hover:opacity-0 group-focus-within:opacity-0 md:block">{formatTime(item.updatedAt)}</time>
                </button>
                <button type="button" onClick={() => setDeleteTarget({ kind: 'conversation', value: item })} disabled={sending || isDeleting}
                  aria-label={tr(`Delete conversation ${item.title}`, `Xóa đoạn chat ${item.title}`)} title={tr('Delete conversation', 'Xóa đoạn chat')}
                  className="absolute right-1 top-1/2 -translate-y-1/2 rounded p-1.5 text-[#9fb2cc] opacity-100 hover:bg-white/10 hover:text-rose-300 focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#8dbaff] disabled:opacity-40 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
                  <Trash2 size={14} />
                </button>
              </div>
            </React.Fragment>;
          })}
          {!loading && filteredConversations.length === 0 && <p className="px-2 py-5 text-center text-xs text-[#9fb2cc]">{search ? tr('No chats found.', 'Không tìm thấy đoạn chat.') : tr('No chats yet.', 'Chưa có đoạn chat nào.')}</p>}
          {hasMoreConversations && <button type="button" onClick={async () => { try { const more = await chatApi.conversations(conversations.length); setConversations(previous => [...previous, ...more]); setHasMoreConversations(more.length === 50); } catch (err) { setError(err instanceof Error ? err.message : tr('Could not load conversations.', 'Không thể tải hội thoại.')); } }} className="px-2 py-2 text-xs font-semibold text-[#8dbaff] hover:underline">{tr('More conversations', 'Xem thêm hội thoại')}</button>}
        </div>

        <div className="shrink-0 border-t border-white/10 p-3">
          <button type="button" onClick={() => navigate({ to: '/dashboard' })} className="mb-3 flex w-full items-center justify-center gap-2 rounded-md border border-[#344e69] px-3 py-2.5 text-xs text-[#d5e2f3] hover:bg-white/10"><LayoutDashboard size={15} />{tr('Management dashboard', 'Dashboard Quản lý')}</button>
          <button type="button" onClick={() => navigate({ to: '/account' })} className="flex w-full items-center gap-2.5 rounded-md px-1 py-1.5 text-left hover:bg-white/10">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1762f4] text-xs font-bold text-white">{userInitial}</span><span className="min-w-0"><strong className="block truncate text-xs">{userName}</strong><span className="block truncate text-[10px] text-[#9fb2cc]">{currentUser?.role || tr('Account', 'Tài khoản')}</span></span>
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-[62px] shrink-0 items-center justify-between gap-3 border-b border-[#e1e8f3] bg-white px-4 lg:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button type="button" onClick={() => setHistoryOpen(true)} aria-label={tr('Open conversation history', 'Mở lịch sử hội thoại')} className="rounded-md p-1.5 text-[#52678b] hover:bg-[#eef3fc] md:hidden"><Menu size={19} /></button>
            <h1 className="max-w-[360px] truncate text-[17px] font-bold text-[#102456]">{activeConversation?.title || tr('AI Assistant', 'Trợ lý AI')}</h1>
            <span className="hidden items-center gap-2 rounded-md border border-[#dce5f2] px-2.5 py-2 text-xs font-medium text-[#243653] lg:inline-flex"><FolderOpen size={16} />{tr('Internal documents', 'Tài liệu nội bộ')}</span>
            <button type="button" onClick={() => navigate({ to: '/data-repo' })} className="hidden rounded-md border border-[#dce5f2] px-3 py-2 text-xs font-medium text-[#1762f4] hover:bg-[#f3f7ff] lg:inline-flex">{tr('Open knowledge base', 'Vào kho tri thức')}</button>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-4">
            <LanguageSwitcher />
            {!showWelcome && <button type="button" onClick={() => setSourcesOpen(true)} aria-label={tr('Open sources', 'Mở nguồn tham khảo')} className="rounded-md p-2 text-[#52678b] hover:bg-[#eef3fc] min-[1180px]:hidden"><FileText size={18} /></button>}
            <button type="button" onClick={() => navigate({ to: '/account' })} className="flex items-center gap-2 border-l border-[#e1e8f3] pl-3 text-left hover:opacity-80">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1762f4] text-xs font-bold text-white">{userInitial}</span><span className="hidden max-w-[110px] sm:block"><strong className="block truncate text-xs text-[#102456]">{userName}</strong><span className="block truncate text-[10px] text-[#7d8eaa]">{currentUser?.role || tr('Account', 'Tài khoản')}</span></span>
            </button>
          </div>
        </header>

        <div className="flex min-h-0 flex-1">
          <main className="flex min-w-0 flex-1 flex-col bg-white">
            {showWelcome ? <div className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto px-5 py-10 sm:px-8">
              <div className="w-full max-w-[760px] -translate-y-4 sm:-translate-y-8">
                <p className="chat-welcome-date mb-3 text-xs font-medium text-[#7186ac] sm:text-sm">{welcomeDate}</p>
                <h2 className="chat-welcome-title text-[clamp(2rem,4vw,3rem)] font-bold leading-tight tracking-tight text-[#102456]">{greeting}, {userName}.</h2>
                <p className="chat-welcome-subtitle mb-7 mt-1 text-[clamp(1rem,2vw,1.35rem)] text-[#66799c]">{tr('How can I help you with your work today?', 'Tôi có thể giúp gì cho công việc của bạn hôm nay?')}</p>
                <div className="chat-welcome-composer">{composer}</div>
                {error && <div role="alert" className="mt-5 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}{!modelsAvailable && <button type="button" onClick={() => navigate({ to: '/account' })} className="ml-2 font-semibold text-[#1762f4] underline">{tr('Set up API key', 'Thiết lập khóa API')}</button>}</div>}
              </div>
            </div> : <>
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-7">
              <div className="mx-auto max-w-[800px]">
                {loading && <p className="flex items-center gap-2 py-5 text-sm text-[#8291aa]"><LoaderCircle size={17} className="animate-spin" />{tr('Loading conversations...', 'Đang tải hội thoại...')}</p>}
                {hasOlder && <button type="button" onClick={() => void loadOlder()} className="mb-4 block w-full text-center text-xs font-semibold text-[#1762f4] hover:underline">{tr('Load older messages', 'Tải tin nhắn cũ hơn')}</button>}

                {messages.map(message => {
                  const isUser = message.role === 'user';
                  const attachments = isUser ? [] : [...new Map(message.sources.map((source, index) => [source.documentId, { source, index }] as const)).values()];
                  return <article key={message.id} className={`group border-b border-[#e6ebf4] py-5 first:pt-1 ${message.id === messages[messages.length - 1]?.id ? 'chat-message-enter' : ''}`}>
                    <div className="flex items-start gap-4">
                      <span aria-hidden="true" className={`flex h-9 w-9 shrink-0 items-center justify-center font-bold ${isUser ? 'rounded-full bg-[#e3efff] text-xs text-[#1762f4]' : 'rounded-md bg-[#1762f4] text-lg text-white'}`}>{isUser ? userInitial : 'N'}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2"><strong className={`text-[13px] ${isUser ? 'text-[#102456]' : 'text-[#1762f4]'}`}>{isUser ? tr('You', 'Bạn') : 'NEXORA AI'}</strong><div className="flex items-center gap-2 text-[11px] text-[#7d8eaa]"><time>{formatTime(message.createdAt)} {formatDate(message.createdAt)}</time><button type="button" onClick={() => setDeleteTarget({ kind: 'message', value: message })} disabled={sending || isDeleting || !activeId} aria-label={tr('Delete message', 'Xóa tin nhắn')} title={tr('Delete message', 'Xóa tin nhắn')} className="rounded p-1 opacity-0 hover:bg-rose-50 hover:text-rose-600 focus:opacity-100 disabled:hidden group-hover:opacity-100"><Trash2 size={14} /></button></div></div>
                        {isUser ? <p className="mt-2 whitespace-pre-wrap text-[14px] leading-relaxed text-[#263b63]">{message.content}</p>
                          : <div className="mt-3"><ChatAnswerContent content={message.content} sources={message.sources} onSource={index => showSource(index, message.id)} /></div>}
                        {message.status === 'FAILED' && <p className="mt-2 text-xs text-rose-600">{tr('Could not generate a response for this message.', 'Không thể tạo câu trả lời cho tin nhắn này.')}</p>}
                        {!isUser && attachments.length > 0 && <div className="mt-5 flex flex-wrap items-center gap-1.5"><span className="mr-1 text-[11px] text-[#66799c]">{tr('Document sources:', 'Nguồn tài liệu:')}</span>{attachments.slice(0, 3).map(({ source, index }) => <button key={source.documentId} type="button" onClick={() => showSource(index, message.id)} title={source.fileName} className="inline-flex max-w-[210px] items-center gap-1 rounded-md border border-[#dce5f2] px-2 py-1.5 text-[11px] text-[#33496e] hover:bg-[#edf4ff]"><FileText size={13} className="shrink-0 text-[#1762f4]" /><span className="truncate">{source.fileName}</span></button>)}{attachments.length > 3 && <button type="button" onClick={() => showSource(0, message.id)} className="text-[11px] text-[#1762f4] hover:underline">+{attachments.length - 3} {tr('sources', 'nguồn')}</button>}</div>}
                        {!isUser && message.modelName && <p className="mt-2 text-[11px] text-[#91a0ba]">{message.modelName}</p>}
                      </div>
                    </div>
                  </article>;
                })}

                {sending && <article className="chat-message-enter flex items-start gap-4 py-5"><span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#1762f4] text-lg font-bold text-white">N</span><div className="min-w-0 flex-1"><strong className="text-[13px] text-[#1762f4]">NEXORA AI</strong>{streamText ? <div className="mt-3"><ChatAnswerContent content={streamText} sources={streamSources} onSource={index => showSource(index)} /></div> : <p className="mt-3 flex items-center gap-2 text-sm text-[#7587a5]"><span className="chat-thinking-dots" aria-hidden="true"><i /><i /><i /></span>{tr('Finding documents and generating a response...', 'Đang tìm tài liệu và tạo câu trả lời...')}</p>}</div></article>}
                {error && <div role="alert" className="my-4 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}{!modelsAvailable && <button type="button" onClick={() => navigate({ to: '/account' })} className="ml-2 font-semibold text-[#1762f4] underline">{tr('Set up API key', 'Thiết lập khóa API')}</button>}</div>}
                <div ref={endRef} />
              </div>
            </div>

            <div className="shrink-0 border-t border-[#e6ebf4] bg-white px-4 pb-3 pt-2 sm:px-6 lg:px-7">
              <div className="mx-auto max-w-[800px]">{composer}</div>
            </div>
            </>}
          </main>

          {!showWelcome && <>
            {sourcesOpen && <button type="button" aria-label={tr('Close sources', 'Đóng nguồn tham khảo')} onClick={() => setSourcesOpen(false)} className="fixed inset-0 z-30 bg-[#07172b]/55 min-[1180px]:hidden" />}
            <ChatSourcesPanel sources={sources} selectedIndex={selectedSourceIndex} filter={sourceFilter} open={sourcesOpen} onFilterChange={setSourceFilter} onSelect={setSelectedSourceIndex} onClose={() => setSourcesOpen(false)} onManageDocuments={() => navigate({ to: '/data-repo' })} />
          </>}
        </div>
      </div>
      <ConfirmModal
        isOpen={deleteTarget !== null}
        onClose={() => { if (!isDeleting) setDeleteTarget(null); }}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title={deleteTarget?.kind === 'conversation' ? tr('Delete conversation', 'Xóa đoạn chat') : tr('Delete message', 'Xóa tin nhắn')}
        message={deleteTarget?.kind === 'conversation'
          ? tr(`Delete "${deleteTarget.value.title}" from your history?`, `Xóa đoạn chat "${deleteTarget.value.title}" khỏi lịch sử?`)
          : tr('Delete this message from the conversation?', 'Xóa tin nhắn này khỏi hội thoại?')}
        confirmText={tr('Delete', 'Xóa')}
      />
    </div>
  );
};

export default ChatPage;

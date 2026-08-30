import React, { useState, useRef, useEffect } from 'react';
import { Header } from '@/components/header';
import { useApp } from '@/context/AppContext';
import { ContextSidebar } from './ContextSidebar';
import { PromptModal } from './PromptModal';
import {
  Sparkles,
  Paperclip,
  LayoutTemplate,
  Mic,
  Send,
  ThumbsUp,
  ThumbsDown,
  Copy,
  RotateCcw,
  FileText
} from 'lucide-react';

export const ChatPage: React.FC = () => {
  const { chatMessages, addChatMessage, currentUser, showToast } = useApp();
  const [inputText, setInputText] = useState('');
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isTyping]);

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    addChatMessage({
      sender: 'user',
      text: text.trim()
    });

    setInputText('');
    setIsTyping(true);

    // AI Response Simulation
    setTimeout(() => {
      setIsTyping(false);
      addChatMessage({
        sender: 'ai',
        text: `Dưới đây là thông tin tóm tắt tổng hợp dựa trên yêu cầu của bạn về **"${text}"**:

- **Tiến độ tổng thể:** 68% hoàn thành (theo kế hoạch Phase 2).
- **Hạng mục nổi bật:**
  - Nền tảng cốt lõi: 100% hoàn thành ✅
  - Module Phòng họp & Lịch: 85% hoàn thành
  - Module AI Assistant & RAG: 65% hoàn thành

Tôi có thể hỗ trợ tạo báo cáo chi tiết hoặc xuất thành file PDF/Excel nếu bạn cần.`,
        sources: [
          'Báo cáo tiến độ dự án.pdf (Trang 3)',
          'Biên bản họp 14-05.docx (Trang 2)'
        ],
        suggestedActions: [
          'Tạo báo cáo chi tiết',
          'Gửi tóm tắt qua email phòng ban',
          'Lên lịch họp rà soát tiến độ'
        ],
        attachedDocs: [
          { name: 'Báo cáo tiến độ dự án.pdf', type: 'pdf' },
          { name: 'Biên bản họp 14-05.docx', type: 'docx' }
        ]
      });
    }, 1200);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Đã sao chép vào bộ nhớ tạm');
  };

  const toggleVoiceRecording = () => {
    if (isVoiceRecording) {
      setIsVoiceRecording(false);
      showToast('Đã dừng nhận diện giọng nói', 'info');
    } else {
      setIsVoiceRecording(true);
      showToast('Đang lắng nghe... (Nói vào micro)', 'info');
      setTimeout(() => {
        setIsVoiceRecording(false);
        setInputText('Tổng hợp tiến độ sprint hiện tại và các công việc khẩn cấp');
      }, 3500);
    }
  };

  return (
    <div className="flex-1 flex h-full bg-slate-50 dark:bg-black overflow-hidden transition-colors">
      {/* Main Chat Center Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-white dark:bg-zinc-950 transition-colors">
        <Header />

        {/* Chat Stream Messages List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="max-w-3xl mx-auto space-y-4">
            {chatMessages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`chat ${isUser ? 'chat-end' : 'chat-start'}`}
                >
                  <div className="chat-image avatar">
                    {!isUser ? (
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-xs relative">
                        <span>N</span>
                        <Sparkles className="w-2.5 h-2.5 absolute -top-0.5 -right-0.5 text-blue-200 fill-blue-200" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-slate-700 dark:bg-zinc-700 flex items-center justify-center text-white font-bold text-xs">
                        {currentUser.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="chat-header text-xs opacity-70 mb-1 flex items-center gap-1.5">
                    <span className="font-semibold text-slate-800 dark:text-zinc-200">
                      {isUser ? currentUser.name : 'NEXORA AI'}
                    </span>
                    <time className="text-[10px] text-slate-400 dark:text-zinc-500">{msg.timestamp}</time>
                  </div>

                  <div
                    className={`chat-bubble text-xs leading-relaxed ${
                      isUser
                        ? 'chat-bubble-primary text-white'
                        : 'bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-200 space-y-2'
                    }`}
                  >
                    <div className="space-y-2 whitespace-pre-wrap">
                      {msg.text.split('\n\n').map((paragraph, pIdx) => (
                        <p key={pIdx}>{paragraph}</p>
                      ))}
                    </div>

                    {/* Attached Documents if present */}
                    {!isUser && msg.attachedDocs && msg.attachedDocs.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-200/60 dark:border-zinc-800">
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400">Tài liệu:</span>
                        {msg.attachedDocs.map((doc: any, dIdx: number) => (
                          <div
                            key={dIdx}
                            onClick={() => showToast(`Xem tài liệu ${doc.name}`, 'info')}
                            className="badge badge-sm badge-outline gap-1 text-slate-700 dark:text-zinc-200 cursor-pointer hover:badge-primary"
                          >
                            <FileText className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                            <span>{doc.name}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Suggested Action Buttons if present */}
                    {!isUser && msg.suggestedActions && msg.suggestedActions.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {msg.suggestedActions.map((action, aIdx) => (
                          <button
                            key={aIdx}
                            onClick={() => handleSendMessage(action)}
                            className="btn btn-xs btn-outline btn-primary gap-1 font-medium"
                          >
                            <Sparkles className="w-3 h-3 text-blue-500" />
                            <span>{action}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* AI Message Action Buttons */}
                  {!isUser && (
                    <div className="chat-footer opacity-70 flex items-center gap-1 mt-1">
                      <button
                        onClick={() => handleCopy(msg.text)}
                        className="btn btn-xs btn-ghost btn-square"
                        title="Sao chép"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => showToast('Đã ghi nhận phản hồi tích cực', 'success')}
                        className="btn btn-xs btn-ghost btn-square"
                        title="Hữu ích"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => showToast('Đã ghi nhận phản hồi cải thiện', 'info')}
                        className="btn btn-xs btn-ghost btn-square"
                        title="Chưa chính xác"
                      >
                        <ThumbsDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleSendMessage('Tạo lại câu trả lời')}
                        className="btn btn-xs btn-ghost btn-square"
                        title="Tạo lại"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {isTyping && (
              <div className="chat chat-start">
                <div className="chat-image avatar">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
                    N
                  </div>
                </div>
                <div className="chat-bubble bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center gap-1.5 p-3">
                  <span className="loading loading-dots loading-xs text-primary" />
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>
        </div>

        {/* Input Bar Area */}
        <div className="p-4 border-t border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 transition-colors">
          <div className="max-w-3xl mx-auto">
            <div className="border border-slate-200 dark:border-zinc-800 rounded-box bg-slate-50/50 dark:bg-zinc-900 p-2.5 focus-within:border-blue-500 dark:focus-within:border-zinc-700 transition-all shadow-xs">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Hỏi bất kỳ điều gì hoặc yêu cầu phân tích dữ liệu..."
                rows={2}
                className="w-full bg-transparent px-2 py-1 text-xs text-slate-800 dark:text-zinc-100 focus:outline-none resize-none placeholder:text-slate-400 dark:placeholder:text-zinc-500"
              />

              <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/50 dark:border-zinc-800">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setIsPromptModalOpen(true)}
                    className="btn btn-xs btn-ghost gap-1.5 text-slate-600 dark:text-zinc-300 font-semibold"
                  >
                    <LayoutTemplate className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Mẫu prompt</span>
                  </button>

                  <button
                    onClick={() => showToast('Đính kèm tài liệu phân tích', 'info')}
                    className="btn btn-xs btn-ghost btn-square text-slate-500 dark:text-zinc-400"
                    title="Đính kèm tài liệu"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>

                  <button
                    onClick={toggleVoiceRecording}
                    className={`btn btn-xs btn-square ${
                      isVoiceRecording
                        ? 'btn-error animate-pulse text-white'
                        : 'btn-ghost text-slate-500 dark:text-zinc-400'
                    }`}
                    title="Nhập bằng giọng nói"
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 hidden sm:inline-flex items-center gap-1">
                    Nhấn <kbd className="kbd kbd-xs bg-slate-100 dark:bg-zinc-800 text-[10px]">Enter ↵</kbd> để gửi
                  </span>
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={!inputText.trim()}
                    className="btn btn-sm btn-primary text-white text-xs font-semibold gap-1.5 shadow-xs"
                  >
                    <span>Gửi</span>
                    <Send className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Context & Source References Sidebar */}
      <ContextSidebar />

      {/* Prompt Templates Modal */}
      <PromptModal
        isOpen={isPromptModalOpen}
        onClose={() => setIsPromptModalOpen(false)}
        onSelectPrompt={(text) => setInputText(text)}
      />
    </div>
  );
};
export default ChatPage;

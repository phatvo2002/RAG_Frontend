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
        attachedDocs: [
          { name: 'Báo cáo tiến độ dự án.pdf', type: 'pdf' },
          { name: 'Biên bản họp 14-05.docx', type: 'docx' }
        ],
        suggestedActions: [
          'Tạo báo cáo chi tiết',
          'Lên lịch cuộc họp rà soát',
          'Xuất dữ liệu tiến độ'
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
    <div className="flex-1 flex h-full bg-slate-50 dark:bg-slate-950 overflow-hidden transition-colors">
      {/* Main Chat Center Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-white dark:bg-slate-900 transition-colors">
        <Header />

        {/* Chat Stream Messages List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {chatMessages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-xs shrink-0 relative">
                      <span>N</span>
                      <Sparkles className="w-2.5 h-2.5 absolute -top-0.5 -right-0.5 text-blue-200 fill-blue-200" />
                    </div>
                  )}

                  <div className={`space-y-2 max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-2 px-1">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                        {isUser ? currentUser.name : 'NEXORA AI'}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">{msg.timestamp}</span>
                    </div>

                    <div
                      className={`p-4 rounded-2xl text-xs leading-relaxed ${
                        isUser
                          ? 'bg-blue-600 text-white rounded-tr-xs shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/70 text-slate-800 dark:text-slate-200 rounded-tl-xs space-y-3'
                      }`}
                    >
                      <div className="space-y-2 whitespace-pre-wrap">
                        {msg.text.split('\n\n').map((paragraph, pIdx) => (
                          <p key={pIdx}>{paragraph}</p>
                        ))}
                      </div>

                      {/* Attached Documents if present */}
                      {!isUser && msg.attachedDocs && msg.attachedDocs.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Tài liệu tham chiếu:</span>
                          {msg.attachedDocs.map((doc: any, dIdx: number) => (
                            <div
                              key={dIdx}
                              onClick={() => showToast(`Xem tài liệu ${doc.name}`, 'info')}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:border-blue-300 dark:hover:border-blue-500 cursor-pointer shadow-2xs transition-colors"
                            >
                              <FileText className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                              <span>{doc.name}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Suggested Action Buttons if present */}
                      {!isUser && msg.suggestedActions && msg.suggestedActions.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          {msg.suggestedActions.map((action, aIdx) => (
                            <button
                              key={aIdx}
                              onClick={() => handleSendMessage(action)}
                              className="px-2.5 py-1 bg-blue-50/80 dark:bg-blue-950/70 hover:bg-blue-100/80 dark:hover:bg-blue-900/80 text-blue-700 dark:text-blue-300 rounded-lg text-[11px] font-medium transition-colors border border-blue-200/60 dark:border-blue-800/60 flex items-center gap-1 cursor-pointer"
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
                      <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500 px-1 text-xs">
                        <button
                          onClick={() => handleCopy(msg.text)}
                          className="p-1 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Sao chép"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => showToast('Đã ghi nhận phản hồi tích cực', 'success')}
                          className="p-1 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Hữu ích"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => showToast('Đã ghi nhận phản hồi cải thiện', 'info')}
                          className="p-1 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Chưa chính xác"
                        >
                          <ThumbsDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleSendMessage('Tạo lại câu trả lời')}
                          className="p-1 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Tạo lại"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-xs shrink-0">
                  N
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>
        </div>

        {/* Input Bar Area */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
          <div className="max-w-3xl mx-auto">
            <div className="border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50 p-2 focus-within:border-blue-500 dark:focus-within:border-blue-500 focus-within:bg-white dark:focus-within:bg-slate-800 transition-all shadow-2xs">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Hỏi bất kỳ điều gì hoặc yêu cầu phân tích dữ liệu..."
                rows={2}
                className="w-full bg-transparent px-2 py-1 text-xs text-slate-800 dark:text-slate-100 focus:outline-none resize-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />

              <div className="flex items-center justify-between pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setIsPromptModalOpen(true)}
                    className="px-2.5 py-1 text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <LayoutTemplate className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Mẫu prompt</span>
                  </button>

                  <button
                    onClick={() => showToast('Đính kèm tài liệu phân tích', 'info')}
                    className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 rounded-lg transition-colors cursor-pointer"
                    title="Đính kèm tài liệu"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>

                  <button
                    onClick={toggleVoiceRecording}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      isVoiceRecording
                        ? 'bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 animate-pulse'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
                    }`}
                    title="Nhập bằng giọng nói"
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputText.trim()}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <span>Gửi</span>
                  <Send className="w-3 h-3" />
                </button>
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

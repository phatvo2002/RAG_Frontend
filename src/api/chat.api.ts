import { API_BASE_URL } from '@/constants';
import { apiClient, refreshAccessToken, tokenStorage } from './client';

export interface ChatModel { id: string; name: string; provider: string; model: string }
export interface ChatConversation { id: string; title: string; updatedAt: string }
export interface ChatSource { documentId: string; chunkId: string; fileName: string; score: number; pageNo?: number | null; charStart?: number | null; charEnd?: number | null }
export interface ChatMessage {
  id: string; conversationId: string; role: 'user' | 'assistant'; content: string;
  sequenceNo: number; createdAt: string; status?: string | null;
  modelProvider?: string | null; modelName?: string | null; sources: ChatSource[];
}
export type ChatEvent =
  | { type: 'started'; data: { conversationId: string; requestMessageId: string; turnId: string } }
  | { type: 'sources'; data: ChatSource[] }
  | { type: 'delta'; data: { text: string } }
  | { type: 'completed'; data: ChatMessage }
  | { type: 'error'; data: { message: string } };

async function streamTurn(body: object, onEvent: (event: ChatEvent) => void, signal?: AbortSignal): Promise<void> {
  const send = (token: string | null) => fetch(`${API_BASE_URL}/api/chat/turns/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body), signal,
  });
  let response = await send(tokenStorage.getAccessToken());
  if (response.status === 401) {
    const token = await refreshAccessToken();
    if (token) response = await send(token);
  }
  if (!response.ok) throw new Error(response.status === 409 ? 'Tin nhắn này đã được gửi. Vui lòng tải lại hội thoại.' : `Không thể gửi tin nhắn (HTTP ${response.status}).`);
  if (!response.body) throw new Error('Máy chủ không hỗ trợ truyền câu trả lời.');
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let completed = false;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer = (buffer + decoder.decode(value, { stream: true })).replace(/\r\n/g, '\n');
    let end: number;
    while ((end = buffer.indexOf('\n\n')) >= 0) {
      const block = buffer.slice(0, end);
      buffer = buffer.slice(end + 2);
      const name = block.split('\n').find(line => line.startsWith('event:'))?.slice(6).trim();
      const json = block.split('\n').filter(line => line.startsWith('data:')).map(line => line.slice(5).trim()).join('\n');
      if (!name || !json) continue;
      const event = { type: name, data: JSON.parse(json) } as ChatEvent;
      onEvent(event);
      if (event.type === 'error') throw new Error(event.data.message);
      if (event.type === 'completed') completed = true;
    }
  }
  if (!completed) throw new Error('Kết nối bị ngắt trước khi câu trả lời được lưu.');
}

export const chatApi = {
  models: () => apiClient<{ defaultModel: string; models: ChatModel[]; configurationError?: string | null }>('/api/chat/models'),
  conversations: (skip = 0) => apiClient<ChatConversation[]>(`/api/chat/conversations?skip=${skip}`),
  messages: (id: string, beforeSequenceNo?: number) => apiClient<ChatMessage[]>(`/api/chat/conversations/${id}/messages${beforeSequenceNo ? `?beforeSequenceNo=${beforeSequenceNo}` : ''}`),
  deleteMessage: (conversationId: string, messageId: string) => apiClient(`/api/chat/conversations/${conversationId}/messages/${messageId}`, { method: 'DELETE' }),
  streamTurn,
};

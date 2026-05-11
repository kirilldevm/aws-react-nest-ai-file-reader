import { apiClient } from '@/lib/api-client';
import { chatRequestSchema, chatResponseSchema } from '@/schemas/chat.schema';
import type { ChatRequest, ChatResponse } from '@/types/chat.types';

export class ChatService {
  async sendMessage(input: ChatRequest): Promise<ChatResponse> {
    const body = chatRequestSchema.parse(input);
    const { data } = await apiClient.post<unknown>('/chat', body);
    return chatResponseSchema.parse(data);
  }
}

export const chatService = new ChatService();

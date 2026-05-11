import { useMutation } from '@tanstack/react-query';
import { chatService } from '@/services/chat.service';
import type { ChatRequest } from '@/types/chat.types';

export function useChatMutation() {
  return useMutation({
    mutationFn: (input: ChatRequest) => chatService.sendMessage(input),
  });
}

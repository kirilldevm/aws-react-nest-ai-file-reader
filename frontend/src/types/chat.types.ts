import type { z } from 'zod';
import type { chatRequestSchema, chatResponseSchema } from '@/schemas/chat.schema';

export type ChatRequest = z.infer<typeof chatRequestSchema>;
export type ChatResponse = z.infer<typeof chatResponseSchema>;

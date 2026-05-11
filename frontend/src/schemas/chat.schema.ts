import { z } from 'zod';

export const chatRequestSchema = z.object({
  email: z.email(),
  message: z.string().min(1).max(8000),
});

export const chatResponseSchema = z.object({
  answer: z.string(),
});

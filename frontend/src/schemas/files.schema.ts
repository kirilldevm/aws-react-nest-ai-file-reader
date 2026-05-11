import { z } from 'zod';

export const fileProcessingStatusSchema = z.enum([
  'pending',
  'success',
  'error',
  'not_uploaded',
]);

export const fileStatusResponseSchema = z.object({
  status: fileProcessingStatusSchema,
  updatedAt: z.string().nullable(),
  error: z.string().optional(),
});

export const filePresignResponseSchema = z.object({
  uploadUrl: z.string().url(),
  key: z.string(),
  method: z.literal('PUT'),
  expiresInSeconds: z.number(),
});

export const filePresignRequestSchema = z.object({
  email: z.email(),
  filename: z.string().min(1),
  contentType: z.literal('application/pdf'),
  fileSize: z
    .number()
    .int()
    .positive()
    .max(10 * 1024 * 1024),
});

export const fileDeleteResponseSchema = z.object({
  deleted: z.boolean(),
});

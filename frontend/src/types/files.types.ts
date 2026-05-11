import type { z } from 'zod';
import type {
  fileDeleteResponseSchema,
  filePresignRequestSchema,
  filePresignResponseSchema,
  fileProcessingStatusSchema,
  fileStatusResponseSchema,
} from '@/schemas/files.schema';

export type FileProcessingStatus = z.infer<typeof fileProcessingStatusSchema>;
export type FileStatusResponse = z.infer<typeof fileStatusResponseSchema>;
export type FilePresignResponse = z.infer<typeof filePresignResponseSchema>;
export type FilePresignRequest = z.infer<typeof filePresignRequestSchema>;
export type FileDeleteResponse = z.infer<typeof fileDeleteResponseSchema>;

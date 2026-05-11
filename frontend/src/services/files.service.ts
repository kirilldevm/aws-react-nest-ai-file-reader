import axios from 'axios';
import { apiClient } from '@/lib/api-client';
import {
  fileDeleteResponseSchema,
  filePresignRequestSchema,
  filePresignResponseSchema,
  fileStatusResponseSchema,
} from '@/schemas/files.schema';
import type {
  FileDeleteResponse,
  FilePresignRequest,
  FilePresignResponse,
  FileStatusResponse,
} from '@/types/files.types';

export class FilesService {
  async getStatus(email: string): Promise<FileStatusResponse> {
    const { data } = await apiClient.get<unknown>('/files/status', {
      params: { email },
    });
    return fileStatusResponseSchema.parse(data);
  }

  async requestPresign(input: FilePresignRequest): Promise<FilePresignResponse> {
    const body = filePresignRequestSchema.parse(input);
    const { data } = await apiClient.post<unknown>('/files/presign', body);
    return filePresignResponseSchema.parse(data);
  }

  /**
   * PUT the raw file bytes to S3 using the presigned URL (not the Nest base URL).
   */
  async uploadToPresignedUrl(
    uploadUrl: string,
    file: File,
    contentType: string,
  ): Promise<void> {
    await axios.put(uploadUrl, file, {
      headers: { 'Content-Type': contentType },
      timeout: 120_000,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });
  }

  async delete(email: string): Promise<FileDeleteResponse> {
    const { data } = await apiClient.delete<unknown>('/files', {
      params: { email },
    });
    return fileDeleteResponseSchema.parse(data);
  }
}

export const filesService = new FilesService();

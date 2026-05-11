export type FileStatus = 'pending' | 'success' | 'error';

export type FileRecord = {
  userEmail: string;
  status: FileStatus;
  s3Key: string;
  originalFilename: string;
  contentType: string;
  fileSizeBytes: number;
  createdAt: string;
  updatedAt: string;
  processingError?: string;
};

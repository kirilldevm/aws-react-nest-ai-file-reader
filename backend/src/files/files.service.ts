import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID, createHash } from 'crypto';
import { PutCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { DynamoDbService } from '../common/aws/dynamodb/dynamodb.service';
import { S3Service } from '../common/aws/s3/s3.service';
import { CreateFilePresignDto } from './dto/create-file-presign.dto';
import { MAX_FILE_SIZE_BYTES, PDF_MIME_TYPE } from './constants/files.constants';

type FileStatus = 'pending' | 'success' | 'error';
type FileRecord = {
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

@Injectable()
export class FilesService {
  constructor(
    private readonly s3Service: S3Service,
    private readonly dynamoDbService: DynamoDbService,
  ) {}

  async createPresign(dto: CreateFilePresignDto): Promise<{
    uploadUrl: string;
    key: string;
    method: 'PUT';
    expiresInSeconds: number;
  }> {
    this.validatePdfInput(dto);

    const key = this.buildS3Key(dto.email);
    const expiresInSeconds = this.s3Service.getDefaultPresignExpiresSeconds();
    const now = new Date().toISOString();
    const normalizedEmail = dto.email.toLowerCase().trim();

    const uploadUrl = await this.s3Service.createUploadPresignedUrl({
      key,
      contentType: PDF_MIME_TYPE,
      expiresInSeconds,
      metadata: {
        userEmail: normalizedEmail,
      },
    });

    await this.dynamoDbService.getClient().send(
      new PutCommand({
        TableName: this.dynamoDbService.getTableName(),
        Item: {
          userEmail: normalizedEmail,
          status: 'pending',
          s3Key: key,
          originalFilename: dto.filename,
          contentType: dto.contentType,
          fileSizeBytes: dto.fileSize,
          createdAt: now,
          updatedAt: now,
        } satisfies FileRecord,
      }),
    );

    return {
      uploadUrl,
      key,
      method: 'PUT',
      expiresInSeconds,
    };
  }

  async getStatus(email: string): Promise<{
    status: FileStatus | 'not_uploaded';
    updatedAt: string | null;
    error?: string;
  }> {
    const normalizedEmail = email.toLowerCase().trim();
    const result = await this.dynamoDbService.getClient().send(
      new GetCommand({
        TableName: this.dynamoDbService.getTableName(),
        Key: {
          userEmail: normalizedEmail,
        },
      }),
    );

    if (!result.Item) {
      return {
        status: 'not_uploaded',
        updatedAt: null,
      };
    }

    return {
      status: result.Item.status as FileStatus,
      updatedAt: (result.Item.updatedAt as string) ?? null,
      error: result.Item.processingError as string | undefined,
    };
  }

  private validatePdfInput(dto: CreateFilePresignDto): void {
    const filename = dto.filename.toLowerCase();
    const contentType = dto.contentType.toLowerCase();

    if (!filename.endsWith('.pdf')) {
      throw new BadRequestException('Only .pdf files are allowed');
    }

    if (contentType !== PDF_MIME_TYPE) {
      throw new BadRequestException('Only application/pdf content type is allowed');
    }

    if (dto.fileSize > MAX_FILE_SIZE_BYTES) {
      throw new BadRequestException('Maximum PDF size is 10MB');
    }
  }

  private buildS3Key(email: string): string {
    const emailHash = createHash('sha256')
      .update(email.toLowerCase().trim())
      .digest('hex')
      .slice(0, 16);

    return `uploads/${emailHash}/${randomUUID()}.pdf`;
  }
}

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3Service {
  private readonly s3Client: S3Client;
  private readonly bucket: string;
  private readonly presignExpiresSeconds: number;

  constructor(private readonly configService: ConfigService) {
    const region = this.configService.getOrThrow<string>('config.aws.region');
    const accessKeyId = this.configService.get<string>(
      'config.aws.accessKeyId',
    );
    const secretAccessKey = this.configService.get<string>(
      'config.aws.secretAccessKey',
    );

    const hasStaticCredentials = Boolean(accessKeyId && secretAccessKey);

    this.s3Client = new S3Client({
      region,
      ...(hasStaticCredentials
        ? {
            credentials: {
              accessKeyId: accessKeyId!,
              secretAccessKey: secretAccessKey!,
            },
          }
        : {}),
    });

    this.bucket = this.configService.getOrThrow<string>('config.aws.bucket');
    this.presignExpiresSeconds = this.configService.getOrThrow<number>(
      'config.aws.presignExpiresSeconds',
    );
  }

  getClient(): S3Client {
    return this.s3Client;
  }

  getDefaultPresignExpiresSeconds(): number {
    return this.presignExpiresSeconds;
  }

  async createUploadPresignedUrl(input: {
    key: string;
    contentType?: string;
    expiresInSeconds?: number;
    metadata?: Record<string, string>;
  }): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: input.key,
      ContentType: input.contentType,
      Metadata: input.metadata,
    });

    return getSignedUrl(this.s3Client, command, {
      expiresIn: input.expiresInSeconds ?? this.presignExpiresSeconds,
    });
  }
}

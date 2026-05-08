import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

@Injectable()
export class DynamoDbService {
  private readonly client: DynamoDBDocumentClient;
  private readonly tableName: string;

  constructor(private readonly configService: ConfigService) {
    const region = this.configService.getOrThrow<string>('config.aws.region');
    const accessKeyId = this.configService.get<string>(
      'config.aws.accessKeyId',
    );
    const secretAccessKey = this.configService.get<string>(
      'config.aws.secretAccessKey',
    );

    const hasStaticCredentials = Boolean(accessKeyId && secretAccessKey);
    const lowLevelClient = new DynamoDBClient({
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

    this.client = DynamoDBDocumentClient.from(lowLevelClient);
    this.tableName = this.configService.getOrThrow<string>(
      'config.aws.dynamoDbTableName',
    );
  }

  getClient(): DynamoDBDocumentClient {
    return this.client;
  }

  getTableName(): string {
    return this.tableName;
  }
}

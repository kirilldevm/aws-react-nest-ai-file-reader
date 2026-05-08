import { Module } from '@nestjs/common';
import { DynamoDbService } from './dynamodb/dynamodb.service';
import { S3Service } from './s3/s3.service';

@Module({
  providers: [S3Service, DynamoDbService],
  exports: [S3Service, DynamoDbService],
})
export class AwsModule {}

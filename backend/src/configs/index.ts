import { registerAs } from '@nestjs/config';

export default registerAs('config', () => ({
  internal: {
    pipelineSecret: process.env.INTERNAL_PIPELINE_SECRET ?? '',
  },
  aws: {
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    bucket: process.env.AWS_S3_BUCKET,
    dynamoDbTableName: process.env.AWS_DYNAMODB_TABLE_NAME,
    presignExpiresSeconds: Number(
      process.env.AWS_S3_PRESIGN_EXPIRES_SECONDS ?? 300,
    ),
  },
}));

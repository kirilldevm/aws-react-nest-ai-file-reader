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
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    embeddingModel:
      process.env.OPENAI_EMBEDDING_MODEL ?? 'text-embedding-3-small',
    chatModel: process.env.OPENAI_CHAT_MODEL ?? 'gpt-4o-mini',
  },
  pinecone: {
    apiKey: process.env.PINECONE_API_KEY,
    indexName: process.env.PINECONE_INDEX_NAME,
  },
  chat: {
    topK: Number(process.env.CHAT_TOP_K ?? 8),
    maxContextChars: Number(process.env.CHAT_MAX_CONTEXT_CHARS ?? 16_000),
  },
}));

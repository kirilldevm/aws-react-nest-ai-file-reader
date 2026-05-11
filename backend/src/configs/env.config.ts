import * as Joi from 'joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),

  /** Comma-separated origins for browser clients (e.g. Vite dev server). */
  CORS_ORIGIN: Joi.string().allow('').optional(),

  AWS_ACCESS_KEY_ID: Joi.string().allow('').optional(),
  AWS_SECRET_ACCESS_KEY: Joi.string().allow('').optional(),

  AWS_REGION: Joi.string().trim().min(1).required(),
  AWS_S3_BUCKET: Joi.string().trim().min(1).required(),
  AWS_S3_PRESIGN_EXPIRES_SECONDS: Joi.number()
    .integer()
    .positive()
    .max(604800)
    .default(300),
  AWS_DYNAMODB_TABLE_NAME: Joi.string().trim().min(1).required(),

  /** Shared secret for Lambda / Step Functions → backend calls (e.g. PATCH /files/status). */
  INTERNAL_PIPELINE_SECRET: Joi.string().trim().min(16).required(),

  OPENAI_API_KEY: Joi.string().trim().min(1).required(),
  OPENAI_EMBEDDING_MODEL: Joi.string().trim().default('text-embedding-3-small'),
  OPENAI_CHAT_MODEL: Joi.string().trim().default('gpt-4o-mini'),

  PINECONE_API_KEY: Joi.string().trim().min(1).required(),
  PINECONE_INDEX_NAME: Joi.string().trim().min(1).required(),

  CHAT_TOP_K: Joi.number().integer().min(1).max(50).default(8),
  CHAT_MAX_CONTEXT_CHARS: Joi.number().integer().min(1000).max(100_000).default(16_000),
});

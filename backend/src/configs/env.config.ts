import * as Joi from 'joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),

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
});

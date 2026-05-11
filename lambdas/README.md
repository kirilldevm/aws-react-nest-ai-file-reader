# Lambdas (Serverless Framework v4)

PDF processing pipeline: **S3 upload** → **Step Functions** → extract text (`unpdf`) → chunk → OpenAI embeddings → Pinecone upsert → **PATCH** Nest ` /files/status` (with `X-Internal-Secret`).

## Prerequisites

- AWS credentials configured (`aws configure` or env vars).
- S3 bucket already exists (same bucket Nest uses for presigned uploads).
- DynamoDB + Nest env already set (`INTERNAL_PIPELINE_SECRET`, etc.).
- Pinecone index dimension matches `text-embedding-3-small` (default **1536**, metric **cosine**).

## Configure

Copy `.env.example` to `.env` in this folder and fill values. Export them in your shell before deploy, or use a tool that loads `.env` (Serverless v4 may load `.env` depending on setup—exporting is safest):

```bash
export AWS_S3_BUCKET=your-bucket
export OPENAI_API_KEY=...
export PINECONE_API_KEY=...
export PINECONE_INDEX_NAME=...
export BACKEND_URL=https://your-public-api.example.com
export INTERNAL_PIPELINE_SECRET=... # same as Nest INTERNAL_PIPELINE_SECRET
```

`BACKEND_URL` must be reachable from AWS (localhost will not work unless you tunnel, e.g. ngrok).

## Deploy

```bash
cd lambdas
npm install
npx serverless deploy --stage dev
```

State machine name: `ai-file-pipeline-file-processing-<stage>` (see `STATE_MACHINE_NAME` in `serverless.yml`).

## Notes

- **Service name** is intentionally short (`ai-file-pipeline`) so per-function IAM role names stay under AWS’s 64-character limit.
- S3 event uses `existing: true` so Serverless attaches notifications to your existing bucket.
- If packaging without env, `custom.s3Bucket` defaults to `REPLACE_WITH_YOUR_BUCKET_NAME`—override with `AWS_S3_BUCKET` for a real deploy.

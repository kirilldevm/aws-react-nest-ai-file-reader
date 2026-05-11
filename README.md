# AWS React + Nest AI File Reader

Full-stack RAG app where a user uploads one PDF, waits for async processing, and chats with an AI assistant about that document.

## Stack

- Frontend: React + Vite + React Query + Zod
- Backend: NestJS
- File storage: AWS S3 (presigned upload)
- Processing: AWS Lambda + Step Functions (Serverless Framework)
- Metadata/status: DynamoDB
- Vector DB: Pinecone
- LLM/embeddings: OpenAI

## Product flow

1. User enters email (stored in `localStorage`).
2. Frontend requests `POST /files/presign`, then uploads PDF directly to S3.
3. Backend stores file status in DynamoDB as `pending`.
4. S3 upload triggers Step Functions pipeline:
   - extract text
   - chunk text
   - generate embeddings
   - index vectors in Pinecone
   - call backend internal endpoint to set status `success` or `error`
5. Frontend polls `GET /files/status` and enables chat only when status is `success`.
6. Chat endpoint embeds user question, queries Pinecone by `userEmail`, and asks OpenAI to answer from retrieved context.

## Repository structure

- `frontend/` - Vite app, services, hooks, schemas, pages
- `backend/` - Nest API (`/files`, `/chat`)
- `lambdas/` - Serverless service, Step Functions, Lambda steps

## API overview

- `POST /files/presign` - Validate file constraints, create presigned URL, set `pending`
- `GET /files/status?email=...` - Polling status endpoint
- `DELETE /files?email=...` - Delete existing file (S3 + DynamoDB record)
- `PATCH /files/status` - Internal pipeline status update (guarded by shared secret)
- `POST /chat` - Ask question about processed PDF

## Local development

### 1) Backend

```bash
cd backend
npm install
npm run start:dev
```

### 2) Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend env:

```env
VITE_API_BASE_URL=http://localhost:3000
```

### 3) Lambdas (optional local deploy flow)

```bash
cd lambdas
npm install
npx serverless deploy --stage dev
```

Use shell env exports when deploying Serverless (most reliable with v4).

## Environment variables

### Backend (`BACKEND_ENV` secret in GitHub Actions)

Required core values:

- `PORT`
- `CORS_ORIGIN` (comma-separated)
- `AWS_REGION`
- `AWS_S3_BUCKET`
- `AWS_S3_PRESIGN_EXPIRES_SECONDS`
- `AWS_DYNAMODB_TABLE_NAME`
- `INTERNAL_PIPELINE_SECRET`
- `OPENAI_API_KEY`
- `OPENAI_EMBEDDING_MODEL` (default `text-embedding-3-small`)
- `OPENAI_CHAT_MODEL` (default `gpt-4o-mini`)
- `PINECONE_API_KEY`
- `PINECONE_INDEX_NAME`
- `CHAT_TOP_K`
- `CHAT_MAX_CONTEXT_CHARS`

### Lambdas

Key values:

- `AWS_S3_BUCKET`
- `OPENAI_API_KEY`
- `OPENAI_EMBEDDING_MODEL`
- `PINECONE_API_KEY`
- `PINECONE_INDEX_NAME`
- `BACKEND_URL` (public HTTPS backend URL)
- `INTERNAL_PIPELINE_SECRET` (must match backend)

## Deployment

### Backend to EC2 (self-hosted GitHub runner)

Workflow: `.github/workflows/deploy-backend-ec2.yml`

It:
- syncs `backend/` to EC2 deploy path
- writes `.env` from `BACKEND_ENV` secret
- runs `npm ci --include=dev`, `npm run build`, `npm prune --omit=dev`
- restarts systemd service

Required repo variables:
- `EC2_BACKEND_PATH`
- `EC2_BACKEND_SERVICE`

Required repo secret:
- `BACKEND_ENV` (multiline `.env` contents)

### HTTPS + domain

Typical production path:
- Cloudflare DNS `api.<domain>` -> EC2 IP
- Nginx reverse proxy to `127.0.0.1:3000`
- Certbot TLS on EC2

Then use HTTPS URL in:
- frontend `VITE_API_BASE_URL`
- lambdas `BACKEND_URL`

### Frontend to Vercel

Set:
- `VITE_API_BASE_URL=https://api.<your-domain>`

## Security notes

- Never commit `.env` files with secrets.
- Prefer EC2 IAM role over long-lived AWS access keys.
- Rotate any keys that were exposed in logs/chats/screenshots.
- Keep `PATCH /files/status` protected via shared secret.

## Common issues

- Mixed content (HTTPS frontend -> HTTP backend): use HTTPS backend URL.
- S3 upload blocked in browser: configure S3 bucket CORS for your frontend origin.
- `DELETE_FAILED` CloudFormation stack: remove orphaned AWS resources from failed deploy attempts and redeploy.
- Pinecone dimension mismatch: embedding vector dimension must match index dimension (e.g. `text-embedding-3-small` -> `1536`).
- OpenAI `429 quota exceeded`: enable API billing/credits.
- CORS blocked on backend: add current Vercel origin to `CORS_ORIGIN` and redeploy backend.

## Demo checklist

- [ ] Login stores email
- [ ] PDF upload succeeds
- [ ] Status goes `pending -> success`
- [ ] Chat answers from file content
- [ ] Delete file works
- [ ] Re-upload flow works

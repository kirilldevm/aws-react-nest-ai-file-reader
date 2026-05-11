import { HeadObjectCommand, S3Client } from '@aws-sdk/client-s3';

export const CHUNK_SIZE = 1500;
export const CHUNK_OVERLAP = 200;

const s3 = new S3Client({});

export function readUserEmailFromMetadata(
  metadata: Record<string, string> | undefined,
): string | null {
  if (!metadata) {
    return null;
  }
  const keys = Object.keys(metadata);
  for (const k of keys) {
    const lower = k.toLowerCase();
    if (lower === 'useremail' || lower === 'usermail') {
      const v = metadata[k];
      if (v && typeof v === 'string') {
        return v.toLowerCase().trim();
      }
    }
  }
  return null;
}

export async function resolveUserEmailFromS3(input: {
  bucket: string;
  key: string;
}): Promise<string | null> {
  const head = await s3.send(
    new HeadObjectCommand({ Bucket: input.bucket, Key: input.key }),
  );
  return readUserEmailFromMetadata(head.Metadata as Record<string, string> | undefined);
}

export function chunkPlainText(text: string): string[] {
  const normalized = text.replace(/\r\n/g, '\n').trim();
  if (!normalized) {
    return [];
  }
  const chunks: string[] = [];
  let start = 0;
  while (start < normalized.length) {
    const end = Math.min(start + CHUNK_SIZE, normalized.length);
    chunks.push(normalized.slice(start, end));
    if (end >= normalized.length) {
      break;
    }
    start = Math.max(end - CHUNK_OVERLAP, start + 1);
  }
  return chunks;
}

export async function patchFileStatus(input: {
  email: string;
  status: 'success' | 'error';
  error?: string;
}): Promise<void> {
  const base = process.env.BACKEND_URL?.replace(/\/$/, '');
  const secret = process.env.INTERNAL_PIPELINE_SECRET;
  if (!base) {
    throw new Error('BACKEND_URL is not set');
  }
  if (!secret) {
    throw new Error('INTERNAL_PIPELINE_SECRET is not set');
  }

  const res = await fetch(`${base}/files/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'X-Internal-Secret': secret,
    },
    body: JSON.stringify({
      email: input.email,
      status: input.status,
      ...(input.error ? { error: input.error } : {}),
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(
      `Backend PATCH /files/status failed: ${res.status} ${res.statusText} ${body}`,
    );
  }
}

export function stringifyStepError(lastError: unknown): string {
  if (lastError == null) {
    return 'Unknown error';
  }
  if (typeof lastError === 'string') {
    return lastError.slice(0, 4000);
  }
  if (typeof lastError === 'object') {
    const o = lastError as { Cause?: unknown; Error?: unknown };
    const cause = o.Cause ?? o.Error ?? lastError;
    if (typeof cause === 'string') {
      return cause.slice(0, 4000);
    }
    try {
      return JSON.stringify(cause).slice(0, 4000);
    } catch {
      return 'Unknown error';
    }
  }
  return String(lastError).slice(0, 4000);
}

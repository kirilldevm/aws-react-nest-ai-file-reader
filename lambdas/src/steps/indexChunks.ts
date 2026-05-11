import { createHash } from 'crypto';
import { Pinecone } from '@pinecone-database/pinecone';

type Row = { index: number; text: string; embedding: number[] };

type Input = {
  bucket: string;
  key: string;
  userEmail: string;
  chunkEmbeddings: Row[];
};

function vectorId(userEmail: string, key: string, index: number): string {
  const h = createHash('sha256')
    .update(`${userEmail}|${key}|${index}`)
    .digest('hex')
    .slice(0, 32);
  return `${h}-${index}`;
}

export const handler = async (event: Input) => {
  const apiKey = process.env.PINECONE_API_KEY;
  const indexName = process.env.PINECONE_INDEX_NAME;
  if (!apiKey) {
    throw new Error('PINECONE_API_KEY is not set');
  }
  if (!indexName) {
    throw new Error('PINECONE_INDEX_NAME is not set');
  }

  const pinecone = new Pinecone({ apiKey });
  const index = pinecone.index(indexName);

  const vectors = event.chunkEmbeddings.map((row) => ({
    id: vectorId(event.userEmail, event.key, row.index),
    values: row.embedding,
    metadata: {
      userEmail: event.userEmail,
      s3Key: event.key,
      chunkIndex: row.index,
      text: row.text.slice(0, 36_000),
    } as Record<string, string | number>,
  }));

  const BATCH = 100;
  for (let i = 0; i < vectors.length; i += BATCH) {
    await index.upsert(vectors.slice(i, i + BATCH));
  }

  return {
    bucket: event.bucket,
    key: event.key,
    userEmail: event.userEmail,
    indexed: vectors.length,
  };
};

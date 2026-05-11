import OpenAI from 'openai';

type Chunk = { index: number; text: string };

type Input = {
  bucket: string;
  key: string;
  userEmail: string;
  chunks: Chunk[];
};

const BATCH = 64;

export const handler = async (event: Input) => {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_EMBEDDING_MODEL ?? 'text-embedding-3-small';
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set');
  }

  const openai = new OpenAI({ apiKey });
  const chunkEmbeddings: { index: number; text: string; embedding: number[] }[] =
    [];

  for (let i = 0; i < event.chunks.length; i += BATCH) {
    const batch = event.chunks.slice(i, i + BATCH);
    const inputs = batch.map((c) => c.text);
    const res = await openai.embeddings.create({
      model,
      input: inputs,
    });

    for (let j = 0; j < batch.length; j++) {
      const emb = res.data[j]?.embedding;
      if (!emb?.length) {
        throw new Error(`OpenAI returned no embedding for chunk index ${batch[j]!.index}`);
      }
      chunkEmbeddings.push({
        index: batch[j]!.index,
        text: batch[j]!.text,
        embedding: emb,
      });
    }
  }

  chunkEmbeddings.sort((a, b) => a.index - b.index);

  return {
    bucket: event.bucket,
    key: event.key,
    userEmail: event.userEmail,
    chunkEmbeddings,
  };
};

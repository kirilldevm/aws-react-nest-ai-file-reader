import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pinecone } from '@pinecone-database/pinecone';

function chunkTextFromMetadata(
  metadata: Record<string, unknown> | undefined,
): string | undefined {
  if (!metadata) {
    return undefined;
  }
  const raw = metadata.text ?? metadata.chunkText ?? metadata.content;
  if (typeof raw === 'string' && raw.trim()) {
    return raw.trim();
  }
  return undefined;
}

@Injectable()
export class PineconeService {
  private readonly pinecone: Pinecone;
  private readonly indexName: string;

  constructor(private readonly configService: ConfigService) {
    this.pinecone = new Pinecone({
      apiKey: this.configService.getOrThrow<string>('config.pinecone.apiKey'),
    });
    this.indexName = this.configService.getOrThrow<string>(
      'config.pinecone.indexName',
    );
  }

  /**
   * Returns chunk texts for the user. Lambdas should store `userEmail` on vectors
   * and chunk text in metadata as `text` (or `chunkText` / `content`).
   */
  async queryChunkTexts(input: {
    vector: number[];
    userEmail: string;
    topK: number;
  }): Promise<string[]> {
    const index = this.pinecone.index(this.indexName);
    const res = await index.query({
      vector: input.vector,
      topK: input.topK,
      includeMetadata: true,
      filter: { userEmail: { $eq: input.userEmail } },
    });

    const texts: string[] = [];
    for (const match of res.matches ?? []) {
      const meta = match.metadata as Record<string, unknown> | undefined;
      const t = chunkTextFromMetadata(meta);
      if (t) {
        texts.push(t);
      }
    }
    return texts;
  }
}

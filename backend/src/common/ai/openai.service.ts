import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class OpenAiService {
  private readonly client: OpenAI;

  constructor(private readonly configService: ConfigService) {
    this.client = new OpenAI({
      apiKey: this.configService.getOrThrow<string>('config.openai.apiKey'),
    });
  }

  async embedQuery(text: string): Promise<number[]> {
    const model = this.configService.getOrThrow<string>(
      'config.openai.embeddingModel',
    );
    const res = await this.client.embeddings.create({
      model,
      input: text,
    });
    const vec = res.data[0]?.embedding;
    if (!vec?.length) {
      throw new Error('Embedding API returned no vector');
    }
    return vec;
  }

  async answerFromContext(context: string, question: string): Promise<string> {
    const model = this.configService.getOrThrow<string>('config.openai.chatModel');
    const completion = await this.client.chat.completions.create({
      model,
      temperature: 0.2,
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful assistant. Answer only using the provided context passages. ' +
            'If the context does not contain enough information, say you cannot answer from the document and suggest what might be missing.',
        },
        {
          role: 'user',
          content: `Context passages:\n${context || '(none)'}\n\nQuestion: ${question}`,
        },
      ],
    });

    const text = completion.choices[0]?.message?.content?.trim();
    return text ?? '';
  }
}

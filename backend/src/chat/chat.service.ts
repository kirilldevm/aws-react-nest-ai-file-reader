import { ConflictException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenAiService } from '../common/ai/openai.service';
import { PineconeService } from '../common/ai/pinecone.service';
import { FilesService } from '../files/files.service';
import { ChatRequestDto } from './dto/chat-request.dto';

@Injectable()
export class ChatService {
  constructor(
    private readonly filesService: FilesService,
    private readonly openAiService: OpenAiService,
    private readonly pineconeService: PineconeService,
    private readonly configService: ConfigService,
  ) {}

  async chat(dto: ChatRequestDto): Promise<{ answer: string }> {
    const email = dto.email.toLowerCase().trim();
    const fileState = await this.filesService.getStatus(email);

    if (fileState.status !== 'success') {
      throw new ConflictException(
        'Document is not ready. Wait until processing succeeds or upload a file.',
      );
    }

    const topK = this.configService.getOrThrow<number>('config.chat.topK');
    const maxContextChars = this.configService.getOrThrow<number>(
      'config.chat.maxContextChars',
    );

    const queryVector = await this.openAiService.embedQuery(dto.message);
    const chunks = await this.pineconeService.queryChunkTexts({
      vector: queryVector,
      userEmail: email,
      topK,
    });

    const context = this.joinContext(chunks, maxContextChars);
    const answer = await this.openAiService.answerFromContext(
      context,
      dto.message,
    );

    return { answer };
  }

  private joinContext(parts: string[], maxChars: number): string {
    let out = '';
    for (const part of parts) {
      const next = out ? `${out}\n\n---\n\n${part}` : part;
      if (next.length > maxChars) {
        if (!out && part.length > maxChars) {
          return part.slice(0, maxChars);
        }
        break;
      }
      out = next;
    }
    return out;
  }
}

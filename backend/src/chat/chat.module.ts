import { Module } from '@nestjs/common';
import { OpenAiService } from '../common/ai/openai.service';
import { PineconeService } from '../common/ai/pinecone.service';
import { FilesModule } from '../files/files.module';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

@Module({
  imports: [FilesModule],
  controllers: [ChatController],
  providers: [ChatService, OpenAiService, PineconeService],
})
export class ChatModule {}

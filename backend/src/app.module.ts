import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AwsModule } from './common/aws/aws.module';
import configs from './configs';
import { validationSchema } from './configs/env.config';
import { ChatModule } from './chat/chat.module';
import { FilesModule } from './files/files.module';

@Module({
  imports: [
    AwsModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configs],
      validationSchema: validationSchema,
    }),
    FilesModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { AwsModule } from '../common/aws/aws.module';
import { InternalSecretGuard } from '../common/guards/internal-secret.guard';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';

@Module({
  imports: [AwsModule],
  controllers: [FilesController],
  providers: [FilesService, InternalSecretGuard],
})
export class FilesModule {}

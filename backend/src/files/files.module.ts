import { Module } from '@nestjs/common';
import { AwsModule } from '../common/aws/aws.module';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';

@Module({
  imports: [AwsModule],
  controllers: [FilesController],
  providers: [FilesService],
})
export class FilesModule {}

import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { InternalSecretGuard } from '../common/guards/internal-secret.guard';
import { CreateFilePresignDto } from './dto/create-file-presign.dto';
import { DeleteFileDto } from './dto/delete-file.dto';
import { GetFileStatusDto } from './dto/get-file-status.dto';
import { UpdateFileStatusDto } from './dto/update-file-status.dto';
import { FilesService } from './files.service';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('presign')
  createPresign(@Body() dto: CreateFilePresignDto) {
    return this.filesService.createPresign(dto);
  }

  @Get('status')
  getStatus(@Query() dto: GetFileStatusDto) {
    return this.filesService.getStatus(dto.email);
  }

  @Patch('status')
  @UseGuards(InternalSecretGuard)
  updateStatus(@Body() dto: UpdateFileStatusDto) {
    return this.filesService.updateStatus(dto);
  }

  @Delete()
  deleteFile(@Query() dto: DeleteFileDto) {
    return this.filesService.deleteFile(dto.email);
  }
}

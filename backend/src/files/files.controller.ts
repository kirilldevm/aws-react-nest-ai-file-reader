import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CreateFilePresignDto } from './dto/create-file-presign.dto';
import { GetFileStatusDto } from './dto/get-file-status.dto';
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
}

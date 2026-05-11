import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';

export enum PipelineFileStatus {
  Success = 'success',
  Error = 'error',
}

export class UpdateFileStatusDto {
  @IsEmail()
  email: string;

  @IsEnum(PipelineFileStatus)
  status: PipelineFileStatus;

  @IsOptional()
  @IsString()
  error?: string;
}

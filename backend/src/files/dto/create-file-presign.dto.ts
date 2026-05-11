import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { MAX_FILE_SIZE_BYTES } from '../constants/files.constants';

export class CreateFilePresignDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  filename: string;

  @IsString()
  @IsNotEmpty()
  contentType: string;

  @IsInt()
  @Min(1)
  @Max(MAX_FILE_SIZE_BYTES)
  fileSize: number;
}

import { IsEmail } from 'class-validator';

export class DeleteFileDto {
  @IsEmail()
  email: string;
}

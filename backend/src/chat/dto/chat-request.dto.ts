import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class ChatRequestDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(1)
  @MaxLength(8000)
  message: string;
}

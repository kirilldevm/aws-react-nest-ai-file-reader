import { IsEmail } from 'class-validator';

export class GetFileStatusDto {
  @IsEmail()
  email: string;
}

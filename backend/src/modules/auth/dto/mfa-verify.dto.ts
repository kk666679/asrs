import { IsString, IsNotEmpty } from 'class-validator';

export class MfaVerifyDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}

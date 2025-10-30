import { IsString, IsNotEmpty } from 'class-validator';

export class MfaSetupDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}

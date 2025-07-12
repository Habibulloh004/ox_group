import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class RegisterCompanyDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^Bearer .+/, { message: 'Token must start with "Bearer "' })
  token: string;

  @IsString()
  @IsNotEmpty()
  subdomain: string;
}
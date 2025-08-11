import { IsNotEmpty, IsString, IsStrongPassword } from 'class-validator';

export class AuthDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsStrongPassword()
  @IsNotEmpty()
  password: string;
}

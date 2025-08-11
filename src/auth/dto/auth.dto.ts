import { IsNotEmpty, IsString, IsStrongPassword } from 'class-validator';

export class SignupDto {
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

export class SigninDto {
  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsNotEmpty()
  password: string;
}

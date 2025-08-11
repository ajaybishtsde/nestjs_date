import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SigninDto, SignupDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  Signup(@Body() dto: SignupDto) {
    console.log({
      dto,
    });
    return this.authService.signup(dto);
  }
  @Post('login')
  Login(@Body() dto: SigninDto) {
    return this.authService.signin(dto);
  }
}

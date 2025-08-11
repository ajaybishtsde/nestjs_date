import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  Signup(@Body() dto: AuthDto) {
    console.log({
      dto,
    });
    return this.authService.signup(dto);
  }
  @Post('login')
  Login() {
    return this.authService.login();
  }
}

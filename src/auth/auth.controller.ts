import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ChangePasswordDto, SigninDto, SignupDto } from './dto';
import { AuthGuard } from './auth.gaurd';
import type { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  signup(@Body() dto: SignupDto) {
    console.log({
      dto,
    });
    return this.authService.signup(dto);
  }
  @Post('login')
  login(@Body() dto: SigninDto) {
    return this.authService.signin(dto);
  }

  @UseGuards(AuthGuard)
  @Get('me')
  getCurrentUser(@Req() req: Request) {
    if (!req.user) {
      throw new Error('User not found in request');
    }
    return this.authService.getCurrentUser(req.user.sub);
  }

  @UseGuards(AuthGuard)
  @Patch('change-password')
  changePassword(@Req() req: Request, @Body() dto: ChangePasswordDto) {
    console.log('>', dto.oldPassword);
    if (!req.user) {
      throw new Error('User not found in request');
    }
    return this.authService.changePassword(
      req.user.sub,
      dto.oldPassword,
      dto.newPassword,
    );
  }
}

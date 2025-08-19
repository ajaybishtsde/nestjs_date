import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { SigninDto, SignupDto } from './dto';
import * as argon from 'argon2';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from 'generated/prisma';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async signup(dto: SignupDto) {
    try {
      const hash = await argon.hash(dto.password);

      const { password, ...userData } = dto;

      const user = await this.prisma.user.create({
        data: {
          ...userData,
          password: hash,
        },
      });

      return this.signToken(user.id, user.phone);
    } catch (error) {
      console.error('Signup error:', error);

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            `A user with this ${error.meta?.target} already exists`,
          );
        }
      }

      throw new InternalServerErrorException('Something went wrong');
    }
  }

  async signin(dto: SigninDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { phone: dto.phone },
      });

      if (!user) {
        throw new ForbiddenException('Incorrect credentials');
      }

      const isPasswordMatches = await argon.verify(user.password, dto.password);
      if (!isPasswordMatches) {
        throw new ForbiddenException('Incorrect credentials');
      }

      return this.signToken(user.id, user.phone);
    } catch (error) {
      console.error('Signin error:', error);

      if (error instanceof ForbiddenException) {
        throw error;
      }

      throw new InternalServerErrorException('Something went wrong');
    }
  }

  async signToken(
    id: number,
    phone: string,
  ): Promise<{ status: boolean; access_token: string }> {
    try {
      const payload = {
        sub: id,
        phone,
      };
      const access_token = await this.jwtService.signAsync(payload, {
        expiresIn: '10m',
        secret: this.config.get<string>('JWT_SECRET'),
      });
      return {
        status: true,
        access_token,
      };
    } catch (error) {
      console.error('Error signing token:', error);
      throw new InternalServerErrorException('Token generation failed');
    }
  }

  async getCurrentUser(id: number) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id,
        },
      });

      if (!user) throw new BadRequestException('User not found');

      const { password, ...userWithoutPassword } = user;

      return {
        status: true,
        user: userWithoutPassword,
      };
    } catch (error) {
      console.error('Error in getCurrentUser:', error);

      throw new Error('Unable to fetch user');
    }
  }

  async changePassword(id: number, oldPassword: string, newPassword: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id,
        },
      });

      if (!user) throw new BadRequestException('User not found');

      const oldPasswordMatches = await argon.verify(user.password, oldPassword);

      if (!oldPasswordMatches)
        throw new BadRequestException('Old password does not match');

      const hashPassword = await argon.hash(newPassword);

      await this.prisma.user.update({
        where: {
          id,
        },
        data: {
          password: hashPassword,
        },
      });

      return {
        status: true,
        message: 'Password updated successfully',
      };
    } catch (error) {
      console.error('Error in changePassword:', error);
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('Unable to change password');
    }
  }
}

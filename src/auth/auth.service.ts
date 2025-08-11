import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { SigninDto, SignupDto } from './dto';
import * as argon from 'argon2';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from 'generated/prisma';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async signup(dto: SignupDto) {
    try {
      const hash = await argon.hash(dto.password);

      const { password, ...userData } = dto;

      const user = await this.prisma.user.create({
        data: {
          ...userData,
          hash,
        },
      });

      const { hash: _, ...safeUser } = user;
      return safeUser;
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

      const isPasswordMatches = await argon.verify(user.hash, dto.password);
      if (!isPasswordMatches) {
        throw new ForbiddenException('Incorrect credentials');
      }

      const { hash, ...safeUser } = user;
      return safeUser;
    } catch (error) {
      console.error('Signin error:', error);

      if (error instanceof ForbiddenException) {
        throw error;
      }

      throw new InternalServerErrorException('Something went wrong');
    }
  }
}

import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from 'generated/prisma';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  login() {
    return 'This is login response';
  }

  async signup(dto: AuthDto) {
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
}

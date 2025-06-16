import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserRepository } from './user.repository';
import { MailModule } from '../mail/mail.module';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [MailModule],
  controllers: [UserController],
  providers: [UserService, UserRepository, PrismaService,JwtService],
})
export class UserModule {}

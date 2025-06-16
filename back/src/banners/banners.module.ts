import { Module } from '@nestjs/common';
import { BannersService } from './banners.service';
import { BannersController } from './banners.controller';
import { BannersRepository } from './banners.repository';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [BannersController],
  providers: [BannersService, BannersRepository, PrismaService],
})
export class BannersModule {}

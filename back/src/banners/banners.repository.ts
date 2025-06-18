import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { unlink } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class BannersRepository {
  constructor(private prisma: PrismaService) {}

  async createMultiple(files: Express.Multer.File[], createDtos: CreateBannerDto[]) {
    const inserts = files.map((file, idx) => {
      const data = createDtos[idx] || {};
      return this.prisma.banner.create({
        data: {
          filename: file.filename,
          visibility: data.visibility ?? 'visible',
          order_index: data.orderIndex ?? 0,
        },
      });
    });
    return Promise.all(inserts);
  }

  async updateBanners(updates: UpdateBannerDto[]) {
    const updatePromises = updates.map((dto) =>
      this.prisma.banner.update({
        where: { id: dto.id },
        data: {
          visibility: dto.visibility ?? 'visible',
          order_index: dto.orderIndex ?? 0,
        },
      })
    );
    return Promise.all(updatePromises);
  }

  async getBannersByIds(ids: number[]) {
    return this.prisma.banner.findMany({
      where: { id: { in: ids } },
    });
  }

  async deleteBanners(ids: number[]) {
    return Promise.all(
      ids.map((id) =>
        this.prisma.banner.delete({
          where: { id },
        })
      )
    );
  }

  async deleteFilesAndRecords(banners: any[]) {
    const deletions = banners.map(async (banner) => {
      const filePath = join(process.cwd(), 'uploads', banner.filename);
      try {
        await unlink(filePath);
      } catch (err) {
        if (err.code !== 'ENOENT') throw err;
      }
      return this.prisma.banner.delete({
        where: { id: banner.id },
      });
    });
    return Promise.all(deletions);
  }

  async findVisible() {
    return this.prisma.banner.findMany({
      where: { visibility: 'visible' },
      orderBy: { order_index: 'asc' },
    });
  }

  async findAll() {
    return this.prisma.banner.findMany({
      orderBy: { order_index: 'asc' },
    });
  }
}

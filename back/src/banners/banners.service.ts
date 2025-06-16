import { Injectable } from '@nestjs/common';
import { BannersRepository } from './banners.repository';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';

@Injectable()
export class BannersService {
  constructor(private readonly repository: BannersRepository) {}

  async createMultiple(files: Express.Multer.File[], createDtos: CreateBannerDto[]) {
    return this.repository.createMultiple(files, createDtos);
  }

  async updateBanners(updates: UpdateBannerDto[]) {
    return this.repository.updateBanners(updates);
  }

  async deleteBanners(ids: number[]) {
    const banners = await this.repository.getBannersByIds(ids);
    return this.repository.deleteFilesAndRecords(banners);
  }

  findVisible() {
    return this.repository.findVisible();
  }

  findAll() {
    return this.repository.findAll();
  }
}

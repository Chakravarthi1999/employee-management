import {
  Controller,
  Post,
  Get,
  Body,
  UploadedFiles,
  UseInterceptors,
  } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { BannersService } from './banners.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';

@Controller()
export class BannersController {
  constructor(private bannersService: BannersService) {}

  @Post('upload-multiple-banners')
  @UseInterceptors(
    FileFieldsInterceptor(
      [{ name: 'files' }],
      {
        storage: diskStorage({
          destination: './uploads',
          filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            cb(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
          },
        }),
      },
    ),
  )
  async uploadMultiple(
    @UploadedFiles() files: { files?: Express.Multer.File[] },
    @Body() body: any,
  ) {
    const { existingIds = [], existingVisibility = [], existingOrder = [], deletedIds = [] } = body;

    const createDtos: CreateBannerDto[] = (files.files || []).map((file, index) => ({
      filename: file.filename, 
      visibility: body.visibility?.[index] ?? 'visible',
      orderIndex: parseInt(body.order?.[index]) || 0,
    }));

    const updateDtos: UpdateBannerDto[] = (Array.isArray(existingIds) ? existingIds : [existingIds]).map((id, index) => ({
      id: parseInt(id),
      visibility: existingVisibility[index] ?? "visible",
      orderIndex: parseInt(existingOrder[index]) || 0,
    }));

    const deleteIds = Array.isArray(deletedIds) ? deletedIds.map(Number) : [parseInt(deletedIds)];

    await Promise.all([
      this.bannersService.createMultiple(files.files || [], createDtos),
      this.bannersService.updateBanners(updateDtos),
      this.bannersService.deleteBanners(deleteIds),
    ]);

    return { message: 'Banners updated successfully' };
  }

  @Get('visible-banners')
  getVisible() {
    return this.bannersService.findVisible();
  }

  @Get('all-banners')
  getAll() {
    return this.bannersService.findAll();
  }
}

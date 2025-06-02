import {
  Controller, Get, Post, Put, Delete, Param, Body, UploadedFile, UseInterceptors, ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        callback(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
      }})
  }))
  async create(
    @Body() body: { title: string; description: string },
    @UploadedFile() image: Express.Multer.File,
  ) {
    return this.service.create({ ...body, image:image.filename });
  }

  @Get()
  async findAll() {
    return this.service.findAll();
  }

  

@Put(':id')
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        callback(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
      }
    })
  }))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { title?: string; description?: string },
    @UploadedFile() image?: Express.Multer.File
  ) {
    const updateData = { ...body, image: image?.filename };
    return this.service.update(id, updateData);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.service.remove(id);
  }

  
}

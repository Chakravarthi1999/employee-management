import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UploadedFile,
  UseInterceptors,
  ParseIntPipe,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { imageUploadInterceptor } from '../upload.config';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Post()
  @UseInterceptors(imageUploadInterceptor)

  async create(
    @Body() body: any,
    @UploadedFile() image: Express.Multer.File,
  ) {
    return this.service.create({
      ...body,
      senderId: parseInt(body.senderId),
      image: image?.filename || null,
    });
  }

  @Get()
  async findAll() {
    return this.service.findAll();
  }

  @Get('/:userId')
  async getUserNotifications(@Param('userId', ParseIntPipe) userId: number) {
    return this.service.getUserNotifications(userId);
  }

  @Put(':id')
  @UseInterceptors(imageUploadInterceptor)

  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { title?: string; description?: string },
    @UploadedFile() image?: Express.Multer.File,
  ) {
    const updateData = { ...body, image: image?.filename };
    return this.service.update(id, updateData);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }

  @Get('count/:userId')
  getUnreadCount(@Param('userId', ParseIntPipe) userId: number) {
    return this.service.getUnreadCount(userId);
  }

  @Post('mark-read/:userId')
  markAsRead(@Param('userId', ParseIntPipe) userId: number) {
    return this.service.markAllAsRead(userId);
  }
}

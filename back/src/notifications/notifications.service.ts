import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Notification } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async create(data: { title: string; description: string; image: string }) {
    return await this.prisma.notification.create({ data });
  }

  async findAll() {
    return await this.prisma.notification.findMany({ orderBy: { createdAt: 'desc' } });
  }



async update(id: number, data: { title?: string; description?: string; image?: string }) {
    return await this.prisma.notification.update({ where: { id }, data });
  }

  async remove(id: number) {
  const notification = await this.prisma.notification.findUnique({
    where: { id },
  });

  if (!notification) {
    throw new NotFoundException('Notification not found');
  }

  if (notification.image) {
    const imagePath = path.join(process.cwd(), 'uploads', notification.image);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
  }

  await this.prisma.notification.delete({ where: { id } });

  return { message: 'Notification deleted successfully' };
}

}

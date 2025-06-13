import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
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




async getUnreadCount(userId: number) {
  const totalCount = await this.prisma.notification.count();

  const readCount = await this.prisma.notificationRead.count({
    where: { userId },
  });

  const unreadCount = totalCount - readCount;

  return { count: unreadCount };
}



async markAllAsRead(userId: number) {
  const allNotifications = await this.prisma.notification.findMany({ select: { id: true } });

  const existingReads = await this.prisma.notificationRead.findMany({
    where: { userId },
    select: { notificationId: true },
  });

  const existingReadIds = new Set(existingReads.map(r => r.notificationId));
  const newReads = allNotifications
    .filter(n => !existingReadIds.has(n.id))
    .map(n => ({
      userId,
      notificationId: n.id,
    }));

  if (newReads.length > 0) {
    await this.prisma.notificationRead.createMany({
      data: newReads,
      skipDuplicates: true,
    });
  }

  return { message: 'All notifications marked as read' };
}

}

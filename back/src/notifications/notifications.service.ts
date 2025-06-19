import { Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as admin from 'firebase-admin';
import { NotificationsRepository } from './notifications.repository';

@Injectable()
export class NotificationsService {
  constructor(private readonly repository: NotificationsRepository) {}

  async create(data: { title: string; description: string; image: string; senderId: number }) {
    const employees = await this.repository.getAllEmployees();
    const receiverIds = employees.map(emp => emp.id);

    const notification = await this.repository.createNotification(data, receiverIds);

    await admin.database().ref(`notifications/${notification.id}`).set({
      title: notification.title,
      description: notification.description,
      createdAt: notification.createdAt.toISOString(),
      senderId: data.senderId,
      receiverIds: receiverIds,
    });

    return notification;
  }

    async findAll() {
    return this.repository.getAllNotifications();
  }

    async getUserNotifications(userId: number) {
    return this.repository.getUserNotifications(userId);
  }

  async update(id: number, data: { title?: string; description?: string; image?: string }) {
    return this.repository.updateNotification(id, data);
  }

  async remove(id: number) {
    const notification = await this.repository.findNotificationById(id);

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.image) {
      const imagePath = path.join(process.cwd(), 'uploads', notification.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await this.repository.deleteNotification(id);

    return { message: 'Notification deleted successfully' };
  }

  async getUnreadCount(userId: number) {
    const totalCount = await this.repository.countTotalNotifications();
    const readCount = await this.repository.countReadNotifications(userId);

    return { count: totalCount - readCount };
  }

  async markAllAsRead(userId: number) {
    const allNotifications = await this.repository.findAllNotificationIds();
    const existingReads = await this.repository.findUserReads(userId);

    const existingReadIds = new Set(existingReads.map(r => r.notificationId));
    const newReads = allNotifications
      .filter(n => !existingReadIds.has(n.id))
      .map(n => ({ userId, notificationId: n.id }));

    if (newReads.length > 0) {
      await this.repository.insertReads(newReads);
    }

    return { message: 'All notifications marked as read' };
  }
}

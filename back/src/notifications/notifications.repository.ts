import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class NotificationsRepository {
  constructor(private prisma: PrismaService) {}

  async createNotification(data: any, receiverIds: number[]) {
    return this.prisma.notification.create({
      data: {
        title: data.title,
        description: data.description,
        image: data.image,
        senderId: data.senderId,
        receiverIds,
      },
    });
  }

  async getAllEmployees() {
    return this.prisma.user.findMany({
      where: { role: 'employee' },
      select: { id: true },
    });
  }

  async getUserNotifications(userId: number) {
    return this.prisma.notification.findMany({
      where: { receiverIds: { has: userId } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllNotifications() {
    return this.prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        image: true,
        createdAt: true,
      },
    });
  }

  async updateNotification(id: number, data: any) {
    return this.prisma.notification.update({
      where: { id },
      data,
    });
  }

  async findNotificationById(id: number) {
    return this.prisma.notification.findUnique({
      where: { id },
    });
  }

  async deleteNotification(id: number) {
    return this.prisma.notification.delete({
      where: { id },
    });
  }

  async countTotalNotifications() {
    return this.prisma.notification.count();
  }

  async countReadNotifications(userId: number) {
    return this.prisma.notificationRead.count({
      where: { userId },
    });
  }

  async findAllNotificationIds() {
    return this.prisma.notification.findMany({
      select: { id: true },
    });
  }

  async findUserReads(userId: number) {
    return this.prisma.notificationRead.findMany({
      where: { userId },
      select: { notificationId: true },
    });
  }

  async insertReads(newReads: any[]) {
    return this.prisma.notificationRead.createMany({
      data: newReads,
      skipDuplicates: true,
    });
  }
}

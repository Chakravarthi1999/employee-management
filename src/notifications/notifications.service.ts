import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Notification } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async create(data: { title: string; description: string; image?: string }): Promise<Notification> {
    return await this.prisma.notification.create({ data });
  }

  async findAll(): Promise<Notification[]> {
    return await this.prisma.notification.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: number): Promise<Notification> {
    const notif = await this.prisma.notification.findUnique({ where: { id } });
    if (!notif) throw new NotFoundException(`Notification with ID ${id} not found`);
    return notif;
  }


}

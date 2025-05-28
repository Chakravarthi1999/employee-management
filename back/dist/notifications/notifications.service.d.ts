import { PrismaService } from '../prisma/prisma.service';
import { Notification } from '@prisma/client';
export declare class NotificationsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: {
        title: string;
        description: string;
        image?: string;
    }): Promise<Notification>;
    findAll(): Promise<Notification[]>;
    findOne(id: number): Promise<Notification>;
}

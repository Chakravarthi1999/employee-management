import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly service;
    constructor(service: NotificationsService);
    create(body: {
        title: string;
        description: string;
    }, file?: Express.Multer.File): Promise<{
        id: number;
        image: string | null;
        createdAt: Date;
        title: string;
        description: string;
        updatedAt: Date;
    }>;
    findAll(): Promise<{
        id: number;
        image: string | null;
        createdAt: Date;
        title: string;
        description: string;
        updatedAt: Date;
    }[]>;
    findOne(id: number): Promise<{
        id: number;
        image: string | null;
        createdAt: Date;
        title: string;
        description: string;
        updatedAt: Date;
    }>;
}

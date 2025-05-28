import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
export declare class UserService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    register(data: any, image: Express.Multer.File): Promise<{
        message: string;
        user: {
            id: number;
            name: string;
            email: string;
            phone: string;
            password: string;
            role: string;
            type: string | null;
            dob: Date;
            image: string;
            createdAt: Date;
        };
    }>;
    login(data: {
        email: string;
        password: string;
    }): Promise<{
        message: string;
        user: {
            id: number;
            name: string;
            email: string;
            phone: string;
            password: string;
            role: string;
            type: string | null;
            dob: Date;
            image: string;
            createdAt: Date;
        };
        token: string;
    }>;
    getAllUsers(): Promise<{
        id: number;
        name: string;
        email: string;
        phone: string;
        role: string;
        type: string | null;
        dob: Date;
        image: string;
    }[]>;
    updateProfile(id: number, data: any, image: Express.Multer.File): Promise<{
        message: string;
        user: {
            id: number;
            name: string;
            email: string;
            phone: string;
            password: string;
            role: string;
            type: string | null;
            dob: Date;
            image: string;
            createdAt: Date;
        };
    }>;
    getUserById(id: number): Promise<{
        id: number;
        name: string;
        email: string;
        phone: string;
        password: string;
        role: string;
        type: string | null;
        dob: Date;
        image: string;
        createdAt: Date;
    }[]>;
    deleteUserById(userId: number): Promise<{
        message: string;
    }>;
}

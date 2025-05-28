import { UserService } from './user.service';
export declare class UserController {
    private userService;
    constructor(userService: UserService);
    register(image: Express.Multer.File, body: any): Promise<{
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
    login(body: {
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
    findAll(): Promise<{
        id: number;
        name: string;
        email: string;
        phone: string;
        role: string;
        type: string | null;
        dob: Date;
        image: string;
    }[]>;
    updateProfile(id: number, body: any, image: Express.Multer.File): Promise<{
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
    deleteUser(id: number): Promise<{
        message: string;
    }>;
}

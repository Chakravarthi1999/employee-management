import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserRepository {
  constructor(private prisma: PrismaService) {}

  async findUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async createUser(data: any, hashedPassword: string, imagePath: string) {
    return this.prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
        dob: new Date(data.dob),
        image: imagePath,
      },
    });
  }

  async getAllUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        type: true,
        dob: true,
        image: true,
      },
    });
  }

  async findTodayBirthdays() {
    const users = await this.prisma.user.findMany({
      select: { id: true, name: true, dob: true },
    });

    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();

    return users.filter(user => {
      if (!user.dob) return false;
      const dob = new Date(user.dob);
      return dob.getMonth() + 1 === month && dob.getDate() === day;
    });
  }

  async updatePassword(id: number, hashedPassword: string) {
    return this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });
  }

  async findUserById(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async updateUser(id: number, data: any, imagePath: string) {
    return this.prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        type: data.type,
        image: imagePath,
      },
    });
  }

  async deleteUser(id: number) {
    return this.prisma.user.delete({
      where: { id },
    });
  }
}

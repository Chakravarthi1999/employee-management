import { Injectable, BadRequestException,NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
// import { JwtService } from '@nestjs/jwt';
import * as fs from 'fs';
import * as path from 'path';
import admin from 'firebase-admin';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    // private jwtService: JwtService,
  ) {}
  async verifyFirebaseToken(idToken: string) {
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      return decodedToken;
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException('Invalid token');
    }
  }

  async register(data: any, image: Express.Multer.File) {
    try{
 const user = await admin.auth().getUserByEmail(data.email);
throw new BadRequestException('Email already exists');
   } catch (error) {
    if (error.code === 'auth/user-not-found') {
       await admin.auth().createUser({
        email: data.email,
        password: data.password,
      })}}
    // else{
    //   throw new BadRequestException('Email already exists');
    // }
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const imagePath = image.filename;
    const hashedPassword = await bcrypt.hash(data.password, 10);

     await this.prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
        dob: new Date(data.dob),
        image: imagePath,
      },
    });

    return { message: 'User registered successfully' };
  }


  async login(data: { email: string; password: string; idToken: string }) {
    const decodedToken = await this.verifyFirebaseToken(data.idToken);

    const user = await this.prisma.user.findUnique({
      where: { email: decodedToken?.email as string },
    });

    if (!user) {
      throw new BadRequestException('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) {
      throw new BadRequestException('Invalid email or password');
    }

    // const token = await this.jwtService.signAsync({
    //   id: user.id,
    //   role: user.role,
    // });

    return {
      message: 'Login successful',
      user
    };
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
  select: {
    id: true,
    name: true,
    dob: true,
  },
});

const today = new Date();
const todayMonth = today.getMonth() + 1;
const todayDay = today.getDate();

const birthdays = users.filter(user => {
  if (!user.dob) return false; 
  const dob = new Date(user.dob);
  return dob.getMonth() + 1 === todayMonth && dob.getDate() === todayDay;
});

return birthdays;

}


 async updateProfile(id: number, data: any, image: Express.Multer.File) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
  const fbUser = await admin.auth().getUserByEmail(user.email);
 if (user.email !== data.email) {
    await admin.auth().updateUser(fbUser.uid, {
      email: data.email,
      password:data.password
    });
  }
    let imagePath = user.image; 
    if (image) {
      if (user.image) {
        const oldImagePath = path.join(process.cwd(), 'uploads', user.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      imagePath = image.filename; 
    }

     await this.prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        type: data.type ?? user.type, 
        image: imagePath,
      },
    });

    return { message: 'Profile updated successfully' };
  }

  async getUserById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return [user]; 
  }


  async deleteUserById(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
 try {
      const fbUser = await admin.auth().getUserByEmail(user.email);
      await admin.auth().deleteUser(fbUser.uid);
    } catch (error) {
      console.warn(error.message);
    }

    if (user.image) {
      const imagePath = path.join(process.cwd(), 'uploads', user.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await this.prisma.user.delete({
      where: { id: userId },
    });

    return { message: 'User deleted successfully' };
  }


}

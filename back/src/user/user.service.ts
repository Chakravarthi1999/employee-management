import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { UserRepository } from './user.repository';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';
import admin from 'firebase-admin';
import { MailService } from '../mail/mail.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  constructor(
    private userRepository: UserRepository,
    private mailService: MailService,
    private jwtService: JwtService,
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
    try {
      await admin.auth().getUserByEmail(data.email);
      throw new BadRequestException('Email already exists');
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        await admin.auth().createUser({
          email: data.email,
          password: data.password,
        });
      }
    }

    const existingUser = await this.userRepository.findUserByEmail(data.email);
    if (existingUser) throw new BadRequestException('Email already exists');

    const imagePath = image.filename;
    const hashedPassword = await bcrypt.hash(data.password, 10);

    await this.userRepository.createUser(data, hashedPassword, imagePath);
    await this.mailService.sendWelcomeEmail(data.email, data.name);

    return { message: 'User registered successfully' };
  }

  async login(data: { idToken: string }) {
    const decodedToken = await this.verifyFirebaseToken(data.idToken);

    const user = await this.userRepository.findUserByEmail(
      decodedToken.email as string,
    );
    if (!user) throw new BadRequestException('Invalid credentials');

    const payload = { id: user.id, email: user.email, role: user.role };
    const token = this.jwtService.sign(payload);

    return { user, token };
  }

  async forgotPassword(email: string) {
    const user = await this.userRepository.findUserByEmail(email);
    if (!user) throw new NotFoundException('Email not registered in our records');

    const randomPassword = Math.random().toString(36).slice(-10);

    try {
      const fbUser = await admin.auth().getUserByEmail(email);
      await admin.auth().updateUser(fbUser.uid, {
        password: randomPassword,
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to update Firebase password');
    }

    const hashedPassword = await bcrypt.hash(randomPassword, 10);
    await this.userRepository.updatePassword(user.id, hashedPassword);
    await this.mailService.sendResetPasswordEmail(
      email,
      user.name,
      randomPassword,
    );

    return { message: 'A new password has been sent to your email' };
  }

  async changePassword(
    id: number,
    data: { currentPassword: string; newPassword: string },
  ) {
    const user = await this.userRepository.findUserById(id);
    if (!user) throw new NotFoundException('User not found');

    const isMatch = await bcrypt.compare(data.currentPassword, user.password);
    if (!isMatch) throw new BadRequestException('Incorrect current password');

    const fbUser = await admin.auth().getUserByEmail(user.email);
    await admin.auth().updateUser(fbUser.uid, {
      password: data.newPassword,
    });

    const hashedPassword = await bcrypt.hash(data.newPassword, 10);
    await this.userRepository.updatePassword(id, hashedPassword);

    return { message: 'Password changed successfully' };
  }

  async getAllUsers() {
    return this.userRepository.getAllUsers();
  }

  async findTodayBirthdays() {
    return this.userRepository.findTodayBirthdays();
  }

  async updateProfile(
    id: number,
    data: any,
    image: Express.Multer.File,
  ) {
    const user = await this.userRepository.findUserById(id);
    if (!user) throw new NotFoundException('User not found');

    const fbUser = await admin.auth().getUserByEmail(user.email);
    if (user.email !== data.email) {
      await admin.auth().updateUser(fbUser.uid, {
        email: data.email,
        password: data.password,
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

    await this.userRepository.updateUser(id, data, imagePath);
    return { message: 'Profile updated successfully' };
  }

  async getUserById(id: number) {
    const user = await this.userRepository.findUserById(id);
    if (!user) throw new NotFoundException('User not found');
    return [user];
  }

  async deleteUserById(id: number) {
    const user = await this.userRepository.findUserById(id);
    if (!user) throw new NotFoundException('User not found');

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

    await this.userRepository.deleteUser(id);
    return { message: 'User deleted successfully' };
  }
}

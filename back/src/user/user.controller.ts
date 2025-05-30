/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable prettier/prettier */
import {
  Controller,
  Post,
  Get,
  Body,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Param,
  Delete,
    HttpException,
  HttpStatus,
  ParseIntPipe,
  Put
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { UserService } from './user.service';
import { extname } from 'path';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
// import { Role } from '../auth/roles.decorator';
// import { RolesGuard } from '../auth/jwt-auth.guard';

@Controller()
export class UserController {
  constructor(private userService: UserService) {}

  @Post('register')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  async register(
    @UploadedFile() image: Express.Multer.File,
    @Body() body: any,
  ) {
    return this.userService.register(body, image);
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return this.userService.login(body);
  }

  @UseGuards(JwtAuthGuard)
  // @Role('admin')
  @Get('users')
  async findAll() {
    return this.userService.getAllUsers();
  }


  @Get("/birthdays")
  async getTodayBirthdays() {
    return this.userService.findTodayBirthdays();
  }

@UseGuards(JwtAuthGuard)
  @Put('/:id')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )


  async updateProfile(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
    @UploadedFile() image: Express.Multer.File,
  ) {
    return this.userService.updateProfile(id, body, image);
  }

  @UseGuards(JwtAuthGuard)
  @Get('getbyid/:id')
  async getUserById(@Param('id', ParseIntPipe) id: number) {
    return this.userService.getUserById(id);
  }

   @UseGuards(JwtAuthGuard)
  @Delete('/:id')
  async deleteUser(@Param('id', ParseIntPipe) id: number) {
    const deleted = await this.userService.deleteUserById(id);
    if (!deleted) {
      throw new HttpException('User not found or already deleted', HttpStatus.NOT_FOUND);
    }
    return { message: 'User deleted successfully' };
  }

 
}

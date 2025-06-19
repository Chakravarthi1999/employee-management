import {
  Controller,
  Post,
  Get,
  Body,
  UploadedFile,
  UseInterceptors,
  Param,
  Delete,
  ParseIntPipe,
  Put,
} from '@nestjs/common';
import { UserService } from './user.service';
import { imageUploadInterceptor } from '../upload.config';

@Controller()
export class UserController {
  constructor(private userService: UserService) { }

  @Post('register')
  @UseInterceptors(imageUploadInterceptor)

  async register(
    @UploadedFile() image: Express.Multer.File,
    @Body() body: any,
  ) {
    return this.userService.register(body, image);
  }

  @Post('login')
  async login(@Body() body: { idToken: string }) {
    return this.userService.login(body);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() body: { email: string }) {
    return this.userService.forgotPassword(body.email);
  }

//   @Post('addUser')
//   @UseInterceptors(imageUploadInterceptor)
//  async addUser(@UploadedFile() image: Express.Multer.File, @Body() body: any) {
//     return this.userService.addUser(body, image?.filename);
//   }
  @Put('change-password/:id')
  async changePassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { currentPassword: string; newPassword: string },
  ) {
    return this.userService.changePassword(id, body);
  }

  @Get('users')
  async findAll() {
    return this.userService.getAllUsers();
  }

  @Get('birthdays')
  async getTodayBirthdays() {
    return this.userService.findTodayBirthdays();
  }

  @Put('/:id')
  @UseInterceptors(imageUploadInterceptor)

  async updateProfile(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
    @UploadedFile() image: Express.Multer.File,
  ) {
    return this.userService.updateProfile(id, body, image);
  }

  @Get('getbyid/:id')
  async getUserById(@Param('id', ParseIntPipe) id: number) {
    return this.userService.getUserById(id);
  }

  @Delete('/:id')
  async deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.userService.deleteUserById(id);
  }
}

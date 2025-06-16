import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { BannersModule } from './banners/banners.module';
import { NotificationsModule } from './notifications/notifications.module';
import { MailService } from './mail/mail.service';

@Module({
  imports: [PrismaModule, UserModule, BannersModule, NotificationsModule],
  controllers: [AppController],
  providers: [AppService, MailService],
})
export class AppModule {}

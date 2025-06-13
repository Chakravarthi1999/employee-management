/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import 'dotenv/config';
import admin from 'firebase-admin';
import { FIREBASE_ADMIN_CONFIG } from './services/firebase/firebase.config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });
  admin.initializeApp(FIREBASE_ADMIN_CONFIG);
  await app.listen(process.env.PORT ?? 3005);
}
bootstrap();

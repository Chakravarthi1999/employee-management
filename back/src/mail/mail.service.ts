import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class MailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVICE_HOST,
      port: parseInt(process.env.EMAIL_SERVICE_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.EMAIL_SERVICE_USER,
        pass: process.env.EMAIL_SERVICE_PASS,
      },
    });
  }

  async sendWelcomeEmail(to: string, name: string) {
    try {
      await this.transporter.sendMail({
        from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_SERVICE_USER}>`,
        to,
        subject: 'Thank you for registering!',
        html: `<p>Dear ${name},</p>
               <p>Thank you for registering in our system. We're happy to have you onboard 🎉</p>
               <p>Best regards,<br/>EMS Team</p>`,
      });
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }
}

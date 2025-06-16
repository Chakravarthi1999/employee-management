import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'arigelamanikanta79@gmail.com',
        pass: 'cugz kzua ruzo huhc',
      },
    });
  }

  async sendWelcomeEmail(to: string, name: string) {
    try {
      await this.transporter.sendMail({
        from: '"EMS Team" <arigelamanikanta79@gmail.com>',
        to,
        subject: 'Thank you for registering!',
        html: `<p>Dear ${name},</p>
               <p>Thank you for registering in our system. We're happy to have you onboard 🎉</p>
               <p>Best regards,<br/>EMS Team</p>`,
      });
    } catch (error) {
      console.error('Error sending email:', error);
      throw new InternalServerErrorException('Failed to send email');
    }
  }
}

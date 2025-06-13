import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
@Injectable()
export class FirebaseService {
  async updateEmail(oldEmail: string, newEmail: string) {
    const user = await admin.auth().getUserByEmail(oldEmail);
    await admin.auth().updateUser(user.uid, {
      email: newEmail,
    });
  }}
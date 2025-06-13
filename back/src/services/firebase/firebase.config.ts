import { applicationDefault } from 'firebase-admin/app';
 
const firebaseRealTimeDB = '' + process.env.XDS_FIREBASE_REALTIME_DB;
export const FIREBASE_ADMIN_CONFIG = {
  credential: applicationDefault(),
  databaseURL: firebaseRealTimeDB

};


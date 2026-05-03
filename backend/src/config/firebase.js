const admin = require('firebase-admin');

const initializeFirebase = () => {
  if (admin.apps.length > 0) return admin.apps[0];

  let serviceAccount;

  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } else {
    try {
      serviceAccount = require('../../firebase-service-account.json');
    } catch (e) {
      console.error('❌ Firebase service account not found!');
      console.error('Please add firebase-service-account.json to the backend root.');
      console.error('See SETUP_INSTRUCTIONS.md for details.');
      process.exit(1);
    }
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
  });

  console.log('✅ Firebase Admin initialized');
};

initializeFirebase();

const db = admin.firestore();
const auth = admin.auth();
module.exports = { admin, db, auth };

import admin from 'firebase-admin';

const serviceAccount = require('./faydekidukan-firebase-adminsdk-2lebb-4eeb339088.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

export default admin;

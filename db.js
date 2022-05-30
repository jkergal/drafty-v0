const firebaseAdmin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

const db = firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount)
});

const firestore = db.firestore()

module.exports = firestore
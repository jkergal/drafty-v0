const firebaseAdmin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

const firebase = firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount)
});

const firestore = firebase.firestore()

module.exports = firestore
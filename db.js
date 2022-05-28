import firebaseAdmin from "firebase-admin"

import serviceAccount from "./serviceAccountKey.json" assert {type: "json"}

const db = firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount)
});

const firestore = db.firestore()

export default firestore
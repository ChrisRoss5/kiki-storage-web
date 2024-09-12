import { getAuth } from "firebase-admin/auth";
import { getDatabase } from "firebase-admin/database";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { logger } from "firebase-functions/v1";
import { onCall, HttpsError } from "firebase-functions/v2/https";

export const deleteAccount = onCall(async (req) => {
  if (!req.auth) {
    throw new HttpsError(
      "failed-precondition",
      "The function must be called while authenticated."
    );
  }
  const uid = req.auth.uid;
  try {
    await Promise.all([
      deleteUserFirestore(uid),
      deleteUserRTDB(uid),
      deleteUserStorage(uid),
      deleteUserAuth(uid),
    ]);
    logger.info("User account deleted successfully.", { uid });
    return { success: true };
  } catch (error) {
    logger.error("An error occurred while deleting the user account.", error);
    throw new HttpsError(
      "internal",
      "An error occurred while deleting the user account."
    );
  }
});

function deleteUserRTDB(uid: string) {
  const path = `settings/${uid}`;
  const db = getDatabase();
  const ref = db.ref(path);
  return ref.remove();
}

async function deleteUserFirestore(uid: string) {
  const path = `app/drive/${uid}`;
  const db = getFirestore();
  const collectionRef = db.collection(path);
  const docs = await collectionRef.listDocuments();
  return Promise.all(docs.map((doc) => doc.delete()));
}

async function deleteUserStorage(uid: string) {
  const path = `user/${uid}`;
  const db = getStorage();
  const bucket = db.bucket();
  const files = await bucket.getFiles({ prefix: path });
  return Promise.all(files[0].map((file) => file.delete()));
}

function deleteUserAuth(uid: string) {
  const auth = getAuth();
  return auth.deleteUser(uid);
}

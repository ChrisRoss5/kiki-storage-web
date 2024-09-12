import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { logger } from "firebase-functions/v1";
import { onRequest } from "firebase-functions/v2/https";
import { DeleteFileResponse } from "@google-cloud/storage";

const maxItemAge = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

export const emptyBins = onRequest(async (req, res) => {
  const firestorePath = "app/drive";
  const dbFirestore = getFirestore();
  const dbStorage = getStorage();
  const bucket = dbStorage.bucket();
  const userCollectionRefs = await dbFirestore
    .doc(firestorePath)
    .listCollections();
  const thirtyDaysAgo = new Date(Date.now() - maxItemAge);
  let totalItemsDeleted = 0;
  const userPromises = userCollectionRefs.map(async (userCollectionRef) => {
    const querySnapshot = await userCollectionRef
      .where("dateDeleted", "<", thirtyDaysAgo)
      .get();
    const batch = dbFirestore.batch();
    const storageDeletePromises: Promise<DeleteFileResponse>[] = [];
    querySnapshot.forEach((doc) => {
      totalItemsDeleted++;
      batch.delete(doc.ref);
      if (!doc.data().isFolder) {
        const path = `user/${userCollectionRef.id}/${doc.id}`;
        storageDeletePromises.push(bucket.file(path).delete());
      }
    });
    return [...storageDeletePromises, batch.commit()];
  });
  await Promise.all((await Promise.all(userPromises)).flat());
  logger.info(`Deleted ${totalItemsDeleted} items from user bins.`);
  res.status(200).send("Success");
});

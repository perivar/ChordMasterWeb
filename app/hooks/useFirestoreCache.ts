import { useEffect, useState } from "react";
import { db } from "~/firebase-service";
import {
  collection,
  DocumentData,
  getDocs,
  query,
  QueryDocumentSnapshot,
  Timestamp,
  where,
} from "firebase/firestore";

import { ISong } from "~/hooks/useFirestore";

export function useFirestoreCache(userId?: string) {
  // State to store fetched documents
  const [documents, setDocuments] = useState<ISong[]>([]);
  // State to store the last updated timestamp
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = async (
    localDocuments: ISong[],
    localLastUpdated: Date | null
  ) => {
    if (!userId) {
      console.error("Cannot use firestore without an userId");
      return;
    }

    try {
      // Convert lastUpdated to Firestore Timestamp, defaulting to 0 if lastUpdated is not set
      const lastUpdatedTimestamp = localLastUpdated
        ? Timestamp.fromDate(localLastUpdated)
        : Timestamp.fromMillis(0);

      // Query Firestore for songs with createdAt > lastUpdatedTimestamp
      const createdAtQuery = query(
        collection(db, "songs"),
        where("user.uid", "==", userId),
        where("createdAt", ">", lastUpdatedTimestamp)
      );

      // Query Firestore for songs with updatedAt > lastUpdatedTimestamp
      const updatedAtQuery = query(
        collection(db, "songs"),
        where("user.uid", "==", userId),
        where("updatedAt", ">", lastUpdatedTimestamp)
      );

      // Execute both queries
      const [createdAtSnapshots, updatedAtSnapshots] = await Promise.all([
        getDocs(createdAtQuery),
        getDocs(updatedAtQuery),
      ]);

      // Update lastCheckedAt to current time
      localStorage.setItem("firestoreLastCheckedAt", new Date().toISOString());

      // Map snapshots to an array of document objects
      const fetchedDocuments: ISong[] = [
        ...createdAtSnapshots.docs.map(
          (doc: QueryDocumentSnapshot<DocumentData>) => ({
            id: doc.id,
            ...(doc.data() as ISong), // Type casting to ISong
          })
        ),
        ...updatedAtSnapshots.docs.map(
          (doc: QueryDocumentSnapshot<DocumentData>) => ({
            id: doc.id,
            ...(doc.data() as ISong), // Type casting to ISong
          })
        ),
      ];

      // Deduplicate documents based on their ID
      const uniqueDocumentsMap = new Map(
        fetchedDocuments.map(doc => [doc.id, doc])
      );
      const uniqueDocuments = Array.from(uniqueDocumentsMap.values());

      // Filter to append only new documents to existing state
      const newDocuments = uniqueDocuments.filter(
        doc => !localDocuments.find(existingDoc => existingDoc.id === doc.id)
      );

      if (newDocuments.length > 0) {
        const updatedDocuments = [...localDocuments, ...newDocuments];
        setDocuments(updatedDocuments); // Update state with merged document list

        // Update the lastUpdated state and local storage
        const latestTimestamp = Math.max(
          ...newDocuments.map(doc => {
            const updatedAt = doc.updatedAt ?? Timestamp.fromMillis(0);
            const createdAt = doc.createdAt ?? Timestamp.fromMillis(0);
            return (updatedAt || createdAt).toMillis();
          })
        );
        setLastUpdated(new Date(latestTimestamp)); // Convert Firestore Timestamp to JS Date

        localStorage.setItem(
          "firestoreCache",
          JSON.stringify({
            documents: updatedDocuments,
            lastUpdated: latestTimestamp, // Store the timestamp in milliseconds
          })
        );
      }
    } catch (error) {
      console.error("Error fetching new songs:", error);
    }
  };

  useEffect(() => {
    const cachedData = localStorage.getItem("firestoreCache");
    const lastCheckedAt = localStorage.getItem("firestoreLastCheckedAt");
    const lastCheckedAtDate = lastCheckedAt ? new Date(lastCheckedAt) : null;

    const now = new Date();
    const minutesAgo = 240;
    const someMinutesAgo = new Date(now.getTime() - minutesAgo * 60 * 1000);

    if (cachedData) {
      const parsedData = JSON.parse(cachedData);
      const localDocuments = parsedData.documents;
      const localLastUpdated = new Date(parsedData.lastUpdated);

      setDocuments(localDocuments);
      setLastUpdated(localLastUpdated);

      // Only fetch data if more than the given minutes have passed since lastCheckedAt
      if (!lastCheckedAtDate || lastCheckedAtDate < someMinutesAgo) {
        console.log(
          `The cache needs updating. Last checked: ${lastCheckedAtDate}). Refreshing ...`
        );
        fetchData(localDocuments, localLastUpdated);
      } else {
        console.log(
          `The cache does not need to be updated. Last checked: ${lastCheckedAtDate}, the wait time is ${minutesAgo} minutes.`
        );
      }
    } else {
      console.log(`The cache does not exist. Fetching data ...`);
      fetchData(documents, lastUpdated);
    }
  }, [userId]);

  return { documents, lastUpdated };
}

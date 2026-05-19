import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";

import { db } from "@/firebase/client";

import { Campaign } from "../types/campaign";

const COLLECTION_NAME = "science_campaigns";

export async function createCampaign(
  data: Omit<Campaign, "id">
) {
  return await addDoc(
    collection(db, COLLECTION_NAME),
    data
  );
}

export async function deleteCampaign(id: string) {
  return await deleteDoc(
    doc(db, COLLECTION_NAME, id)
  );
}

export function listenCampaigns(
  callback: (data: Campaign[]) => void
) {
  const q = query(
    collection(db, COLLECTION_NAME),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const campaigns: Campaign[] =
      snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Campaign[];

    callback(campaigns);
  });
}
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";

import {
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";

import { db, storage } from "@/firebase/client";

import { Poster } from "../types/poster";

const COLLECTION_NAME = "science_posters";

export async function uploadPosterImage(
  file: File
) {
  const fileName =
    Date.now() + "-" + file.name;

  const storageRef = ref(
    storage,
    `science/posters/${fileName}`
  );

  await uploadBytes(storageRef, file);

  return await getDownloadURL(storageRef);
}

export async function createPoster(
  data: Omit<Poster, "id">
) {
  return await addDoc(
    collection(db, COLLECTION_NAME),
    data
  );
}

export async function deletePoster(id: string) {
  return await deleteDoc(
    doc(db, COLLECTION_NAME, id)
  );
}

export function listenPosters(
  callback: (data: Poster[]) => void
) {
  const q = query(
    collection(db, COLLECTION_NAME),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const posters: Poster[] =
      snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Poster[];

    callback(posters);
  });
}
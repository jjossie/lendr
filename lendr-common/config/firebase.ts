export let db: FirebaseFirestore.Firestore = null;

export const setFirestore = (firestore: FirebaseFirestore.Firestore) => {
  db = firestore;
}


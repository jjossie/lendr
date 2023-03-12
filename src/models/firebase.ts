import {initializeApp} from "firebase/app";
import {getFirestore} from "firebase/firestore/lite";

const firebaseConfig = {
  apiKey: "AIzaSyB1yf5ad96w8C7AB-3VX_L-DDDXm3IiPHE",
  authDomain: "lendr-3e47b.firebaseapp.com",
  projectId: "lendr-3e47b",
  storageBucket: "lendr-3e47b.appspot.com",
  messagingSenderId: "833827423603",
  appId: "1:833827423603:web:0a2fa2bf74f1edc7ee3106",
  measurementId: "G-ZNV771VS4D"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

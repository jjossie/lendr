import {initializeApp} from 'firebase/app';
import {getAuth, initializeAuth} from 'firebase/auth';
import {getFirestore} from 'firebase/firestore';
import Constants from "expo-constants";
// import Geocoder from 'react-native-geocoding';
import {getReactNativePersistence} from "firebase/auth/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {getFunctions} from "firebase/functions";


const firebaseConfig = {
  apiKey: Constants.manifest?.extra?.firebaseApiKey,
  authDomain: Constants.manifest?.extra?.firebaseAuthDomain,
  projectId: Constants.manifest?.extra?.firebaseProjectId,
  storageBucket: Constants.manifest?.extra?.firebaseStorageBucket,
  messagingSenderId: Constants.manifest?.extra?.firebaseMessagingSenderId,
  appId: Constants.manifest?.extra?.firebaseAppId,
  measurementId: Constants.manifest?.extra?.firebaseMeasurementId,
};

export const app = initializeApp(firebaseConfig);
initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
export const db = getFirestore(app);
export const auth = getAuth(app);
export const functions = getFunctions(app);

// Geocoder.init(Constants.manifest?.extra?.firebaseApiKey);
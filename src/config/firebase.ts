import {getAuth} from '@react-native-firebase/auth';
import {getFirestore} from '@react-native-firebase/firestore';
import {getFunctions} from "@react-native-firebase/functions";
// import Constants from "expo-constants";
// import Geocoder from 'react-native-geocoding';


// const firebaseConfig = {
//   apiKey: Constants.expoConfig?.extra?.firebaseApiKey,
//   authDomain: Constants.expoConfig?.extra?.firebaseAuthDomain,
//   projectId: Constants.expoConfig?.extra?.firebaseProjectId,
//   storageBucket: Constants.expoConfig?.extra?.firebaseStorageBucket,
//   messagingSenderId: Constants.expoConfig?.extra?.firebaseMessagingSenderId,
//   appId: Constants.expoConfig?.extra?.firebaseAppId,
//   measurementId: Constants.expoConfig?.extra?.firebaseMeasurementId,
// };

// export const app = initializeApp(firebaseConfig);
// initializeAuth(app, {
  // persistence: getReactNativePersistence(AsyncStorage)
// });
export const db = getFirestore();
export const auth = getAuth();
export const functions = getFunctions();

// Geocoder.init(Constants.expoConfig?.extra?.firebaseApiKey);
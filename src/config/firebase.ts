import {getAuth} from '@react-native-firebase/auth';
import {getFirestore} from '@react-native-firebase/firestore';
import {getFunctions} from "@react-native-firebase/functions";

export const db = getFirestore();
export const auth = getAuth();
export const functions = getFunctions();

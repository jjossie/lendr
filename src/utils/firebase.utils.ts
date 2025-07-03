import { httpsCallable } from "@react-native-firebase/functions";
import { LendrBaseError } from "./errors";
import { functions } from "../config/firebase";
import { FieldPath, FirebaseFirestoreTypes } from "@react-native-firebase/firestore";
import { FirebaseAuthTypes } from "@react-native-firebase/auth";

export async function callCloudFunction(functionName: string, requestData: any) {
    console.log(`🤝Calling Cloud Function ${functionName} with data: ${JSON.stringify(requestData)}`);
    const cloudFunction = httpsCallable(functions, functionName);
    console.log(`🤝Cloud function:`, cloudFunction);
    try {
      const result = await cloudFunction(requestData);
      console.log(`🤝${functionName} result:`, JSON.stringify(result.data, null, 2));
    } catch (e: any) {
      // console.error(e.message);
      // console.error(JSON.stringify(e));
      throw new LendrBaseError(`Something went wrong calling the cloud function ${functionName}: ${JSON.stringify(e, null, 2)}`);
    }
  }

  export const documentId = () => { return new FieldPath("__name__")};
  
export type DocumentData = FirebaseFirestoreTypes.DocumentData;
export type QuerySnapshot = FirebaseFirestoreTypes.QuerySnapshot;
export type AuthUser = FirebaseAuthTypes.User;
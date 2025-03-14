import { httpsCallable } from "firebase/functions";
import { LendrBaseError } from "./errors";
import { functions } from "../config/firebase";

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
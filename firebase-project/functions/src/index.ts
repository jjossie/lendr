/**
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */


// Initialize the Firebase App before doing anything else
import {initializeApp} from "firebase-admin/app";

initializeApp();


// Export functions from this module
export {chatMessageNotification} from "./chatMessageNotification";
export * from "./demo";


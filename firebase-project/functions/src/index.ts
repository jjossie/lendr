/**
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */


// Initialize the Firebase App before doing anything else
import {initializeApp} from "firebase-admin/app";

initializeApp();


// Export functions from this module
export {chatMessageNotification} from "./chatMessageNotification";
export {algoliaTransformOnIndex} from "./algoliaTransformOnIndex";
export {validateTool} from "./validateTool";
export {validateTool_TEST} from "./validateTool_TEST";
export {confirmToolReceived} from "./handoff";
import {onDocumentCreated} from "firebase-functions/v2/firestore";
import {logger} from "firebase-functions";
import {FieldValue, Timestamp} from "firebase-admin/firestore";
import {HttpsError} from "firebase-functions/v2/https";

import { lendrUserInputSchema, LendrUserModelValidated } from "../models/lendrUser.model";

export const onCreateUser = onDocumentCreated("/users/{userId}", async (event) => {
  logger.info(`[onCreateUser] Triggered for userId: ${event.params.userId}`);

  const snapshot = event.data;
  if (!snapshot) {
    logger.error("[onCreateUser] No data associated with the event.");
    throw new HttpsError("internal", "No data associated with the event.");
  }

  const userInputData = snapshot.data();

  // 1. Validation
  logger.debug("[onCreateUser] Validating input data...");
  const parsedUserInput = lendrUserInputSchema.safeParse(userInputData);

  if (!parsedUserInput.success) {
    logger.error(`[onCreateUser] Invalid user input data for userId: ${event.params.userId}`, parsedUserInput.error.flatten());
    // Consider deleting the malformed document: await snapshot.ref.delete();
    throw new HttpsError("invalid-argument", "Invalid user data provided.", parsedUserInput.error.flatten());
  }

  const userInput = parsedUserInput.data;
  logger.info(`[onCreateUser] User input data validated for userId: ${event.params.userId}, Name: ${userInput.displayName}`);

  // 2. Data Setup & Defaults
  logger.debug(`[onCreateUser] Starting data setup for userId: ${event.params.userId}`);

  // Check UID consistency
  if (userInput.uid !== event.params.userId) {
    logger.error(`[onCreateUser] Mismatch between input UID (${userInput.uid}) and document ID (${event.params.userId}).`);
    // This is a critical inconsistency. Deleting the document might be appropriate.
    await snapshot.ref.delete();
    throw new HttpsError("invalid-argument", "User UID in data does not match document ID.");
  }

  const createdAt = FieldValue.serverTimestamp() as Timestamp;
  
  // Initialize empty arrays for fields not in LendrUserInputSchema but in LendrUserModelValidated
  const relations: string[] = []; 
  const expoPushTokens: string[] = [];

  // displayName is already required by lendrUserInputSchema, so no need to derive it here.

  // 3. Construct Final User Document
  // userInput contains: firstName, lastName, displayName, uid, and optional providerData, photoURL, email
  const userDoc: LendrUserModelValidated = {
    ...userInput, 
    createdAt: createdAt,
    relations: relations,
    expoPushTokens: expoPushTokens,
    // All fields from LendrUserModelValidated should be covered.
    // uid, displayName, firstName, lastName, photoURL, email, providerData are from userInput.
  };
  logger.debug(`[onCreateUser] Constructed final user document for userId: ${event.params.userId}`);
  
  // 4. Write to Firestore
  logger.info(`[onCreateUser] Writing final user document to Firestore for userId: ${event.params.userId}`);
  try {
    await snapshot.ref.set(userDoc, {merge: false}); // merge:false is crucial for onCreate
    logger.info(`[onCreateUser] Successfully wrote user document for userId: ${event.params.userId} to Firestore.`);
  } catch (error) {
    logger.error(`[onCreateUser] Error writing user document for userId: ${event.params.userId} to Firestore:`, error);
    // The function will terminate, and the initial document (that triggered this) might remain.
    if (error instanceof HttpsError) throw error; // Should not happen here
    throw new HttpsError("internal", "Failed to save the processed user document.", { error });
  }

  logger.debug(`[onCreateUser] Function execution completed for userId: ${event.params.userId}`);
});

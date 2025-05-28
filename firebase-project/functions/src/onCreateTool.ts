import {onDocumentCreated} from "firebase-functions/v2/firestore";
import {logger} from "firebase-functions";
import {FieldValue, Timestamp, Geopoint as AdminGeoPoint} from "firebase-admin/firestore"; // Import AdminGeoPoint for type safety if needed
import {HttpsError} from "firebase-functions/v2/https";

import { toolInputSchema, ToolModelValidated } from "../models/tool.model";
import { LendrUserPreviewValidated, lendrUserPreviewSchema } from "../models/lendrUser.model";
import { getHydratedUserPreview } from "../controllers/users.controller";
import { getGeohashedLocation, getCityNameFromGeopoint } from "../utils/location";
import {Geopoint as CommonGeoPoint} from "geofire-common"; // For util functions

export const onCreateTool = onDocumentCreated("/tools/{toolId}", async (event) => {
  logger.info(`[onCreateTool] Triggered for toolId: ${event.params.toolId}`);

  const snapshot = event.data;
  if (!snapshot) {
    logger.error("[onCreateTool] No data associated with the event.");
    throw new HttpsError("internal", "No data associated with the event.");
  }

  const toolInputData = snapshot.data();

  // 1. Validation
  logger.debug("[onCreateTool] Validating input data...");
  const parsedToolInput = toolInputSchema.safeParse(toolInputData);

  if (!parsedToolInput.success) {
    logger.error(`[onCreateTool] Invalid tool input data for toolId: ${event.params.toolId}`, parsedToolInput.error.flatten());
    // Consider deleting the malformed document: await snapshot.ref.delete();
    throw new HttpsError("invalid-argument", "Invalid tool data provided.", parsedToolInput.error.flatten());
  }

  const toolInput = parsedToolInput.data;
  logger.info(`[onCreateTool] Tool input data validated for toolId: ${event.params.toolId}, Name: ${toolInput.name}`);

  // 2. Denormalization/Data Embedding & Setup
  logger.debug(`[onCreateTool] Starting denormalization for toolId: ${event.params.toolId}`);

  let lenderPreview: LendrUserPreviewValidated;
  let holderPreview: LendrUserPreviewValidated;

  try {
    logger.debug(`[onCreateTool] Fetching lender preview for UID: ${toolInput.lenderUid}`);
    lenderPreview = await getHydratedUserPreview(toolInput.lenderUid);
    const lenderValidation = lendrUserPreviewSchema.safeParse(lenderPreview);
    if(!lenderValidation.success) {
        logger.error(`[onCreateTool] Fetched lender preview is invalid for UID: ${toolInput.lenderUid}`, lenderValidation.error.flatten());
        throw new HttpsError("internal", "Failed to fetch or validate lender preview.");
    }
    lenderPreview = lenderValidation.data;

    if (toolInput.holderUid && toolInput.holderUid !== toolInput.lenderUid) {
      logger.debug(`[onCreateTool] Fetching holder preview for UID: ${toolInput.holderUid}`);
      holderPreview = await getHydratedUserPreview(toolInput.holderUid);
      const holderValidation = lendrUserPreviewSchema.safeParse(holderPreview);
      if(!holderValidation.success) {
        logger.error(`[onCreateTool] Fetched holder preview is invalid for UID: ${toolInput.holderUid}`, holderValidation.error.flatten());
        throw new HttpsError("internal", "Failed to fetch or validate holder preview.");
      }
      holderPreview = holderValidation.data;
    } else {
      logger.debug(`[onCreateTool] Using lender preview as holder preview for toolId: ${event.params.toolId}`);
      holderPreview = lenderPreview;
    }
    logger.info(`[onCreateTool] Successfully fetched user previews for toolId: ${event.params.toolId}`);
  } catch (error) {
    logger.error(`[onCreateTool] Failed to hydrate user previews for toolId: ${event.params.toolId}`, error);
    // await snapshot.ref.delete(); // Consider cleanup
    if (error instanceof HttpsError) throw error;
    throw new HttpsError("internal", "Failed to retrieve user information for the tool.");
  }

  let locationObject: ToolModelValidated['location'] = undefined; // Location is optional in ToolModel
  if (toolInput.geopoint) {
    try {
      logger.debug(`[onCreateTool] Processing geopoint for toolId: ${event.params.toolId}`, toolInput.geopoint);
      const commonGeoPoint: CommonGeoPoint = [toolInput.geopoint[0], toolInput.geopoint[1]];
      const {geohash} = getGeohashedLocation(commonGeoPoint);
      const city = await getCityNameFromGeopoint(commonGeoPoint);
      locationObject = {
        latitude: commonGeoPoint[0],
        longitude: commonGeoPoint[1],
        geohash: geohash,
        city: city,
      };
      logger.info(`[onCreateTool] Successfully processed location for toolId: ${event.params.toolId}. City: ${city}`);
    } catch (error) {
      logger.error(`[onCreateTool] Failed to process geopoint for toolId: ${event.params.toolId}`, error);
      // Not throwing error here, as location might be considered non-critical for tool creation
      // Or, could throw if location is mandatory: throw new HttpsError("internal", "Failed to process geopoint.");
    }
  }

  const createdAt = FieldValue.serverTimestamp() as Timestamp;
  const modifiedAt = createdAt; // On creation, modifiedAt is same as createdAt

  // 3. Construct Final Tool Document
  // Note: toolInput already contains name, brand, description, imageUrls, rate, preferences, visibility, lenderUid, holderUid
  const toolDoc: ToolModelValidated = {
    ...toolInput, 
    id: event.params.toolId,
    lender: lenderPreview,
    holder: holderPreview,
    location: locationObject, // This will be undefined if geopoint processing failed or no geopoint provided
    createdAt: createdAt,
    modifiedAt: modifiedAt,
    // deletedAt is not set at creation
  };
  logger.debug(`[onCreateTool] Constructed final tool document for toolId: ${event.params.toolId}`);

  // 4. Write to Firestore
  logger.info(`[onCreateTool] Writing denormalized tool document to Firestore for toolId: ${event.params.toolId}`);
  try {
    await snapshot.ref.set(toolDoc, {merge: false}); // merge:false is crucial for onCreate
    logger.info(`[onCreateTool] Successfully wrote tool document for toolId: ${event.params.toolId} to Firestore.`);
  } catch (error) {
    logger.error(`[onCreateTool] Error writing tool document for toolId: ${event.params.toolId} to Firestore:`, error);
    if (error instanceof HttpsError) throw error;
    throw new HttpsError("internal", "Failed to save the processed tool document.", { error });
  }

  logger.debug(`[onCreateTool] Function execution completed for toolId: ${event.params.toolId}`);
});

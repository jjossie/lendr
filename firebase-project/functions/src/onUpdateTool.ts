import {onDocumentUpdated, Change} from "firebase-functions/v2/firestore";
import {logger} from "firebase-functions";
import {FieldValue, Timestamp, Geopoint as AdminGeoPoint} from "firebase-admin/firestore";
import {HttpsError} from "firebase-functions/v2/httpsError";
import { DocumentSnapshot } from "firebase-functions/v1/firestore";
import {isEqual} from "lodash";

import { toolModelSchema, ToolModelValidated } from "../models/tool.model";
import { LendrUserPreviewValidated, lendrUserPreviewSchema } from "../models/lendrUser.model";
import { getHydratedUserPreview } from "../controllers/users.controller";
import { getGeohashedLocation, getCityNameFromGeopoint } from "../utils/location";
import {Geopoint as CommonGeoPoint} from "geofire-common";

export const onUpdateTool = onDocumentUpdated("/tools/{toolId}", async (event: Change<DocumentSnapshot>) => {
  logger.info(`[onUpdateTool] Triggered for toolId: ${event.params.toolId}`);

  const beforeData = event.data.before.data() as ToolModelValidated | undefined;
  const afterData = event.data.after.data() as ToolModelValidated | undefined;

  if (!afterData) {
    logger.info(`[onUpdateTool] Tool document ${event.params.toolId} was deleted. No action taken.`);
    return;
  }

  if (!beforeData) {
    logger.warn(`[onUpdateTool] No 'before' data for tool document ${event.params.toolId}, though it's an update event. This is unusual.`);
  }

  const updatedFields: Partial<ToolModelValidated> = {};

  // Denormalization/Re-embedding
  // Lender Preview
  if (afterData.lenderUid) {
    const lenderUidChanged = beforeData?.lenderUid !== afterData.lenderUid;
    let shouldFetchLender = lenderUidChanged || !afterData.lender; // Fetch if UID changed or lender preview missing

    if (!shouldFetchLender && afterData.lender) { // If UID same and lender preview exists, check if it's stale
        try {
            const potentiallyFreshLenderPreview = await getHydratedUserPreview(afterData.lenderUid);
            if (!isEqual(potentiallyFreshLenderPreview, afterData.lender)) {
                shouldFetchLender = true;
            }
        } catch (error) {
            logger.error(`[onUpdateTool] Error fetching lender preview for staleness check (UID: ${afterData.lenderUid}):`, error);
            // Proceed with existing afterData.lender if staleness check fails
        }
    }
    
    if (shouldFetchLender) {
      try {
        logger.info(`[onUpdateTool] Refreshing lender preview for UID: ${afterData.lenderUid}`);
        const lenderPreview = await getHydratedUserPreview(afterData.lenderUid);
        const parsedPreview = lendrUserPreviewSchema.safeParse(lenderPreview);
        if (parsedPreview.success) {
          if (!isEqual(parsedPreview.data, afterData.lender)) {
            updatedFields.lender = parsedPreview.data;
          }
        } else {
          logger.error(`[onUpdateTool] Fetched lender preview for UID ${afterData.lenderUid} is invalid.`, parsedPreview.error.flatten());
        }
      } catch (error) {
        logger.error(`[onUpdateTool] Failed to hydrate lender preview for UID: ${afterData.lenderUid}`, error);
      }
    }
  }

  // Holder Preview
  const holderUidToFetch = afterData.holderUid || afterData.lenderUid; // Default to lenderUid if holderUid is not set
  if (holderUidToFetch) {
    const holderUidChanged = beforeData?.holderUid !== afterData.holderUid;
    const effectiveHolderUidChanged = (beforeData?.holderUid || beforeData?.lenderUid) !== holderUidToFetch;
    let shouldFetchHolder = holderUidChanged || effectiveHolderUidChanged || !afterData.holder;

    if (!shouldFetchHolder && afterData.holder) { // If UID same and holder preview exists, check if it's stale
        try {
            const potentiallyFreshHolderPreview = await getHydratedUserPreview(holderUidToFetch);
            if (!isEqual(potentiallyFreshHolderPreview, afterData.holder)) {
                shouldFetchHolder = true;
            }
        } catch (error) {
            logger.error(`[onUpdateTool] Error fetching holder preview for staleness check (UID: ${holderUidToFetch}):`, error);
        }
    }

    if (shouldFetchHolder) {
      try {
        logger.info(`[onUpdateTool] Refreshing holder preview for UID: ${holderUidToFetch}`);
        const holderPreview = await getHydratedUserPreview(holderUidToFetch);
        const parsedPreview = lendrUserPreviewSchema.safeParse(holderPreview);
        if (parsedPreview.success) {
          if (!isEqual(parsedPreview.data, afterData.holder)) {
            updatedFields.holder = parsedPreview.data;
          }
        } else {
          logger.error(`[onUpdateTool] Fetched holder preview for UID ${holderUidToFetch} is invalid.`, parsedPreview.error.flatten());
        }
      } catch (error) {
        logger.error(`[onUpdateTool] Failed to hydrate holder preview for UID: ${holderUidToFetch}`, error);
      }
    }
  }
  
  // Location (from geopoint if present)
  // geopoint is an input field, not part of the final Tool model in toolSchema.
  // It's assumed to be potentially present in afterData if the client just wrote it.
  const geopointInAfterData = (afterData as any).geopoint; 
  if (Array.isArray(geopointInAfterData) && geopointInAfterData.length === 2 &&
      typeof geopointInAfterData[0] === 'number' && typeof geopointInAfterData[1] === 'number') {
    const commonGeoPoint: CommonGeoPoint = [geopointInAfterData[0], geopointInAfterData[1]];
    const geopointChanged = !beforeData || !isEqual((beforeData as any).geopoint, commonGeoPoint);

    if (geopointChanged || !afterData.location) {
      try {
        logger.info(`[onUpdateTool] Processing geopoint for toolId: ${event.params.toolId}`);
        const {geohash} = getGeohashedLocation(commonGeoPoint);
        const city = await getCityNameFromGeopoint(commonGeoPoint);
        const newLocation = {
          latitude: commonGeoPoint[0],
          longitude: commonGeoPoint[1],
          geohash: geohash,
          city: city,
        };
        if (!isEqual(newLocation, afterData.location)) {
          updatedFields.location = newLocation;
          // Also remove the transient geopoint field from the document if it was written by client
          updatedFields.geopoint = FieldValue.delete() as any; 
        }
      } catch (error) {
        logger.error(`[onUpdateTool] Failed to process geopoint for toolId: ${event.params.toolId}`, error);
      }
    }
  } else if (geopointInAfterData === undefined && (afterData as any).geopoint !== undefined) {
      // If geopoint field was explicitly set to null or deleted by client, ensure it's removed from Firestore.
      updatedFields.geopoint = FieldValue.delete() as any;
  }


  // Timestamps
  updatedFields.modifiedAt = FieldValue.serverTimestamp() as Timestamp;

  // Validation
  const candidateToolData: ToolModelValidated = {
    ...(afterData as ToolModelValidated),
    ...updatedFields,
  };
  // Remove geopoint from candidate if it was meant to be deleted and not set by location hydration
  if (updatedFields.geopoint && candidateToolData.geopoint === undefined) {
      delete candidateToolData.geopoint; // ensure it's not in the validated object if deleted
  }


  const parsedCandidateTool = toolModelSchema.safeParse(candidateToolData);

  if (!parsedCandidateTool.success) {
    logger.error(`[onUpdateTool] Invalid candidate tool data for toolId: ${event.params.toolId}`, parsedCandidateTool.error.flatten());
    throw new HttpsError("failed-precondition", "Updated tool data is invalid.", parsedCandidateTool.error.flatten());
  }

  const validatedToolData = parsedCandidateTool.data;
  logger.info(`[onUpdateTool] Candidate tool data validated for toolId: ${event.params.toolId}`);

  // Write to Firestore
  if (Object.keys(updatedFields).length > 0) {
    logger.info(`[onUpdateTool] Writing updated tool document to Firestore for toolId: ${event.params.toolId}. Changes: ${Object.keys(updatedFields).join(", ")}`);
    try {
      await event.data.after.ref.set(validatedToolData, {merge: true});
      logger.info(`[onUpdateTool] Successfully wrote updates for toolId: ${event.params.toolId} to Firestore.`);
    } catch (error) {
      logger.error(`[onUpdateTool] Error writing updates for toolId: ${event.params.toolId} to Firestore:`, error);
      if (error instanceof HttpsError) throw error;
      throw new HttpsError("internal", "Failed to save the updated tool document.", { error });
    }
  } else {
    logger.info(`[onUpdateTool] No meaningful changes to write for toolId: ${event.params.toolId}.`);
  }

  logger.debug(`[onUpdateTool] Function execution completed for toolId: ${event.params.toolId}`);
});

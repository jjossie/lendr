import {onDocumentCreated} from "firebase-functions/v2/firestore";
import {logger} from "firebase-functions";
import {getFirestore} from "firebase-admin/firestore";
import {getCityNameFromGeopoint, getGeohashedLocation} from "./utils/location";
import {Geopoint} from "geofire-common";
import {Tool, ToolForm, toolFormSchema} from "./models/tool.model";
import { getHydratedUserPreview } from "./controllers/users.controller";
import { LendrBaseError, ObjectValidationError } from "./utils/errors";


export const validateTool = onDocumentCreated("/tools/{toolId}", async (event) => {
  if (!event.data) throw new LendrBaseError("No data in event");
  logger.info("Validating new tool: ", event.data.id);
  const db = getFirestore();
  /**
   * Validation
   */
  const toolFormParsed = toolFormSchema.safeParse(event.data.data());
  if (!toolFormParsed.success) throw new ObjectValidationError("Invalid Tool Form Input", toolFormParsed.error);
  const toolForm = toolFormParsed.data as ToolForm;

  let hydroDoc: Tool = {...toolForm};
  // TODO do we need to delete the geopoint?

  logger.info("Hydrating newly created tool: ", toolForm.name);

  /**
   * Hydration
   */

  // Hydrate Lender/Holder user previews
  try {
    // Check lenderUid and hydrate lender object accordingly
    const hydroLender = await getHydratedUserPreview(toolForm.lenderUid);
    hydroDoc.lender = hydroLender;


    // Check holderUid and hydrate holder object accordingly
    if (!toolForm.holderUid) // Just copy the lender if it wasn't included
      toolForm.holderUid = toolForm.lenderUid;

    if (toolForm.holderUid === toolForm.lenderUid) {
      logger.info("Using lender info as holder info")
      hydroDoc.holder = hydroLender;
    } else {
      const hydroHolder = await getHydratedUserPreview(toolForm.holderUid);
      hydroDoc.holder = hydroHolder;
    }
  } catch (error) {
    logger.error("🔥 Failed to Validate Tool. Likely Failed to hydrate user object for lender or holder. Deleting incomplete tool.",
                 error);
    await event.data.ref.delete();
    return;
  }

  // Check location geopoint and hydrate geohash and city accordingly
  if (toolForm.geopoint[0] && toolForm.geopoint[1]) {
    const geopoint: Geopoint = [toolForm.geopoint[0], toolForm.geopoint[1]];
    const {geohash} = getGeohashedLocation(geopoint);
    const city = await getCityNameFromGeopoint(geopoint);
    hydroDoc.location = {
      latitude: toolForm.geopoint[0],
      longitude: toolForm.geopoint[1],
      geohash,
      city,
    };
    logger.info("Hydrated Location: ", city, "Geohash: ", geohash);
  }

  // Write the validated, hydrated tool to Firestore

  try {
    await event.data.ref.set(hydroDoc, {merge: false});
    logger.info("Successfully hydrated & validated tool ", hydroDoc.name,
        "With ID: ", event.params.toolId);
  } catch (e) {
    logger.error("Error Saving tool after hydrating & validating: ", hydroDoc.name,
        "With ID: ", event.params.toolId, e);
    throw e;
  }
});
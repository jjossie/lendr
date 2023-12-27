import {onDocumentCreated} from "firebase-functions/v2/firestore";
import {logger} from "firebase-functions";
import {getFirestore} from "firebase-admin/firestore";
import {getCityNameFromGeopoint, getGeohashedLocation} from "./utils/location";
import {Geopoint} from "geofire-common";
import {Tool, ToolAdminForm} from "./models/tool";


export const validateTool = onDocumentCreated("/tools/{toolId}", async (event) => {
  logger.info("Validating new tool: ", event.data.id);
  const db = getFirestore();
  /**
   * Validation
   */
  const rawDoc = event.data.data() as ToolAdminForm;
  // @ts-ignore
  let hydroDoc: Tool = {...rawDoc};
  // @ts-ignore
  delete hydroDoc.geopoint;

  // Ensure all required fields are populated: [name, description, lenderUid, imageUrls[0], preferences, rate,
  // location.latitude, location.longitude]
  if (!rawDoc.name
      || !rawDoc.description
      || !rawDoc.lenderUid
      || !rawDoc.imageUrls[0]
      || !rawDoc.preferences
      || !rawDoc.rate
      || !rawDoc.geopoint[0]
      || !rawDoc.geopoint[1]) {
    logger.error("Missing required fields on newly created tool: ", rawDoc);
  }

  logger.info("Hydrating newly created tool: ", rawDoc.name);

  // Trim strings for whitespace
  hydroDoc.name = rawDoc.name.trim();
  hydroDoc.description = rawDoc.description.trim();
  if (typeof rawDoc.brand === "string")
    hydroDoc.brand = rawDoc.brand.trim();

  /**
   * Hydration
   */


  // Check lenderUid and hydrate lender object accordingly
  const lenderSnap = await db.collection("users").doc(rawDoc.lenderUid).get();
  const lender = lenderSnap.data();
  const lenderDisplayName = `${lender.firstName} ${lender.lastName}`;

  if (!lenderSnap.exists) {
    logger.error("Lender does not exist: ", rawDoc.lenderUid);
    // Delete the document if the lender does not exist
    await event.data.ref.delete();
    return;
  }

  logger.info("Found Lender: ", lenderDisplayName);
  const hydroLender = {
    uid: rawDoc.lenderUid,
    displayName: lenderDisplayName, // TODO: Add picture
  };
  hydroDoc.lender = hydroLender;


  // Check holderUid and hydrate holder object accordingly
  if (!rawDoc.holderUid) // Just copy the lender if it wasn't included
    rawDoc.holderUid = rawDoc.lenderUid;

  if (rawDoc.holderUid === rawDoc.lenderUid) {
    logger.info("Using lender info as holder info")
    hydroDoc.holder = hydroLender;
  } else {

    const holderSnap = await db.collection("users").doc(rawDoc.holderUid).get();
    const holder = holderSnap.data();
    
    if (!holderSnap.exists) {
      logger.error("Holder does not exist: ", rawDoc.holderUid);
      logger.error("Deleting incomplete tool");
      // Delete the document if the holder does not exist
      await event.data.ref.delete();
      return;
    }
    
    logger.info("Found Holder: ", rawDoc.holderUid);
    const holderDisplayName = `${holder.firstName} ${holder.lastName}`;
    logger.info("Holder DisplayName: ", holderDisplayName);
    hydroDoc.holder = {
      uid: rawDoc.holderUid,
      displayName: holderDisplayName,
    };
  }

  // Check location geopoint and hydrate geohash and city accordingly
  if (rawDoc.geopoint[0] && rawDoc.geopoint[1]) {
    const geopoint: Geopoint = [rawDoc.geopoint[0], rawDoc.geopoint[1]];
    const {geohash} = getGeohashedLocation(geopoint);
    const city = await getCityNameFromGeopoint(geopoint);
    hydroDoc.location = {
      latitude: rawDoc.geopoint[0],
      longitude: rawDoc.geopoint[1],
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
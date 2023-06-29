import {onDocumentCreated} from "firebase-functions/v2/firestore";
import {logger} from "firebase-functions";
import {getFirestore} from "firebase-admin/firestore";
import {getCityNameFromGeopoint, getGeohashedLocation} from "./models/Location";
import {Geopoint} from "geofire-common";


export const validateTool = onDocumentCreated("/tools/{toolId}", async (event) => {

  const db = getFirestore();
  /**
   * Validation
   */
  const rawDoc = event.data.data();
  let hydroDoc = {...rawDoc};

  // Ensure all required fields are populated: [name, description, lenderId, imageUrls[0], preferences, rate,
  // location.latitude, location.longitude]
  if (!rawDoc.name
      || !rawDoc.description
      || !rawDoc.lenderId
      || !rawDoc.imageUrls[0]
      || !rawDoc.preferences
      || !rawDoc.rate
      || !rawDoc.location.latitude
      || !rawDoc.location.longitude) {
    logger.error("Missing required fields on newly created tool: ", rawDoc);
  }

  logger.info("Hydrating newly created tool: ", rawDoc.name)

  // Trim strings for whitespace
  hydroDoc.name = rawDoc.name.trim();
  hydroDoc.description = rawDoc.description.trim();
  if (typeof rawDoc.brand === "string")
    hydroDoc.brand = rawDoc.brand.trim();

  /**
   * Hydration
   */

  // Check lenderId and hydrate lender object accordingly
  const lenderSnap = await db.collection("users").doc(rawDoc.lenderId).get();
  const lender = lenderSnap.data();
  const lenderDisplayName = `${lender.firstName} ${lender.lastName}`;

  if (!lender.exists) {
    logger.error("Lender does not exist: ", rawDoc.lenderId);
  }
  logger.info("Found Lender: ", lenderDisplayName);
  const hydroLender = {
    uid: rawDoc.lenderId,
    displayName: lenderDisplayName, // TODO: Add email, picture, etc.
  };
  hydroDoc.lender = hydroLender;

  // Check holderId and hydrate holder object accordingly
  if (rawDoc.holderId === rawDoc.lenderId){
    hydroDoc.holder = hydroLender;
  }
  const holderSnap = await db.collection("users").doc(rawDoc.holderId).get();
  const holder = holderSnap.data();
  const holderDisplayName = `${holder.firstName} ${holder.lastName}`;

  if (!holder.exists) {
    logger.error("Holder does not exist: ", rawDoc.holderId);
  }
  logger.info("Found Holder: ", holderDisplayName);
  hydroDoc.holder = {
    uid: rawDoc.holderId,
    displayName: holderDisplayName,
  };

  // Check location geopoint and hydrate geohash and city accordingly
  if (rawDoc.location.latitude && rawDoc.location.longitude) {
    const geopoint: Geopoint = [rawDoc.location.latitude, rawDoc.location.longitude];
    const {geohash} = getGeohashedLocation(geopoint);
    const city = getCityNameFromGeopoint(geopoint);
    hydroDoc.location = {
      ...rawDoc.location,
      geohash,
      city,
    }
    logger.info("Hydrated Location: ", city, "Geohash: ", geohash);
  }

  // Write the validated, hydrated tool to Firestore

  // await db.collection("tools").doc(event.params.toolId).set(hydroDoc);
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
import {CallableRequest, onCall} from 'firebase-functions/v2/https';
import * as logger from "firebase-functions/logger";
import {getFirestore} from 'firebase-admin/firestore';
import {ITool} from "./models/Tool";

export const algoliaTransformOnIndex = onCall(async (request: CallableRequest<any>) => {
  logger.info("Algolia ft Joel is Indexing");
  logger.info(JSON.stringify(request.data));

  // noinspection TypeScriptValidateJSTypes
  const doc = await getFirestore().doc(request.data?.path).get();

  const tool = doc.data() as ITool;
  logger.info("Tool found for indexing: ", tool);

  // First of all, just don't send it if it's deleted
  if (tool.deletedAt)
  {
    logger.info("Tool is deleted, skipping indexing");
    return;
  }

  // Secondly, don't send it if it's not published
  if (tool.visibility !== "published") {
    logger.info("Tool is not published, skipping indexing");
    return;
  }

  // Grab what Algolia already grabbed (name, brand, description)
  let record = {
    ...request.data,
    price: tool.rate.price,
    timeUnit: tool.rate.timeUnit,
    delivery: tool.preferences.delivery,
    localPickup: tool.preferences.localPickup,
    useOnSite: tool.preferences.useOnSite,
  }

  // Attach the lender's name if possible
  if (tool.lender?.firstName && tool.lender?.lastName) {
    logger.info("Tool has lender, attaching lender name to record");
    record.lenderName = `${tool.lender.firstName} ${tool.lender.lastName}`;
  }

  // Attach the first image if possible
  if (tool.imageUrls?.length > 0) {
    logger.info("Tool has imageUrls, attaching first image to record");
    record.imageUrl = tool.imageUrls[0];
  }

  // Attach the city name if possible
  if (tool.location?.city) {
    logger.info("Tool has city, attaching city name to record");
    record.city = tool.location.city;
  }

  // Attach the relative distance if possible
  // if (tool.location?.distance) {
  //   logger.info("Tool has distance, attaching distance to record");
  //   record.distance = tool.location.distance;
  // } // TODO this is not really possible, since distance is relative to the current user,
       // which is not possible to know during indexing.


  return record;
});
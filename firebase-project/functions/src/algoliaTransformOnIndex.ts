import {CallableRequest, onCall} from 'firebase-functions/v2/https';
import * as logger from "firebase-functions/logger";
import {getFirestore} from 'firebase-admin/firestore';
import {Tool, ToolForm} from "./models/tool.model";

export const algoliaTransformOnIndex = onCall(async (request: CallableRequest<any>) => {
  logger.info("Algolia ft Joel is Indexing");
  logger.info(JSON.stringify(request.data));

  // noinspection TypeScriptValidateJSTypes
  const doc = await getFirestore().doc(request.data?.path).get();

  const tool = doc.data() as Tool & ToolForm;
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

  // Attach Location. This could be either a geopoint or a location, due to a race condition inherent to
  // having two separate cloud functions trigger on the action (document created under "/tools"). Both
  // validateTool() and executeIndexOperation() (which calls algoliaTransformOnIndex()) will be triggered.
  if (tool.location?.latitude && tool.location?.latitude)
    record._geoloc = {lat: tool.location.latitude, lng: tool.location.longitude}
  else if (tool.geopoint)
    record._geoloc = {lat: tool.geopoint[0], lng: tool.geopoint[1]}
  else{
    logger.error("Tool has no geopoint or location, index will be created but is not geo-locatable")
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


  return record;
});
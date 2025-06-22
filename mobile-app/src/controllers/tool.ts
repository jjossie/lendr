import {
  collection,
  deleteDoc,
  doc,
  DocumentData,
  endAt,
  getDoc,
  getDocs,
  orderBy,
  query,
  QuerySnapshot,
  serverTimestamp,
  setDoc,
  startAt,
  Timestamp,
  where,
} from "firebase/firestore";
import {db} from "../config/firebase";
import {Tool, ToolForm, ToolHydrated} from "../models/tool";
import {ToolModelSchema, ToolValidated} from "../models/tool.zod";
import {getAuth} from "firebase/auth";
import {AuthError, NotFoundError, ObjectValidationError} from "../utils/errors";

import {Geopoint} from "geofire-common";
import {distanceBetweenMi, getCityNameFromGeopoint, getGeohashedLocation, metersFromMiles} from "../models/location";
import { getUserFromUid, getUserPreviewFromUid } from "./auth";

const geofire = require("geofire-common");

export function getNextToolId() {
  console.log("🪛making tool id");
  const docRef = doc(collection(db, "tools"));
  console.log("🪛made tool id", docRef);
  return docRef.id;
}

export async function createTool(toolForm: ToolForm, toolId: string) {
  if (!toolId)
    throw new ObjectValidationError("ToolId is required for creation");

  const toolDocRef = doc(db, "tools", toolId)

  console.log("🪛Attempting to add new tool with id: ", toolDocRef.id);
  // Pretty sure this validation is now unnecessary because tools will always be created as drafts.
  const hasAllFields = (
      toolForm.description &&
      toolForm.name &&
      toolForm.rate.price &&
      toolForm.rate.timeUnit &&
      toolForm.preferences &&
      toolForm.geopoint &&
      toolForm.imageUrls &&
      toolForm.imageUrls.length > 0
  );

  if (!hasAllFields && toolForm.visibility == "published")
    throw new ObjectValidationError("Missing properties on newTool", toolForm);

  else if (!toolForm.geopoint)
    throw new ObjectValidationError("Draft tool must still have a geopoint", toolForm)

  if (toolForm.visibility != "published")
    toolForm.visibility = "draft";

  const auth = getAuth();
  if (!auth.currentUser)
    throw new AuthError();

  const toolData: Tool = {
    lenderUid: auth.currentUser.uid,
    holderUid: auth.currentUser.uid,
    createdAt: serverTimestamp() as Timestamp,
    modifiedAt: serverTimestamp() as Timestamp,
    location: getGeohashedLocation(toolForm.geopoint),

    // ...toolForm properties
    name: toolForm.name,
    description: toolForm.description,
    rate: toolForm.rate,
    preferences: toolForm.preferences,
    imageUrls: toolForm.imageUrls,
    visibility: toolForm.visibility,
  };
  const existingDoc = await getDoc(toolDocRef);
  if (existingDoc.exists())
    throw new ObjectValidationError("🪛Tool already exists", toolForm);

  await setDoc(toolDocRef, toolData);
  console.log("🪛Added New Tool: ", toolDocRef.id);
}

export async function editTool(toolId: string, toolForm: ToolForm) {
  console.log(`🪛Editing tool ${toolId}`);
  // Validate Fields
  if (!(
      toolForm.description &&
      toolForm.name &&
      toolForm.rate.price &&
      toolForm.rate.timeUnit &&
      toolForm.preferences
  ))
    throw new ObjectValidationError("Missing properties on newTool", toolForm);

  const auth = getAuth();
  if (!auth.currentUser)
    throw new AuthError("Must be logged in 😱");

  const toolDataDiff: any = { // No type assertion because I don't wanna make yet another tool type rn
    modifiedAt: serverTimestamp(),

    // ...toolForm properties
    name: toolForm.name,
    description: toolForm.description,
    rate: toolForm.rate,
    preferences: toolForm.preferences,
    imageUrls: toolForm.imageUrls,
    visibility: toolForm.visibility,
  };

  if (toolForm.brand)
    toolDataDiff.brand = toolForm.brand;
  return setDoc(doc(db, "tools", toolId), toolDataDiff, {merge: true});
}

export async function deleteTool(toolId: string) {
  console.log(`🪛Deleting tool ${toolId}`);

  // Confirm user is logged in
  const auth = getAuth();
  if (!auth.currentUser)
    throw new AuthError("Must be logged in 🤬");

  // Confirm this tool exists
  const toolRef = doc(db, "tools", toolId);
  const toolSnap = await getDoc(toolRef);
  if (!toolSnap.exists())
    throw new NotFoundError(`Tool with id ${toolId} not found 🤷‍`);

  const docData = toolSnap.data();
  if (!docData) {
    // This case should ideally be covered by toolSnap.exists(), but good to be safe
    throw new NotFoundError(`Tool data is undefined for id ${toolId} before deletion 🤷‍`);
  }

  const validationResult = ToolModelSchema.safeParse(docData);
  if (!validationResult.success) {
    console.error("Validation failed for tool scheduled for deletion:", toolId, validationResult.error.flatten());
    // Depending on policy, we might still allow deletion or halt to investigate
    throw new ObjectValidationError(`Tool data validation failed for id ${toolId} before deletion 😥`, validationResult.error);
  }
  const validatedToolData = validationResult.data;

  // Confirm this user owns it
  if (validatedToolData.lenderUid != auth.currentUser.uid)
    throw new AuthError("You are not authorized to delete this tool 🤨");

  return deleteDoc(toolRef);
}

/**
 * @deprecated Use getToolsWithinRadius instead
 * @returns {Promise<Tool[]>}
 */
export async function getAllTools(): Promise<Tool[]> {
  const querySnapshot = await getDocs(collection(db, "tools"));
  let tools: Tool[] = [];
  querySnapshot.forEach(doc => {
    const docData = doc.data();
    if (!docData) {
      console.warn(`Document data is undefined for doc id ${doc.id} in getAllTools, skipping.`);
      return; // Skip this document
    }

    const validationResult = ToolModelSchema.safeParse(docData);
    if (!validationResult.success) {
      console.error("Validation failed for tool in getAllTools:", doc.id, validationResult.error.flatten());
      // Skipping the tool, as this is a list operation.
      return; 
    }
    // Ensure the final object matches the Tool interface, including 'id'
    tools.push({
      id: doc.id, // ID from the document snapshot
      ...validationResult.data, // Spread the validated data
    } as Tool); //TODO: Remove 'as Tool' by ensuring validatedToolData + id is Tool
  });
  return tools;
}


export async function getToolById(toolId: string, userGeopoint?: Geopoint): Promise<ToolHydrated | undefined> {
  const toolDocRef = doc(db, "tools", toolId);
  const toolDocSnap = await getDoc(toolDocRef);

  if (!toolDocSnap.exists())
    throw new NotFoundError(`Tool with id ${toolId} does not exist in database 🫢`);

  const docData = toolDocSnap.data();
  if (!docData) {
    // This case should ideally be covered by toolDocSnap.exists(), but good to be safe
    throw new NotFoundError(`Tool data is undefined for id ${toolId} 🤷‍`);
  }

  const validationResult = ToolModelSchema.safeParse(docData);

  if (!validationResult.success) {
    console.error("Validation failed for tool:", toolId, validationResult.error);
    throw new ObjectValidationError(`Tool data validation failed for id ${toolId} 😥`, validationResult.error);
  }

  const validatedToolData = validationResult.data;
  
  return hydrateTool(validatedToolData, toolDocSnap.id, userGeopoint);
}


async function hydrateTool(validatedToolData: ToolValidated, toolId: string, userGeopoint: Geopoint | undefined): Promise<ToolHydrated> {
  const geopoint: Geopoint = [validatedToolData.location.latitude, validatedToolData.location.longitude];
  let resultTool: Tool = {
    id: toolId, // id comes from the document snapshot, not from validatedToolData initially
    ...validatedToolData, // Spread validated data
  };

  // Add lender if not present
  if (!validatedToolData.lender) {
    const lender = await getUserPreviewFromUid(validatedToolData.lenderUid);
    if (!lender)
      throw new NotFoundError(`Lender with id ${validatedToolData.lenderUid} not found ⁉️`);
    resultTool.lender = lender;
  }

  // Add holder if not present
  if (!validatedToolData.holder) {
    const holder = await getUserPreviewFromUid(validatedToolData.holderUid);
    if (!holder)
      throw new NotFoundError(`Holder with id ${validatedToolData.holderUid} not found ⁉️`);
    resultTool.holder = holder;
  }

  // Add city if not present
  if (!resultTool.location.city || resultTool.location.city.split(",").length < 2)
    resultTool.location.city = await getCityNameFromGeopoint(geopoint);

  // Add relativeDistance
  if (userGeopoint)
    resultTool.location.relativeDistance = distanceBetweenMi(userGeopoint, geopoint);
  return resultTool as ToolHydrated;
}

export async function getToolsWithinRadius(radiusMi: number, center: Geopoint): Promise<ToolHydrated[] | undefined> {

  if (!radiusMi || !center)
    return undefined;

  console.log(`🪛Getting tools within ${radiusMi} miles of ${center[0]}, ${center[1]}`);
  const radiusM = metersFromMiles(radiusMi);

  const bounds = geofire.geohashQueryBounds(center, radiusM);
  const promises: Promise<QuerySnapshot<DocumentData>>[] = [];

  bounds.forEach((bound: any) => {
    const q = query(
        collection(db, "tools"),
        where("visibility", "==", "published"),
        orderBy("location.geohash"),
        startAt(bound[0]),
        endAt(bound[1]),
    );
    promises.push(getDocs(q));
  });


  const snapshots = await Promise.all(promises);
  const hydratedToolPromises: Promise<ToolHydrated>[] = [];
  snapshots.forEach(snapshot => {
    snapshot.forEach(document => {
      const docData = document.data();
      if (!docData) {
        console.warn("Document data is undefined for a document in snapshot, skipping.");
        return; 
      }

      const validationResult = ToolModelSchema.safeParse(docData);

      if (!validationResult.success) {
        console.error("Validation failed for tool:", document.id, validationResult.error.flatten());
        console.warn(`Skipping tool with id ${document.id} due to validation error.`);
        return; 
      }

      const validatedToolData = validationResult.data;
      
      // Get geopoint from tool data
      const geopoint: Geopoint = [validatedToolData.location.latitude, validatedToolData.location.longitude];
      // Check if geopoint is within radius
      if (distanceBetweenMi(center, geopoint) < radiusMi) {
        // Populate tool fields
        const tool = hydrateTool(validatedToolData, document.id, center);
        hydratedToolPromises.push(tool);
      }
    });
  });
  const hydratedTools: ToolHydrated[] = await Promise.all(hydratedToolPromises);
  return hydratedTools;
}


export function validateTools() {
  getAllTools()
      .then((tools) => {
        tools.forEach((tool: Tool) => {

          if (tool.deletedAt) {
            console.log(`🪛Skipping deleted tool ${tool.id}`);
            return;
          }

          if (!tool.visibility) {
            tool.visibility = "published";
            console.log("🪛Publishing tool: " + tool.name);
            const id: string = tool.id!;
            delete tool.id;
            setDoc(doc(db, "tools", id), tool, {merge: false})
                .then(() => {
                  console.log("🔥Tool updated: " + tool.name);
                });
          } else {
            console.log(`🪛Skipping ${tool.visibility} tool: `, tool.name);
          }
        });
      });
}
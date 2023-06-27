import {
  collection,
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
import {ITool, IToolForm} from "../models/Tool";
import {getAuth} from "firebase/auth";
import {AuthError, NotFoundError, ObjectValidationError} from "../utils/errors";

import {Geopoint} from "geofire-common";
import {distanceBetweenMi, getCityNameFromGeopoint, getGeohashedLocation, metersFromMiles} from "../models/Location";

const geofire = require("geofire-common");

export function getNextToolId() {
  console.log("🪛making tool id");
  const docRef = doc(collection(db, "tools"));
  console.log("🪛made tool id", docRef);
  return docRef.id;
}

export async function createTool(toolForm: IToolForm, toolId: string) {
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

  const toolData: ITool = {
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

export async function editTool(toolId: string, toolForm: IToolForm) {
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

  // Confirm this user owns it
  const tool = toolSnap.data() as ITool;
  if (tool.lenderUid != auth.currentUser.uid)
    throw new AuthError("You are not authorized to delete this tool 🤨");

  // "Delete" the tool
  return setDoc(toolRef, {
    deletedAt: serverTimestamp(),
  }, {merge: false});
}

/**
 * @deprecated Use getToolsWithinRadius instead
 * @returns {Promise<ITool[]>}
 */
export async function getAllTools(): Promise<ITool[]> {
  const querySnapshot = await getDocs(collection(db, "tools"));
  let tools: ITool[] = [];
  querySnapshot.forEach(doc => tools.push({
    id: doc.id,
    ...doc.data(),
  } as ITool));
  return tools;
}


export async function getToolById(toolId: string, userGeopoint?: Geopoint): Promise<ITool | undefined> {
  const toolDocRef = doc(db, "tools", toolId);
  const toolDocSnap = await getDoc(toolDocRef);

  if (!toolDocSnap.exists())
    throw new NotFoundError(`Tool with id ${toolId} does not exist in database 🫢`);

  const toolData = toolDocSnap.data() as ITool;

  const lenderSnap = await getDoc(doc(db, "users", toolData.lenderUid));

  if (!lenderSnap.exists())
    throw new NotFoundError(`Lender with id ${toolData.lenderUid} not found ⁉️`);

  const geopoint: Geopoint = [toolData.location.latitude, toolData.location.longitude];
  let result: ITool = {
    id: toolDocSnap.id,
    lender: lenderSnap.data(),
    ...toolData,
    location: {
      ...toolData.location,
      city: await getCityNameFromGeopoint(geopoint),
    },
  } as ITool;
  if (userGeopoint)
    result.location.relativeDistance = distanceBetweenMi(userGeopoint, geopoint);
  return result;
}


export async function getToolsWithinRadius(radiusMi: number, center: Geopoint) {

  if (!radiusMi || !center)
    return;

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
  const tools: ITool[] = [];
  snapshots.forEach(snapshot => {
    snapshot.forEach(document => {
      const toolData = document.data() as ITool;
      // Get geopoint from tool data
      const geopoint: Geopoint = [toolData.location.latitude, toolData.location.longitude];
      // Check if geopoint is within radius
      if (distanceBetweenMi(center, geopoint) < radiusMi) {
        // Populate tool fields
        const tool: ITool = {
          id: document.id,
          ...toolData,
          location: {
            ...toolData.location,
            relativeDistance: distanceBetweenMi(geopoint, center),
          },
        };
        tools.push(tool);
      }
    });
  });
  return tools;
}


export function validateTools() {
  getAllTools()
      .then((tools) => {
        tools.forEach((tool: ITool) => {

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
import {
  addDoc,
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
} from "firebase/firestore";
import {db} from "../config/firebase";
import {ITool, IToolForm} from "../models/Tool";
import {getAuth} from "firebase/auth";
import {AuthError, NotFoundError, ObjectValidationError} from "../utils/errors";

import {Geopoint} from "geofire-common";
import {distanceBetweenMi, getCityNameFromGeopoint, getGeohashedLocation, metersFromMiles} from "../models/Location";
import {getRefFromUid} from "../models/LendrUser";

const geofire = require("geofire-common");


export async function createTool(toolForm: IToolForm) {

  if (!(
      toolForm.description &&
      toolForm.name &&
      toolForm.rate.price &&
      toolForm.rate.timeUnit &&
      toolForm.preferences &&
      toolForm.geopoint
  ))
    throw new ObjectValidationError("Missing properties on newTool");

  const auth = getAuth();
  if (!auth.currentUser)
    throw new AuthError();
  return addDoc(collection(db, "tools"), {
    lenderRef: getRefFromUid(auth.currentUser.uid),
    holderRef: getRefFromUid(auth.currentUser.uid),
    createdAt: serverTimestamp(),
    modifiedAt: serverTimestamp(),
    location: getGeohashedLocation(toolForm.geopoint),

    // ...toolForm properties
    name: toolForm.name,
    description: toolForm.description,
    rate: toolForm.rate,
    preferences: toolForm.preferences,

  });
}

export async function editTool(toolId: string, toolForm: IToolForm) {
  console.log(`Editing tool ${toolId}`);
  // Validate Fields
  if (!(
      toolForm.description &&
      toolForm.name &&
      toolForm.rate.price &&
      toolForm.rate.timeUnit &&
      toolForm.preferences &&
      toolForm.geopoint
  ))
    throw new ObjectValidationError("Missing properties on newTool");

  const auth = getAuth();
  if (!auth.currentUser)
    throw new AuthError("Must be logged in 😱");

  return setDoc(doc(db, "tools", toolId), {
    // lenderRef: getRefFromUid(auth.currentUser.uid), // TODO this might not be necessary
    // holderRef: getRefFromUid(auth.currentUser.uid), // TODO this might not be necessary
    modifiedAt: serverTimestamp(),
    location: getGeohashedLocation(toolForm.geopoint),

    // ...toolForm properties
    name: toolForm.name,
    description: toolForm.description,
    rate: toolForm.rate,
    preferences: toolForm.preferences,

  }, {merge: true});
}

export async function deleteTool(toolId: string) {
  console.log(`Deleting tool ${toolId}`);

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
  if (tool.lenderRef.path != getRefFromUid(auth.currentUser.uid).path)
    throw new AuthError("You are not authorized to delete this tool 🤨");

  // Actually Delete the tool
  return setDoc(toolRef, {
    deletedAt: serverTimestamp(),
  }, {merge: false});
}

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
  const lenderSnap = await getDoc(toolData.lenderRef);

  if (!lenderSnap.exists())
    throw new NotFoundError(`Lender with id ${toolData.lenderRef.id} not found ⁉️`);

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
  console.log(`Getting tools within ${radiusMi} miles of ${center[0]}, ${center[1]}`);
  const radiusM = metersFromMiles(radiusMi);

  const bounds = geofire.geohashQueryBounds(center, radiusM);
  const promises: Promise<QuerySnapshot<DocumentData>>[] = [];

  bounds.forEach((bound: any) => {
    const q = query(
        collection(db, "tools"),
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
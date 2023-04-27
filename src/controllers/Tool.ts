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

import geofire from "geofire-common";
import {distanceBetweenMi, getGeohashedLocation, ILocation, metersFromMiles} from "../models/Location";
import {getRefFromUid} from "../models/LendrUser";

export async function createTool(newTool: IToolForm) {

  if (!(
      newTool.description &&
      newTool.name &&
      newTool.rate.price &&
      newTool.rate.timeUnit &&
      newTool.preferences
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
    location: getGeohashedLocation(43.823791, -111.777649), // Hardcoded rexburg location for now
    ...newTool,
  });
}

export async function editTool(toolId: string, newTool: IToolForm) {
  console.log(`Editing tool ${toolId}`);
  // Validate Fields
  if (!(
      newTool.description &&
      newTool.name &&
      newTool.rate.price &&
      newTool.rate.timeUnit &&
      newTool.preferences
  ))
    throw new ObjectValidationError("Missing properties on newTool");

  const auth = getAuth();
  if (!auth.currentUser)
    throw new AuthError("Must be logged in 😱");

  return setDoc(doc(db, "tools", toolId), {
    lenderRef: getRefFromUid(auth.currentUser.uid),
    holderRef: getRefFromUid(auth.currentUser.uid),
    modifiedAt: serverTimestamp(),
    location: getGeohashedLocation(43.823791, -111.777649), // Hardcoded rexburg location for now
    ...newTool,
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


export async function getToolById(toolId: string): Promise<ITool | undefined> {
  const toolDocRef = doc(db, "tools", toolId);
  const toolDocSnap = await getDoc(toolDocRef);

  if (!toolDocSnap.exists())
    throw new NotFoundError(`Tool with id ${toolId} does not exist in database 🫢`);

  return {
    id: toolDocSnap.id,
    ...toolDocSnap.data()
  } as ITool;
}


export async function getToolsWithinRadius(radiusMi: number, center: ILocation) {
  const radiusM = metersFromMiles(radiusMi);

  const bounds = geofire.geohashQueryBounds([center.latitude, center.longitude], radiusM);
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
      const tool: ITool = {
        id: document.id,
        ...document.data(),
      } as ITool;
      if (distanceBetweenMi(center, tool.location!) > radiusMi)
        tools.push(tool);
    });
  });
  return tools;
}
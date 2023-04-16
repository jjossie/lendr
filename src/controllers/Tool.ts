import {addDoc, collection, doc, getDoc, getDocs, setDoc} from "firebase/firestore";
import {db} from "../config/firebase";
import {ITool, IToolForm} from "../models/Tool";
import {getAuth} from "firebase/auth";
import {AuthError} from "../utils/errors";


export async function createTool(newTool: IToolForm) {

  if (!(
      newTool.description &&
      newTool.name &&
      newTool.rate.price &&
      newTool.rate.timeUnit &&
      newTool.preferences
  ))
    throw new Error("Missing properties on newTool");

  const auth = getAuth();
  if (!auth.currentUser)
    throw new AuthError();

  return addDoc(collection(db, "tools"), {
    ownerUid: auth.currentUser.uid,
    currentHolderUid: auth.currentUser.uid,
    ...newTool,
  });
}

export async function editTool(toolId: string, newTool: IToolForm) {

  if (!(
      newTool.description &&
      newTool.name &&
      newTool.rate.price &&
      newTool.rate.timeUnit &&
      newTool.preferences
  ))
    throw new Error("Missing properties on newTool");

  const auth = getAuth();
  if (!auth.currentUser)
    throw new AuthError("Must be logged in 😱");

  return setDoc(doc(db, "tools", toolId), {
    ownerUid: auth.currentUser.uid,
    currentHolderUid: auth.currentUser.uid,
    ...newTool,
  }, {merge: false});
}

export async function getAllTools(): Promise<ITool[]> {
  const querySnapshot = await getDocs(collection(db, "tools"));
  let tools: ITool[] = [];
  querySnapshot.forEach(doc => tools.push({
    id: doc.id,
    ...doc.data()
  } as ITool));
  return tools;
}


export async function getToolById(toolId: string = "T2FSjG3CFvmnxylUtDdu"): Promise<ITool | undefined> {
  const toolDocRef = doc(db, "tools", toolId);
  const toolDocSnap = await getDoc(toolDocRef);

  if (!toolDocSnap.exists())
    throw new Error(`Tool with id ${toolId} does not exist in database 🫢`);

  console.log(toolDocSnap.data());
  return toolDocSnap.data() as ITool;
}
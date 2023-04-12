import {addDoc, collection, doc, getDoc, getDocs, setDoc} from "firebase/firestore";
import {db} from "../config/firebase";
import {ITool, IToolForm} from "../models/Tool";


export async function createTool(newTool: IToolForm) {

  if (!(
      newTool.description &&
      newTool.name &&
      newTool.rate.price &&
      newTool.rate.timeUnit &&
      newTool.preferences
  ))
    throw new Error("Missing properties on newTool");

  // TODO  add logged-in user as the lender and holder
  return addDoc(collection(db, "tools"), {
    ...newTool
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

  // TODO add logged-in user as the lender and holder
  // TODO make this an update
  // return addDoc(collection(db, "tools"), {
  //   ...newTool
  // });

    return setDoc(doc(db, "tools", toolId), {
      ...newTool
    })
}

export async function getAllTools(): Promise<ITool[]> {
  const querySnapshot = await getDocs(collection(db, "tools"))
  let tools: ITool[] = [];
  querySnapshot.forEach(doc => tools.push(doc.data() as ITool));
  return tools;
}

// export async function getToolById(toolId: string): Promise<ITool> {
//   const querySnapshot = await getDoc<ITool>()
// }


export async function getToolById(toolId: string = "T2FSjG3CFvmnxylUtDdu"): Promise<ITool | undefined> {
  const toolDocRef = doc(db, "tools", toolId);
  const toolDoc = await getDoc(toolDocRef);

  if (toolDoc.exists())
    console.log(toolDoc.data());
  else
    console.log("Couldn't find tool data");
  return toolDoc.data() as ITool;
}
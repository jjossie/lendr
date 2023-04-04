import {addDoc, collection, getDocs} from "firebase/firestore";
import {db} from "../models/firebase";
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
  return addDoc(collection(db, "tools"), {
    ...newTool
  });
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
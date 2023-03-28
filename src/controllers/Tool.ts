import {addDoc, collection} from "firebase/firestore/lite";
import {db} from "../models/firebase";
import {IToolForm} from "../models/Tool";


export async function createTool(newTool: IToolForm) {
  return addDoc(collection(db, "tools"), newTool);
}
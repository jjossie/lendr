import {getFirestore} from "firebase-admin/firestore";
import {NotFoundError} from "../utils/errors";
import {ITool} from "../models/Tool";

export async function hydrateTool(toolId: string) {
  const db = getFirestore();
  const doc = await db.collection('tools').doc(toolId).get();
  if (!doc.exists) {
    throw new NotFoundError(`Tool with id ${toolId} does not exist`);
  }

  const toolDoc = doc.data() as ITool;

  return {
    name: toolDoc.name,
    imageUrl: toolDoc.imageUrls[0],
    rate: toolDoc.rate,
    id: toolId,
  }
}
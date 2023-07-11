// import {onDocumentCreated} from "firebase-functions/lib/v2/providers/firestore";
//
//
// export const validateRelation = onDocumentCreated("/relations/{relationId}", async (event) => {
//
//   const rawDoc = event.data.data();
//   if (!rawDoc.from || !rawDoc.to) {
//     throw new Error("Relation must have a from and to");
//   }
//
//
// }

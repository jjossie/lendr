import {onDocumentCreated} from "firebase-functions/v2/firestore";
import {ObjectValidationError} from "./utils/errors";
import {addRelationToUser, getUserFromUid} from "./controllers/users";


export const validateRelation = onDocumentCreated("/relations/{relationId}", async (event) => {

  const rawDoc = event.data.data();

  // Make sure there are two distinct users that actually exist
  if (!rawDoc.users ||
      !rawDoc.users[0] ||
      !rawDoc.users[1] ||
      rawDoc.users.length !== 2 ||
      !rawDoc.users[0].uid ||
      !rawDoc.users[1].uid ||
      rawDoc.users[0].uid === rawDoc.users[1].uid ||
      rawDoc.users[0] === rawDoc.users[1]) {
    throw new ObjectValidationError("Invalid Relation"); // TODO make this more specific?
  }

  // These will throw an error if the user doesn't exist
  const user0 = await getUserFromUid(rawDoc.users[0].uid);
  const user1 = await getUserFromUid(rawDoc.users[1].uid);

  // Hydrate users
  // TODO implement

  // Make sure those two users' relations arrays are updated accordingly
  await addRelationToUser(user0.uid, event.params.relationId);
  await addRelationToUser(user1.uid, event.params.relationId);

  return {
    status: "success",
    message: "Successfully validated relation",
  };
});
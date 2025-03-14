import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { ObjectValidationError } from "./utils/errors";
import { addRelationToUser, getUserFromUid } from "./controllers/users.controller";

export const validateRelation = onDocumentCreated(
  "/relations/{relationId}",
  async (event) => {
    const rawDoc = event.data.data();

    // Make sure there are two distinct users that actually exist
    if (
      !rawDoc.users ||
      !rawDoc.users[0] ||
      !rawDoc.users[1] ||
      rawDoc.users.length !== 2 ||
      !rawDoc.users[0].uid ||
      !rawDoc.users[1].uid ||
      rawDoc.users[0].uid === rawDoc.users[1].uid ||
      rawDoc.users[0] === rawDoc.users[1]
    ) {
      throw new ObjectValidationError(
        `Invalid relation between ${rawDoc.users.length} users:`,
        {
          users: rawDoc.users,
        }
      );
    }

    // These will throw an error if the user doesn't exist
    const [user0, user1] = await Promise.all([
        getUserFromUid(rawDoc.users[0].uid),
        getUserFromUid(rawDoc.users[1].uid),
      ]);

    // Hydrate users
    // TODO implement the hydration better. Consider the implications of including expoPushTokens here.

    
    // Make sure those two users' relations arrays are updated accordingly
    await Promise.all([
        addRelationToUser(user0.uid, event.params.relationId),
        addRelationToUser(user1.uid, event.params.relationId),
      ]);

    return {
      status: "success",
      message: "Successfully validated relation",
    };
  }
);

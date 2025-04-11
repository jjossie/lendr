import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { ObjectValidationError } from "./utils/errors";
import { addRelationToUser, getUserFromUid } from "./controllers/users.controller";
import { relationSchema } from "./models/relation.model";
import { lendrUserModelSchema } from "./models/lendrUser.model";

export const validateRelation = onDocumentCreated(
  "/relations/{relationId}",
  async (event) => {
    const parsedRelation = relationSchema.safeParse(event.data?.data());

    if (!parsedRelation.success) {
      throw new ObjectValidationError("Invalid relation data", parsedRelation.error);
    }

    const parsedRelationDoc = parsedRelation.data

    if (parsedRelationDoc.users[1].uid === parsedRelationDoc.users[0].uid) {
      throw new ObjectValidationError(
        "Invalid relation: users are the same",
        {
          users: parsedRelationDoc.users,
        }
      );
    }

    // Hydrate users
    // The frontend has sent two user objects in an array, plus a timestamp. We need to verify the users are 
    // legit, and determine whether we want to store the full user data alongside the relation, or just a preview. 

    // These will (NOT) throw an error if the user doesn't exist
    const retrievedUsers = await Promise.all([
        getUserFromUid(parsedRelationDoc.users[0].uid),
        getUserFromUid(parsedRelationDoc.users[1].uid),
      ]);
    
    // this is a bit redundant but we're doing it anyway for now
    const [user0, user1] = retrievedUsers.map(user => {
      const parsed = lendrUserModelSchema.safeParse(user);
      if (!parsed.success) throw new ObjectValidationError("Invalid user data (retrieved from UID in relation)", parsed.error);
      return parsed.data;
    });
    parsedRelationDoc.users[0] = user0;
    parsedRelationDoc.users[1] = user1;

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

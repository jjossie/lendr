// The Cloud Functions for Firebase SDK to create Cloud Functions and triggers.
import {onDocumentCreated} from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import {IChatMessage} from "./models/Relation";


export const chatMessageNotification = onDocumentCreated(
    "/relations/{relationId}/messages/{messageId}",
    (event) => {

      // When a new message is added to a relation, send a notification to the recipient.
      logger.info(event);
      console.log("Locally??");

      // Get the recipient of the message.
      const message: IChatMessage  = event.data.data() as IChatMessage;
      // const receiver = getUserFromAuth(message.receiverUid);



      return {
        success: true,
      };
    });

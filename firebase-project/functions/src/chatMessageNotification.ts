// The Cloud Functions for Firebase SDK to create Cloud Functions and triggers.
import {onDocumentCreated} from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import {getUserFromUid} from "./controllers/users.controller";
import {sendExpoNotifications} from "./utils/notifications";
import { NotFoundError } from "./utils/errors";
import { ChatMessage } from "./models/chat.model";

/**
 * Triggered when a new message is added to a relation, which happens on every chat message send.
 * @type {CloudFunction<FirestoreEvent<QueryDocumentSnapshot | undefined,
 *     ParamsOf<"/relations/{relationId}/messages/{messageId}">>>}
 */
export const chatMessageNotification = onDocumentCreated(
    "/relations/{relationId}/messages/{messageId}",
    async (event) => {

      // TODO Zod validation

      // When a new message is added to a relation, send a notification to the recipient.
      logger.info(`ChatMessageNotification running in response to new doc: "relations/${event.params.relationId}/messages/${event.params.messageId}"`);
      logger.info(event);

      // Get the recipient of the message.
      const message: ChatMessage = event.data?.data() as ChatMessage;
      const receiver = await getUserFromUid(message.receiverUid);
      const sender = await getUserFromUid(message.senderUid);

      if (!receiver || !sender) {
        throw new NotFoundError(
          `User not found: Receiver UID ${message.receiverUid}: ${receiver}; Sender UID ${message.senderUid}: ${sender}` 
        );
      }

      const pushTokens = receiver.expoPushTokens;
      const title = `${sender.firstName} ${sender.lastName}`;
      const body = message.text; // TODO only show the first several words
      const data = {withSome: 'data'};  // TODO link to the chat in-app
      await sendExpoNotifications(pushTokens, title, body, data);

      return {
        success: true,
      };
    });

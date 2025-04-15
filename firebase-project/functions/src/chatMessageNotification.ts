// The Cloud Functions for Firebase SDK to create Cloud Functions and triggers.
import {onDocumentCreated} from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import {getUserFromUid} from "./controllers/users.controller";
import {sendExpoNotifications} from "./utils/notifications";
import { NotFoundError } from "./utils/errors";
import { chatMessageInputSchema, ChatMessageInputValidated, ChatMessageModelValidated } from "./models/chat.model";
import { HttpsError } from "firebase-functions/https";
import { FieldValue } from "firebase-admin/firestore";

/**
 * Triggered when a new message is added to a relation, which happens on every chat message send.
 * @type {CloudFunction<FirestoreEvent<QueryDocumentSnapshot | undefined,
 *     ParamsOf<"/relations/{relationId}/messages/{messageId}">>>}
 */
export const chatMessageNotification = onDocumentCreated(
    "/relations/{relationId}/messages/{messageId}",
    async (event) => {

      // When a new message is added to a relation, send a notification to the recipient.
      logger.info(`ChatMessageNotification running in response to new doc: "relations/${event.params.relationId}/messages/${event.params.messageId}"`);
      logger.info(event);

      // Parse and validate the message data.
      const messageParsed = chatMessageInputSchema.safeParse(event.data?.data());
      if (!messageParsed.success) {
        logger.error("ChatMessageNotification: message schema validation failed", messageParsed.error);
        throw new HttpsError("invalid-argument", "ChatMessageNotification: message schema validation failed");
      }
      const message: ChatMessageInputValidated = messageParsed.data;

      // Get the recipient of the message.
      const receiver = await getUserFromUid(message.receiverUid);
      const sender = await getUserFromUid(message.senderUid);

      if (!receiver || !sender) {
        throw new NotFoundError(
          `User not found: Receiver UID ${message.receiverUid}: ${receiver}; Sender UID ${message.senderUid}: ${sender}` 
        );
      }

      // Attach necessary data to the message.
      const messageHydrated: ChatMessageModelValidated = {
        ...message,
        createdAt: FieldValue.serverTimestamp(),
      }
      event.data?.ref.set(messageHydrated, {merge: false});

      // Send the notification to the recipient.
      const pushTokens = receiver.expoPushTokens;
      const title = `${sender.firstName} ${sender.lastName}`;
      const body = message.text; // TODO only show the first several words
      const data = {withSome: 'data'};  // TODO deep link to the chat in-app
      await sendExpoNotifications(pushTokens, title, body, data);

      return {
        success: true,
      };
    });

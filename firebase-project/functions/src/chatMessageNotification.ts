// The Cloud Functions for Firebase SDK to create Cloud Functions and triggers.
import {onDocumentCreated} from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import {IChatMessage} from "./models/Relation";
import {getUserFromUid} from "./controllers/users";
import Expo from "expo-server-sdk";


export const chatMessageNotification = onDocumentCreated(
    "/relations/{relationId}/messages/{messageId}",
    async (event) => {


      // When a new message is added to a relation, send a notification to the recipient.
      logger.info(`ChatMessageNotification running in response to new doc: "relations/${event.params.relationId}/messages/${event.params.messageId}"`);
      logger.info(event);
      console.log("Locally??");

      // Get the recipient of the message.
      const message: IChatMessage  = event.data.data() as IChatMessage;
      const receiver = await getUserFromUid(message.receiverUid);
      const sender = await getUserFromUid(message.senderUid);

      const notifications = []
      for (const pushToken of receiver.expoPushTokens) {
        if (!Expo.isExpoPushToken(pushToken)) {
          logger.error(`Push token ${pushToken} is not a valid Expo push token`);
          console.error(`Push token ${pushToken} is not a valid Expo push token`);
          continue;
        }

        // Construct a message (see https://docs.expo.io/push-notifications/sending-notifications/)
        notifications.push({
          to: pushToken,
          sound: 'default',
          title: `${sender.firstName} ${sender.lastName}`,
          body: message.text, // TODO only show the first several words
          data: { withSome: 'data' }, // TODO link to the chat in-app
        });
      }

      let expo = new Expo();

      let chunks = expo.chunkPushNotifications(notifications);
      let tickets = [];
        // Send the chunks to the Expo push notification service. There are
        // different strategies you could use. A simple one is to send one chunk at a
        // time, which nicely spreads the load out over time:
        for (let chunk of chunks) {
          try {
            let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
            console.log(ticketChunk);
            tickets.push(...ticketChunk);
            // NOTE: If a ticket contains an error code in ticket.details.error, you
            // must handle it appropriately. The error codes are listed in the Expo
            // documentation:
            // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
          } catch (error) {
            console.error(error);
          }
        }

      return {
        success: true,
      };
    });

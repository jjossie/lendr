// The Cloud Functions for Firebase SDK to create Cloud Functions and triggers.
import {onDocumentCreated} from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import {IChatMessage} from "lendr-common/models/Relation";
import {setFirestore} from "lendr-common/config/firebase";
import {getUserFromUid} from "lendr-common/controllers/User";
import {getFirestore} from "firebase-admin/firestore";
import Expo from "expo-server-sdk";


export const chatMessageNotification = onDocumentCreated(
    "/relations/{relationId}/messages/{messageId}",
    async (event) => {
      // Init Firestore
      setFirestore(getFirestore());

      // When a new message is added to a relation, send a notification to the recipient.
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
        })
      }

      return {
        success: true,
      };
    });

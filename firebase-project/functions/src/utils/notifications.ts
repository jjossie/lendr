import Expo, { ExpoPushMessage, ExpoPushTicket } from "expo-server-sdk";
import {logger} from "firebase-functions";

export async function sendExpoNotifications(pushTokens: string[], title: string, body: string, data: any) {
  // Create a notification for each push token. These push tokens are retrieved
  // from the actual user doc, not the hydrated version stored with the relation.
  const notifications: ExpoPushMessage[] = [];
  for (const pushToken of pushTokens) {
    if (!Expo.isExpoPushToken(pushToken)) {
      logger.error(`Push token ${pushToken} is not a valid Expo push token`);
      console.error(`Push token ${pushToken} is not a valid Expo push token`);
      continue;
    }

    // Construct a message (see https://docs.expo.io/push-notifications/sending-notifications/)
    notifications.push({
      to: pushToken,
      sound: 'default',
      title: title,
      body: body,
      data: data,
    });
  }

  let expo = new Expo();

  let chunks = expo.chunkPushNotifications(notifications);
  let tickets: ExpoPushTicket[] = [];
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
}
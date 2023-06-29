const expo = require("expo-server-sdk");

/**
 * @deprecated no mo peepeepoopoo
 * @returns {Promise<void>}
 */
async function peepeepoopoo(){
  const expoPushTokens = [
    "ExponentPushToken[WvdjfaBd4iG90RLEW8AqgI]",
    "ExponentPushToken[fSqrPsIbASQxmcqqsesHqk]"
  ];

  const notifications = []
  for (const pushToken of expoPushTokens) {
    if (!expo.Expo.isExpoPushToken(pushToken)) {
      console.error(`Push token ${pushToken} is not a valid Expo push token`);
      continue;
    }

    // Construct a message (see https://docs.expo.io/push-notifications/sending-notifications/)
    notifications.push({
      to: pushToken,
      sound: 'default',
      title: `poopoo`,
      body: "peepeepoopoo",
      data: {withSome: 'data'},
    });
  }

  let expoClient = new expo.Expo();

  let chunks = expoClient.chunkPushNotifications(notifications);
  let tickets = [];
// Send the chunks to the Expo push notification service. There are
// different strategies you could use. A simple one is to send one chunk at a
// time, which nicely spreads the load out over time:
  for (let chunk of chunks) {
    try {
      let ticketChunk = await expoClient.sendPushNotificationsAsync(chunk);
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

peepeepoopoo().then(r => console.log("peepeepoopoo completed"));
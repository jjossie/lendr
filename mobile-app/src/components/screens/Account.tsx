import React, {useEffect, useRef, useState} from 'react';
import {Button, Column, ScrollView, Text} from 'native-base';
import {BottomTabScreenProps} from "@react-navigation/bottom-tabs";
import {useAuthentication} from "../../utils/hooks/useAuthentication";
import {signOutUser} from "../../controllers/auth";
import LenderProfilePreview from "../LenderProfilePreview";
import {useLocation} from "../../utils/hooks/useLocation";
import {View} from "react-native";
import {registerForPushNotificationsAsync, sendPushNotification} from "../../config/device/notifications";
import * as Notifications from "expo-notifications";


const Account: React.FC<BottomTabScreenProps<any>> = ({navigation, route}) => {

  const {authUser, user, unsub} = useAuthentication();

  const {city} = useLocation();

  const [expoPushToken, setExpoPushToken] = useState<string | undefined>('');
  const [notification, setNotification] = useState<Notifications.Notification | undefined>();
  const notificationListener = useRef<Notifications.Subscription | undefined>();
  const responseListener = useRef<Notifications.Subscription | undefined>();

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) => setExpoPushToken(token));

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });

    return () => {
      console.log("Removing Notification & Auth Subscriptions, I think?");
      // if (unsub)
      //   unsub();

      Notifications.removeNotificationSubscription(notificationListener.current!);
      Notifications.removeNotificationSubscription(responseListener.current!);
    };
  }, []);

  return (
      <ScrollView p={8}>
        <Column space="lg">
          {user && <LenderProfilePreview user={user!}/>}
          <Text fontSize="md">{authUser?.email}</Text>

          <Text>City: {city}</Text>

          <Button onPress={() => {
            signOutUser().then(r => console.log("❇️Signed out"));
          }}>Sign Out</Button>


          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'space-around' }}>
            <Text>Your expo push token: {expoPushToken}</Text>
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Text>Title: {notification && notification.request.content.title} </Text>
              <Text>Body: {notification && notification.request.content.body}</Text>
              <Text>Data: {notification && JSON.stringify(notification.request.content.data)}</Text>
            </View>
            <Button
                onPress={async () => {
                  if (!expoPushToken) {
                    console.log("No push token found");
                    return;
                  }
                  await sendPushNotification(expoPushToken);
                }}
            >Press to Send Notification</Button>
          </View>

        </Column>
      </ScrollView>
  );
};

export default Account;
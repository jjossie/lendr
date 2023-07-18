import React, {useEffect, useRef, useState} from 'react';
import {Box, Button, Column, Heading, ScrollView, Text} from 'native-base';
import {BottomTabScreenProps} from "@react-navigation/bottom-tabs";
import {useAuthentication} from "../../utils/hooks/useAuthentication";
import {signOutUser} from "../../controllers/auth";
import {useLocation} from "../../utils/hooks/useLocation";
import {registerForPushNotificationsAsync} from "../../config/device/notifications";
import * as Notifications from "expo-notifications";
import AvatarImage from "../AvatarImage";


const Account: React.FC<BottomTabScreenProps<any>> = ({navigation, route}) => {

  const {authUser, user} = useAuthentication();

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
      <Box>
        <ScrollView p={4}>
          <Column space="lg">
            <Heading>Account</Heading>

            {user &&
              <Column space="lg" alignItems={"center"} justifyContent={"center"} p={4}>
                <AvatarImage user={user} size={"xl"}/>
                <Text fontSize={"2xl"}  bold>{user.displayName ?? `${user.firstName} ${user.lastName}` }</Text>
                <Text fontSize="md">{authUser?.email}</Text>

                <Text>City: {city}</Text>

              </Column>
            }
            <Button onPress={() => {
              signOutUser().then(r => console.log("❇️Signed out"));
            }}>Sign Out</Button>


            {/*<View style={{ flex: 1, alignItems: 'center', justifyContent: 'space-around' }}>*/}
            {/*  <Text>Your expo push token: {expoPushToken}</Text>*/}
            {/*  <View style={{ alignItems: 'center', justifyContent: 'center' }}>*/}
            {/*    <Text>Title: {notification && notification.request.content.title} </Text>*/}
            {/*    <Text>Body: {notification && notification.request.content.body}</Text>*/}
            {/*    <Text>Data: {notification && JSON.stringify(notification.request.content.data)}</Text>*/}
            {/*  </View>*/}
            {/*  <Button*/}
            {/*      onPress={async () => {*/}
            {/*        if (!expoPushToken) {*/}
            {/*          console.log("No push token found");*/}
            {/*          return;*/}
            {/*        }*/}
            {/*        await sendPushNotification(expoPushToken);*/}
            {/*      }}*/}
            {/*  >Press to Send Notification</Button>*/}
            {/*</View>*/}

          </Column>
        </ScrollView>
      </Box>
  );
};

export default Account;
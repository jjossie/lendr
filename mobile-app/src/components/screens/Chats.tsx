import React, {useEffect, useState} from 'react';
import {Box, Text} from 'native-base';
import {ChatListItem} from "../ChatListItem";
import {SwipeListView} from "react-native-swipe-list-view";
import {useMyChats} from "../../utils/hooks/useMyChats";
import {useAuthentication} from "../../utils/hooks/useAuthentication";
import {ILendrUserPreview} from "../../models/ILendrUser";

import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {RefreshControl} from "react-native";

export interface ChatsProps {

}

const Chats: React.FC<NativeStackScreenProps<any>> = ({route, navigation}) => {
  console.log("❇️️< Chats > Component Rendering");

  if (route.params?.relationId){
    console.log("❇️< Chats > Navigating to ChatConversation");
    navigation.navigate("ChatConversation", {
      relationId: route.params.relationId,
      draftMessage: route.params?.draftMessage,
    });
  }

  // Custom Hooks
  const {user} = useAuthentication();
  const {chats, isLoaded, setIsLoaded} = useMyChats();

  // State
  const [listData, setListData] = useState<any[] | undefined>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Side Effects
  useEffect(() => {
    if (user && chats && chats.length !== 0) {
      const data = chats
          // .sort((a, b) => {
          //   return (a.lastMessage?.createdAt.seconds && b.lastMessage?.createdAt.seconds)
          //       ? a.lastMessage?.createdAt.seconds - b.lastMessage?.createdAt.seconds
          //       : -1;
          // }) // Don't try sorting here because it breaks the recent messages
          .map((chat) => {
            // Convert data from useMyTools() to display info for each ChatListItem
            if (!chat.otherUser) return null;
            const displayName = (chat.otherUser.firstName && chat.otherUser.lastName)
                ? chat.otherUser.firstName + ' ' + chat.otherUser.lastName
                : chat.otherUser.displayName;
            const timeStampSeconds = chat.lastMessage ? chat.lastMessage.createdAt?.seconds : chat.createdAt?.seconds;
            const timeStamp = new Date(timeStampSeconds * 1000).toLocaleTimeString();
            const otherUserPreview: ILendrUserPreview = {
              displayName,
              photoURL: chat.otherUser?.photoURL ?? "",
              uid: chat.otherUser.uid
            }
            return {
              key: chat.id,
              displayName: displayName, // TODO deprecate
              userPreview: otherUserPreview,
              timeStamp,
              recentText: chat.lastMessage?.text,
              onPressCallback: () => {
                navigation.navigate("ChatConversation", {relationId: chat.id});
              },
            };
          })
          .filter((item) => (item)); // Filter nulls

      setListData(data);
    }
  }, [chats, isLoaded]);

  // Callbacks
  const onRefresh = async () => {
    setRefreshing(true);
    setIsLoaded(b => !b);
    // await useMyChats();
    setTimeout(() => {
      setRefreshing(false);
    }, 1000)
  };
  const closeRow = (rowMap: any[], rowKey: any) => {
    // if (rowMap[rowKey]) {
    //   rowMap[rowKey].closeRow();
    // }
  };

  const deleteRow = (rowMap: any[], rowKey: any) => {
    // closeRow(rowMap, rowKey);
    // const newData = [...listData];
    // const prevIndex = listData.findIndex(item => item.key === rowKey);
    // newData.splice(prevIndex, 1);
    // setListData(newData);
  };

  const onRowDidOpen = (rowKey: any) => {
    console.log('This row opened', rowKey);
  };


  const renderHiddenItem = (data: any, rowMap: any) => {
    return (
        // <HStack flex="1" pl="2" key={data.item.key}>
        //   <Pressable w="70"
        //              ml="auto"
        //              bg="coolGray.200"
        //              justifyContent="center"
        //              onPress={() => closeRow(rowMap, data.item.key)}
        //              _pressed={{
        //                opacity: 0.5,
        //              }}
        //              key={"close"}>
        //     <VStack alignItems="center" space={2}>
        //       <ThreeDotsIcon key="threeDotsIcon" size="xs" color="coolGray.800"/>
        //       <Text fontSize="xs" fontWeight="medium" color="coolGray.800">
        //         More
        //       </Text>
        //     </VStack>
        //   </Pressable>
        //   <Pressable w="70"
        //              bg="red.500"
        //              justifyContent="center"
        //              onPress={() => deleteRow(rowMap, data.item.key)}
        //              _pressed={{
        //                opacity: 0.5,
        //              }}
        //              key={"delete"}>
        //     <VStack alignItems="center" space={2}>
        //       <DeleteIcon key="deleteIcon" color="white" size="xs"/>
        //       <Text color="white" fontSize="xs" fontWeight="medium">
        //         Delete
        //       </Text>
        //     </VStack>
        //   </Pressable>
        // </HStack>
        <Box></Box>
    );
  };

  return <Box p={4} flex="1">
    <Text p={4} bold fontSize="4xl">Inbox</Text>

    <SwipeListView data={listData}
                   refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                   renderItem={ChatListItem}
                   renderHiddenItem={renderHiddenItem}
                   rightOpenValue={-130}
                   onRowDidOpen={onRowDidOpen}/>
  </Box>;
};

export default Chats;

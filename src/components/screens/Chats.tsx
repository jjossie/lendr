import React, {useEffect, useState} from 'react';
import {Box, DeleteIcon, HStack, Pressable, Text, ThreeDotsIcon, VStack} from 'native-base';
import {ChatListItem} from "../ChatListItem";
import {SwipeListView} from "react-native-swipe-list-view";
import {useMyChats} from "../../utils/hooks/useMyChats";
import {useAuthentication} from "../../utils/hooks/useAuthentication";

export interface ChatsProps {

}

const Chats: React.FC<ChatsProps> = (props: ChatsProps) => {
//
//   // const chats = useMyChats();
//   //
//   // return (
//   //     <ScrollView>
//   //       {chats?.map((chat) => (
//   //           <ChatListItem key={chat.id} relation={chat}></ChatListItem>
//   //       ))}
//   //     </ScrollView>
//   // );
//
//   return (
//       <Center h="100%">
//         <Box _dark={{
//           bg: 'coolGray.800',
//         }} _light={{
//           bg: 'white',
//         }} flex="1" safeAreaTop maxW="400px" w="100%" h="100%">
//           <Heading p="4" pb="0" size="lg">
//             Inbox
//           </Heading>
//           <Basic/>
//         </Box>
//       </Center>
//   );
// };
//
//
//
// function Basic() {
//   const data = [
//     {
//       id: 'bd7acbea-c1b1-46c2-aed5-3ad53abb28ba',
//       fullName: 'Afreen Khan',
//       timeStamp: '12:47 PM',
//       recentText: 'Good Day!',
//       avatarUrl: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500',
//     }, {
//       id: '3ac68afc-c605-48d3-a4f8-fbd91aa97f63',
//       fullName: 'Sujita Mathur',
//       timeStamp: '11:11 PM',
//       recentText: 'Cheer up, there!',
//       avatarUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTyEaZqT3fHeNrPGcnjLLX1v_W4mvBlgpwxnA&usqp=CAU',
//     }, {
//       id: '58694a0f-3da1-471f-bd96-145571e29d72',
//       fullName: 'Anci Barroco',
//       timeStamp: '6:22 PM',
//       recentText: 'Good Day!',
//       avatarUrl: 'https://miro.medium.com/max/1400/0*0fClPmIScV5pTLoE.jpg',
//     }, {
//       id: '68694a0f-3da1-431f-bd56-142371e29d72',
//       fullName: 'Aniket Kumar',
//       timeStamp: '8:56 PM',
//       recentText: 'All the best',
//       avatarUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSr01zI37DYuR8bMV5exWQBSw28C1v_71CAh8d7GP1mplcmTgQA6Q66Oo--QedAN1B4E1k&usqp=CAU',
//     }, {
//       id: '28694a0f-3da1-471f-bd96-142456e29d72',
//       fullName: 'Kiara',
//       timeStamp: '12:47 PM',
//       recentText: 'I will call today.',
//       avatarUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBwgu1A5zgPSvfE83nurkuzNEoXs9DMNr8Ww&usqp=CAU',
//     }];

  const {user} = useAuthentication();

  const chats = useMyChats();
  const [listData, setListData] = useState<any[] | undefined>([]);

  useEffect(() => {
    if (user && chats && chats.length !== 0) {
      const data = chats.map((chat) => {

        const recipient =  chat.users.filter((chatUser) => chatUser._id !== user._id)[0];
        const fullName = recipient.firstName + ' ' + recipient.lastName;
        return {
          key: chat.id,
          relation: chat,
          fullName,
          timeStamp: chat.createdAt, // TODO change this to the actual time of last message
        }
      })
      setListData(data);
    }
  }, [chats])

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



  const renderHiddenItem = (data: any, rowMap: any) => <HStack flex="1" pl="2">
    <Pressable w="70" ml="auto"  bg="coolGray.200" justifyContent="center"
               onPress={() => closeRow(rowMap, data.item.key)} _pressed={{
      opacity: 0.5,
    }}>
      <VStack alignItems="center" space={2}>
        <ThreeDotsIcon size="xs" color="coolGray.800"/>
        <Text fontSize="xs" fontWeight="medium" color="coolGray.800">
          More
        </Text>
      </VStack>
    </Pressable>
    <Pressable w="70" bg="red.500" justifyContent="center"
               onPress={() => deleteRow(rowMap, data.item.key)} _pressed={{
      opacity: 0.5,
    }}>
      <VStack alignItems="center" space={2}>
        <DeleteIcon color="white" size="xs"/>
        <Text color="white" fontSize="xs" fontWeight="medium">
          Delete
        </Text>
      </VStack>
    </Pressable>
  </HStack>;

  return <Box bg="white" safeArea flex="1">
    <SwipeListView data={listData} renderItem={ChatListItem} renderHiddenItem={renderHiddenItem} rightOpenValue={-130}
                   previewRowKey={'0'} previewOpenValue={-40} previewOpenDelay={3000} onRowDidOpen={onRowDidOpen}/>
  </Box>;
}

export default Chats;

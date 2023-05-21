import {Avatar, Box, HStack, Pressable, Spacer, Text, VStack} from "native-base";

export const ChatListItem = ({
                               item,
                               index,
                             }: any) => {
  // const relation: IRelation = item;

  return (
      <Pressable key={index} onPress={() => console.log('You touched me')} _dark={{
        bg: 'coolGray.800',
      }} _light={{
        bg: 'white',
      }}>
        <Box pl="4" pr="5" py="2">
          <HStack alignItems="center" space={3}>
            <Avatar size="48px" source={{
              uri: item.avatarUrl,
            }}/>
            <VStack>
              <Text color="coolGray.800" _dark={{
                color: 'warmGray.50',
              }} bold>
                {item.fullName}
              </Text>
              <Text color="coolGray.600" _dark={{
                color: 'warmGray.200',
              }}>
                {item.recentText}
              </Text>
            </VStack>
            <Spacer/>
            <Text fontSize="xs" color="coolGray.800" _dark={{
              color: 'warmGray.50',
            }} alignSelf="flex-start">
              {item.timeStamp}
            </Text>
          </HStack>
        </Box>
      </Pressable>
  );
};
import {Box, HStack, Pressable, Spacer, Text, theme, VStack} from "native-base";
import AvatarImage from "./AvatarImage";

export const ChatListItem = ({
                               item,
                               index,
                             }: any) => {

  if (!item)
    return null;

  console.log("❇️< ChatListItem >" );
  console.log("❇️< ChatListItem > Item: ", JSON.stringify(item, null, 2));
  const initials = item.displayName.split(" ").map((name: string) => name[0]).join("");
  return (
      <Pressable key={index} onPress={item.onPressCallback} _dark={{
        bg: "coolGray.800",
      }} _light={{
        bg: theme.colors.light["100"],
      }}>
        <Box pl="4" pr="5" py="2">
          <HStack alignItems="center" space={3}>
            {item.userPreview && <AvatarImage user={item.userPreview}/>}
            <VStack>
              <Text color="coolGray.800" _dark={{
                color: "warmGray.50",
              }} bold>
                {item.displayName}
              </Text>
              <Text color="coolGray.600" _dark={{
                color: "warmGray.200",
              }}>
                {item.recentText}
              </Text>
            </VStack>
            <Spacer/>
            <Text fontSize="xs" color="coolGray.800" _dark={{
              color: "warmGray.50",
            }} alignSelf="flex-start">
              {item.timeStamp}
            </Text>
          </HStack>
        </Box>
      </Pressable>
  );
};
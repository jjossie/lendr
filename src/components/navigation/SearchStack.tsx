import React from 'react';
import {BottomTabScreenProps} from "@react-navigation/bottom-tabs";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import ToolDetail from "../screens/ToolDetail";
import BorrowSearch from "../screens/BorrowSearch";

const Stack = createNativeStackNavigator();

const SearchStack: React.FC<BottomTabScreenProps<any>> = () => {
  return (
      <Stack.Navigator screenOptions={{
        // TODO put some title styles here but make em consistent across the app
      }}>
        <Stack.Screen name="SearchBrowse" component={BorrowSearch} options={{
          // headerTransparent: true,
          headerShown: false,
          // statusBarHidden: true,
        }} />
        <Stack.Screen name="SearchToolDetail" component={ToolDetail} />
      </Stack.Navigator>
  );
};

export default SearchStack;
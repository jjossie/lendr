import React from 'react';
import {BottomTabScreenProps} from "@react-navigation/bottom-tabs";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import ToolDetail from "../screens/ToolDetail";
import AlgoliaSearch from "../screens/AlgoliaSearch";

const Stack = createNativeStackNavigator();

const SearchStack: React.FC<BottomTabScreenProps<any>> = ({navigation, route}) => {
  return (
      <Stack.Navigator>
        <Stack.Screen name="SearchBrowse" component={AlgoliaSearch} />
        <Stack.Screen name="SearchToolDetail" component={ToolDetail} />
      </Stack.Navigator>
  );
};

export default SearchStack;
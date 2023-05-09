import React, {useEffect, useState} from 'react';
import {Column, Input, Row, ScrollView, Spacer, theme} from 'native-base';
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import BorrowBrowseItem from "../BorrowBrowseItem";
import {ITool} from "../../models/Tool";
import {getToolsWithinRadius} from "../../controllers/Tool";
import {REXBURG} from "../../models/Location";


const BorrowBrowse: React.FC<NativeStackScreenProps<any>> = ({navigation, route}) => {

  const [toolsList, setToolsList]: [ITool[], any] = useState([]);
  const [searchRadius, setSearchRadius] = useState(50);
  const [searchLocation, setSearchLocation] = useState(REXBURG);

  // Side Effects
  useEffect(() => {
    getToolsWithinRadius(searchRadius, searchLocation).then(tools => {
      setToolsList(tools);
    });
  }, [setToolsList]);

  // State
  const [searchTerm, setSearchTerm] = useState("");

  return (
      <Column>
        <Input variant="filled"
               value={searchTerm}
               size="lg"
               mx={4}
               my={2}
               backgroundColor={theme.colors.white}
               placeholder="Search"
               onChangeText={text => setSearchTerm(text)}/>

        {/*<Input placeholder="Search" variant="filled" width="100%" borderRadius="10" py="1" px="2"*/}
        {/*       InputLeftElement={<Icon ml="2" size="4" color="gray.400" as={<Ionicons name="ios-search"/>}/>}/>*/}

        <ScrollView>
          <Row flexWrap="wrap" px={2}>
            {toolsList.map(tool => {
              return <BorrowBrowseItem key={tool.id} tool={tool} navigation={navigation}/>;
            })}
          </Row>
          <Spacer h={20}/>
        </ScrollView>
      </Column>
  );
};

export default BorrowBrowse;
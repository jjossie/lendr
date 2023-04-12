import React, {useEffect, useState} from 'react';
import {Column, Input, Row, ScrollView} from 'native-base';
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import BorrowBrowseItem from "../BorrowBrowseItem";


const BorrowBrowse: React.FC<NativeStackScreenProps<any>> = ({navigation, route}) => {


  useEffect(() => {
    // This should eventually be refactored to use a useCollectionData hook, but we might have to write our own

    // Call a controller to get all the tools within the search terms
  }, []);

  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [tools, setTools] = useState([]);

  return (
      <ScrollView p={8}>
        <Column space="sm">
          <Input variant="filled"
                 value={searchTerm}
                 onChangeText={text => setSearchTerm(text)}/>

          <Row flexWrap="wrap">
            {tools.map(tool => {
              return <BorrowBrowseItem tool={tool} navigation={navigation}/>;
            })}
          </Row>
        </Column>
      </ScrollView>
  );
};

export default BorrowBrowse;
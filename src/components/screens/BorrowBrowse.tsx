import React, {useEffect, useState} from 'react';
import {Column, Input, Row, ScrollView} from 'native-base';
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import BorrowBrowseItem from "../BorrowBrowseItem";
import {ITool} from "../../models/Tool";
import {getAllTools} from "../../controllers/Tool";


const BorrowBrowse: React.FC<NativeStackScreenProps<any>> = ({navigation, route}) => {

  const [toolsList, setToolsList]: [ITool[], any] = useState([]);

  // Side Effects
  useEffect(() => {
    getAllTools().then(tools => {
      setToolsList(tools);
    });
  }, [setToolsList]);

  // State
  const [searchTerm, setSearchTerm] = useState("");

  return (
      <ScrollView>
        <Column space="xs">
          <Input variant="filled"
                 value={searchTerm}
                 onChangeText={text => setSearchTerm(text)}/>

          <Row flexWrap="wrap">
            {toolsList.map(tool => {
              return <BorrowBrowseItem key={tool.id} tool={tool} navigation={navigation}/>;
            })}
          </Row>
        </Column>
      </ScrollView>
  );
};

export default BorrowBrowse;
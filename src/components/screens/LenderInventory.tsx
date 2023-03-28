import React, {useEffect, useState} from 'react';
import {ScrollView} from 'native-base';
import {getAllTools} from "../../controllers/Tool";
import {ITool} from "../../models/Tool";
import LenderInventoryItem from "../LenderInventoryItem";

export interface LenderInventoryProps {
  navigation: any
}

const LenderInventory: React.FC<LenderInventoryProps> = (props: LenderInventoryProps) => {

  const [toolsList, setToolsList]: [ITool[], any] = useState([]);

  useEffect(() => {
    getAllTools().then(tools => {
      setToolsList(tools);
    });
  }, []);

  return (
      <ScrollView>
        {toolsList.map(tool => { // Key should be different probably
          return <LenderInventoryItem navigation={props.navigation} key={tool.name} tool={tool} />;
        })}
      </ScrollView>
  );
}
  ;

  export default LenderInventory;
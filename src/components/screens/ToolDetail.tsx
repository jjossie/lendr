import React, {useEffect, useState} from 'react';
import {ScrollView} from 'react-native';
import {getDoc, doc, Firestore} from 'firebase/firestore/lite';
import {db} from '../../models/firebase';
import {Column, Heading, Text} from "native-base";
import firebase from "firebase/compat";
import DocumentData = firebase.firestore.DocumentData;

export type Props = {
  db: Firestore
}

const getToolData = async (): Promise<DocumentData | undefined> => {
  // const toolCollection = collection(db, "tools");
  const toolDocRef = doc(db, "tools", "T2FSjG3CFvmnxylUtDdu");
  const toolDoc = await getDoc(toolDocRef);

  if (toolDoc.exists())
    console.log(toolDoc.data());
  else
    console.log("Couldn't find tool data");
  return toolDoc.data();
};


const ToolDetail: React.FC<Props> = (props: Props) => {
  //
  // let toolData;
  // getToolData()
  //     .then((data) => {
  //       console.log("finished promise");
  //       toolData = data;
  //     });

  const [toolData, setToolData] = useState<DocumentData>({});
  useEffect(() => {
    getToolData()
        .then(data => {
          setToolData(data!);
        });
  }, []);

  return (
      <ScrollView>
        {toolData ? <Column bg="#FFF" p={5} space={3}>
          <Heading>{toolData.brand} {toolData.name}</Heading>
          <Text fontWeight={500} textAlign="left" fontSize={"lg"}>${toolData.rate?.price}/{toolData.rate?.time}</Text>
          <Text fontSize="md">{toolData.description}</Text>
          <Text>{toolData.lender?.name} - {toolData.lender?.rating}/5 stars</Text>
          {/*<Text>{JSON.stringify(toolData)}</Text>*/}

          <Text>
          {toolData.preferences?.localPickup ? "✅ Local pickup" : "❌ No Local Pickup" }
          </Text>
          <Text>
          {toolData.preferences?.delivery ? "✅ Will deliver" : "❌ No delivery" }
          </Text>
          <Text>
          {toolData.preferences?.useOnSite ? "✅ Available to use at lender location" : "❌ Not available to use at lender location" }
          </Text>
        </Column> : null}
      </ScrollView>
  );
};

export default ToolDetail;
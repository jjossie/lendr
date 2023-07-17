import React, {useEffect, useState} from 'react';
import {Column, Row, ScrollView, Select, Spacer} from 'native-base';
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import BorrowBrowseItem from "../BorrowBrowseItem";
import {ITool} from "../../models/Tool";
import {getToolsWithinRadius} from "../../controllers/tool";
import {useLocation} from "../../utils/hooks/useLocation";


/**
 * @deprecated use BorrowSearch instead, it uses Algolia for instant search, infinite hits, geoqueries, etc.
 * @param navigation
 * @param route
 * @returns {JSX.Element}
 * @constructor
 */
const BorrowBrowse: React.FC<NativeStackScreenProps<any>> = ({navigation, route}) => {

  const [toolsList, setToolsList]: [ITool[], any] = useState([]);
  const [searchRadius, setSearchRadius] = useState(5);
  const [searchRadiusString, setSearchRadiusString] = useState<SearchRadiusString>("5");

  const {geopoint, city} = useLocation();

  // Side Effects
  useEffect(() => {
    // console.log("❇️BorrowBrowse - useEffect - geopoint: ", geopoint);
    (async () => {
      // console.log("❇️BorrowBrowse - useEffect - (async) geopoint: ", geopoint);
      if (geopoint &&
          geopoint.length === 2 &&
          geopoint[0] !== undefined &&
          geopoint[1] !== undefined &&
          city !== undefined) {
        const tools = await getToolsWithinRadius(searchRadius, geopoint);
        setToolsList(tools);
      }else{
        console.log("❇️Cannot fetch tools - Location is uninitialized");
        setToolsList([]);
      }
    })();
  }, [searchRadiusString, searchRadius, geopoint, city]);

  // State
  const [searchTerm, setSearchTerm] = useState("");

  return (
      <Column>
        {/*<Input variant="filled"*/}
        {/*       value={searchTerm}*/}
        {/*       size="lg"*/}
        {/*       mx={4}*/}
        {/*       my={2}*/}
        {/*       backgroundColor={theme.colors.white}*/}
        {/*       placeholder="Search"*/}
        {/*       onChangeText={text => setSearchTerm(text)}/>*/}

        {/*<InstantSearch indexName={ALGOLIA_INDEX_NAME} searchClient={searchClient}>*/}
        {/*  <SearchBox/>*/}
        {/*</InstantSearch>*/}

        {/*<Input placeholder="Search" variant="filled" width="100%" borderRadius="10" py="1" px="2"*/}
        {/*       InputLeftElement={<Icon ml="2" size="4" color="gray.400" as={<Ionicons name="ios-algolia"/>}/>}/>*/}

        <ScrollView>
          <ScrollView w="200%" horizontal={true} showsHorizontalScrollIndicator={false}>
            <Row>
              <Select selectedValue={searchRadiusString}
                      mx={4}
                      my={2}
                      onValueChange={(selectValue) => {
                        setSearchRadiusString(selectValue as SearchRadiusString);
                        setSearchRadius(parseInt(selectValue));
                      }}>
                <Select.Item label="5 miles" value="5"/>
                <Select.Item label="10 miles" value="10"/>
                <Select.Item label="20 miles" value="20"/>
                <Select.Item label="30 miles" value="30"/>
                <Select.Item label="50 miles" value="50"/>
              </Select>
            </Row>
          </ScrollView>
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

type SearchRadiusString = "5" | "10" | "20" | "30" | "50" | "100";
import React, {useCallback, useRef, useState} from "react";
import {FlatList, SafeAreaView, StyleSheet} from "react-native";
import {Filters} from "../utilities/algolia/Filters";
import {ALGOLIA_INDEX_NAME, searchClient} from "../../config/algolia";
import {InstantSearch} from "react-instantsearch-hooks-web";
import {Row, Select, theme, View} from "native-base";
import {SearchBox} from "../utilities/algolia/SearchBox";
import {InfiniteHits} from "../utilities/algolia/InfiniteHits";
import {Hit} from "../utilities/algolia/Hit";
import {SearchClient} from "algoliasearch/dist/algoliasearch";
import {useLocation} from "../../utils/hooks/useLocation";
import {metersFromMiles} from "../../models/Location";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {MultipleQueriesQuery} from "@algolia/client-search";


let geoSearchClient: SearchClient = {
  ...searchClient as SearchClient,
};

type SearchRadiusString = "5" | "10" | "20" | "30" | "50" | "100" | "300" | "500";

export const BorrowSearch: React.FC<NativeStackScreenProps<any>> = ({navigation}) => {
  // React Stuff
  const [isModalOpen, setModalOpen] = useState(false);
  const listRef = useRef<FlatList>(null);

  // Logical State
  const [searchRadiusString, setSearchRadiusString] = useState<SearchRadiusString>("5");
  const [radiusMeters, setRadiusMeters] = useState(Math.floor(metersFromMiles(50))); // convert to int

  const {geopoint} = useLocation();

  function scrollToTop() {
    listRef.current?.scrollToOffset({animated: false, offset: 0});
  }

  console.log("❇️Algolia Search Client being made");

  const overrideSearch = useCallback((requests: readonly MultipleQueriesQuery[]) => {
    if (!geopoint)
      return searchClient.search([]);

    const requestOptions = {
      aroundLatLng: `${geopoint[0]},${geopoint[1]}`,
      aroundRadius: radiusMeters,
    };
    console.log("❇️Algolia Search() called");
    console.log(`❇️Searching for tools ${radiusMeters} meters from ${geopoint[0]}, ${geopoint[1]}`);
    if (requests.length <= 0)
      return searchClient.search(requests);

    const newRequests = [...requests].map(request => {
      if (!request.params)
        return;
      // @ts-ignore
      request.params.aroundLatLng = requestOptions.aroundLatLng;
      // @ts-ignore
      request.params.aroundRadius = requestOptions.aroundRadius;
      return request;
    });

    console.log("❇️Requests: ", JSON.stringify(newRequests, null, 2));
    return searchClient.search(newRequests as any);
  }, [geopoint, radiusMeters]);

  geoSearchClient = {
    ...geoSearchClient as SearchClient,
    // @ts-ignore
    search: overrideSearch,
  };

  return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <InstantSearch searchClient={geoSearchClient} indexName={ALGOLIA_INDEX_NAME}>
            <SearchBox onChange={scrollToTop}/>
            <Row w={"100%"} alignItems={"center"}>
              <Filters
                  isModalOpen={isModalOpen}
                  onToggleModal={() => setModalOpen((isOpen) => !isOpen)}
                  onChange={scrollToTop}
              />
              <Select flex={1} selectedValue={searchRadiusString}
                      mx={4}
                      my={2}
                      onValueChange={(selectValue) => {
                        setSearchRadiusString(selectValue as SearchRadiusString);
                        setRadiusMeters(Math.floor(metersFromMiles(parseInt(selectValue))));
                      }}>
                <Select.Item label="5 miles" value="5"/>
                <Select.Item label="10 miles" value="10"/>
                <Select.Item label="20 miles" value="20"/>
                <Select.Item label="30 miles" value="30"/>
                <Select.Item label="50 miles" value="50"/>
                <Select.Item label="100 miles" value="100"/>
                <Select.Item label="300 miles" value="300"/>
                <Select.Item label="500 miles" value="500"/>
              </Select>
            </Row>
            <InfiniteHits ref={listRef} hitComponent={Hit}/>
          </InstantSearch>
        </View>
      </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#252b33',
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.light[100],
    flexDirection: 'column',
  },
});

export default BorrowSearch;
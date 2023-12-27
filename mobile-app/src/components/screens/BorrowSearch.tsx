import React, {useRef, useState} from "react";
import {FlatList, SafeAreaView, StyleSheet} from "react-native";
import {Filters} from "../utilities/algolia/Filters";
import {ALGOLIA_INDEX_NAME, searchClient} from "../../config/algolia";
import {Configure, InstantSearch} from "react-instantsearch-hooks-web";
import {Row, Select, theme, View} from "native-base";
import {SearchBox} from "../utilities/algolia/SearchBox";
import {InfiniteHits} from "../utilities/algolia/InfiniteHits";
import {Hit} from "../utilities/algolia/Hit";
import {useLocation} from "../../utils/hooks/useLocation";
import {metersFromMiles} from "../../models/location";
import {NativeStackScreenProps} from "@react-navigation/native-stack";

type SearchRadiusString = "5" | "10" | "20" | "30" | "50" | "100" | "300" | "500";

export const BorrowSearch: React.FC<NativeStackScreenProps<any>> = ({navigation}) => {
  // React Stuff
  const [isModalOpen, setModalOpen] = useState(false);
  const listRef = useRef<FlatList>(null);

  // Logical State
  const [searchRadiusString, setSearchRadiusString] = useState<SearchRadiusString>("30");
  const [radiusMeters, setRadiusMeters] = useState(Math.floor(metersFromMiles(30))); // convert to int

  const {geopoint, errorMsg} = useLocation();

  function scrollToTop() {
    listRef.current?.scrollToOffset({animated: false, offset: 0});
  }

  return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <InstantSearch searchClient={searchClient} indexName={ALGOLIA_INDEX_NAME}>
            <Configure
            //@ts-ignore idk why it thinks aroundLatLng is not valid it totally is
                aroundLatLng={geopoint ? `${geopoint[0]},${geopoint[1]}` : ""}
                aroundRadius={radiusMeters}
            />
            <SearchBox onChange={scrollToTop}/>
            <Row w={"100%"} justifyContent={"space-between"} alignItems={"center"}>
              <Select flex={1}
                      selectedValue={searchRadiusString}
                      mx={4}
                      my={2}
                      fontSize={"md"}
                      bgColor={theme.colors.white}
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
              <Filters
                  isModalOpen={isModalOpen}
                  onToggleModal={() => setModalOpen((isOpen) => !isOpen)}
                  onChange={scrollToTop}
              />
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
    // backgroundColor: '#252b33',
  },
  container: {
    flex: 1,
    // backgroundColor: theme.colors.light[100],
    flexDirection: 'column',
  },
});

export default BorrowSearch;
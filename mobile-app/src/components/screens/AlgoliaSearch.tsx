import React, {useRef, useState} from "react";
import {FlatList, SafeAreaView, StyleSheet} from "react-native";
import {Filters} from "../utilities/algolia/Filters";
import {ALGOLIA_INDEX_NAME, searchClient} from "../../config/algolia";
import {InstantSearch} from "react-instantsearch-hooks-web";
import {theme, View} from "native-base";
import {SearchBox} from "../utilities/algolia/SearchBox";
import {InfiniteHits} from "../utilities/algolia/InfiniteHits";
import {Hit} from "../utilities/algolia/Hit";
import {SearchClient} from "algoliasearch/dist/algoliasearch";
import {useLocation} from "../../utils/hooks/useLocation";
import {metersFromMiles} from "../../models/Location";

export default function AlgoliaSearch() {
  // React Stuff
  const [isModalOpen, setModalOpen] = useState(false);
  const listRef = useRef<FlatList>(null);

  // Logical State
  const [radiusMeters, setRadiusMeters] = useState(metersFromMiles(5));
  const {geopoint} = useLocation();

  if (!geopoint)
    return;

  function scrollToTop() {
    listRef.current?.scrollToOffset({animated: false, offset: 0});
  }

  const geoSearchClient: SearchClient = {
    ...searchClient as SearchClient,
    search(requests) {
      return searchClient.search(requests, {
        aroundLatLng: `${geopoint[0]}, ${geopoint[1]}`,
        aroundRadius: radiusMeters
      });
    }
  }

  return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <InstantSearch searchClient={searchClient} indexName={ALGOLIA_INDEX_NAME}>
            <SearchBox onChange={scrollToTop}/>
            {/*<GeoSearch/>*/}
            <Filters
                isModalOpen={isModalOpen}
                onToggleModal={() => setModalOpen((isOpen) => !isOpen)}
                onChange={scrollToTop}
            />
            <InfiniteHits ref={listRef} hitComponent={Hit}/>
          </InstantSearch>
        </View>
      </SafeAreaView>
  );
}



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
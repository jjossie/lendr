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


let geoSearchClient: SearchClient = {
  ...searchClient as SearchClient,
};

export default function AlgoliaSearch() {
  // React Stuff
  const [isModalOpen, setModalOpen] = useState(false);
  const listRef = useRef<FlatList>(null);

  // Logical State

  const [radiusMeters, setRadiusMeters] = useState(Math.floor(metersFromMiles(50))); // convert to int

  const {geopoint} = useLocation();

  if (!geopoint)
    return;

  function scrollToTop() {
    listRef.current?.scrollToOffset({animated: false, offset: 0});
  }

  console.log("❇️Algolia Search Client being made");

  geoSearchClient = {
    ...geoSearchClient as SearchClient,
    search(requests) {
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

      // console.log("❇️Requests: ", JSON.stringify(newRequests, null, 2));
      return searchClient.search(newRequests as any);
    },
  };

  return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <InstantSearch searchClient={geoSearchClient} indexName={ALGOLIA_INDEX_NAME}>
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
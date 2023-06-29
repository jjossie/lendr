import React, {useRef, useState} from "react";
import {FlatList, SafeAreaView, StyleSheet} from "react-native";
import {Filters} from "../utilities/algolia/Filters";
import {ALGOLIA_INDEX_NAME, searchClient} from "../../config/algolia";
import {InstantSearch} from "react-instantsearch-hooks-web";
import {theme, View} from "native-base";
import {SearchBox} from "../utilities/algolia/SearchBox";
import {InfiniteHits} from "../utilities/algolia/InfiniteHits";
import {Hit} from "../utilities/algolia/Hit";

export default function AlgoliaSearch() {
  const [isModalOpen, setModalOpen] = useState(false);
  const listRef = useRef<FlatList>(null);


  function scrollToTop() {
    listRef.current?.scrollToOffset({animated: false, offset: 0});
  }

  return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <InstantSearch searchClient={searchClient} indexName={ALGOLIA_INDEX_NAME}>
            <SearchBox onChange={scrollToTop}/>
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
import React, {useRef, useState} from "react";
import {FlatList, SafeAreaView, StyleSheet} from "react-native";
import {Filters} from "../utilities/algolia/Filters";
import {searchClient} from "../../config/algolia";
import {ProductHit} from "../../utils/types/ProductHit";
import {InstantSearch} from "react-instantsearch-hooks-web";
import {Text, View} from "native-base";
import {SearchBox} from "../utilities/algolia/SearchBox";
import {InfiniteHits} from "../utilities/algolia/InfiniteHits";
import {Highlight} from "../utilities/algolia/Highlight";

export default function AlgoliaSearch() {
  const [isModalOpen, setModalOpen] = useState(false);
  const listRef = useRef<FlatList>(null);

  function scrollToTop() {
    listRef.current?.scrollToOffset({ animated: false, offset: 0 });
  }

  return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <InstantSearch searchClient={searchClient} indexName="AL">
            <SearchBox onChange={scrollToTop} />
            <Filters
                isModalOpen={isModalOpen}
                onToggleModal={() => setModalOpen((isOpen) => !isOpen)}
                onChange={scrollToTop}
            />
            <InfiniteHits ref={listRef} hitComponent={Hit} />
          </InstantSearch>
        </View>
      </SafeAreaView>
  );
}

type HitProps = {
  hit: ProductHit;
};

function Hit({ hit }: HitProps) {
  return (
      <Text>
        <Highlight hit={hit} attribute="name" />
      </Text>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#252b33',
  },
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    flexDirection: 'column',
  },
});
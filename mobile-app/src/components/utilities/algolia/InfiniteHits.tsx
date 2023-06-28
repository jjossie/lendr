//
// Starter code courtesy of:
// https://github.com/algolia/doc-code-samples/tree/master/react-instantsearch-hooks-native/getting-started/src

import React, {forwardRef} from 'react';
import {FlatList, StyleSheet, View} from 'react-native';
import {Hit as AlgoliaHit} from '@algolia/client-search';
import {useInfiniteHits, UseInfiniteHitsProps} from 'react-instantsearch-hooks';
import {Hit} from "../../screens/Hit";

type InfiniteHitsProps<THit> = UseInfiniteHitsProps & {
  hitComponent: (props: { hit: THit }) => JSX.Element;
};

export const InfiniteHits = forwardRef(
    <THit extends AlgoliaHit<Record<string, unknown>>>(
        {hitComponent: Hit, ...props}: InfiniteHitsProps<THit>,
        ref: React.ForwardedRef<FlatList<THit>>,
    ) => {
      const {hits, isLastPage, showMore} = useInfiniteHits(props);


      return (
          <FlatList
              ref={ref}
              numColumns={2}
              data={hits as unknown as THit[]}
              keyExtractor={(item) => item.objectID}
              ItemSeparatorComponent={() => <View style={styles.separator}/>}
              onEndReached={() => {
                if (!isLastPage) {
                  showMore();
                }
              }}
              renderItem={({item}) => (
                  <View style={styles.item}>
                    <Hit hit={item as unknown as THit} />
                  </View>
              )}
          />
      );
    },
);

const styles = StyleSheet.create({
  separator: {
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  item: {
    padding: 5,
  },
});

declare module 'react' {
  function forwardRef<T, P = {}>(
      render: (props: P, ref: React.Ref<T>) => React.ReactElement | null,
  ): (props: P & React.RefAttributes<T>) => React.ReactElement | null;
}
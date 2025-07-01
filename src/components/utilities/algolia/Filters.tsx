//
// Starter code courtesy of:
// https://github.com/algolia/doc-code-samples/tree/master/react-instantsearch-hooks-native/getting-started/src

import React from 'react';
import {Button, Text} from "native-base";
import {Modal, SafeAreaView, StyleSheet, TouchableOpacity, View} from 'react-native';
import {useClearRefinements, useCurrentRefinements, useRefinementList} from 'react-instantsearch-hooks';

type FiltersProps = {
  isModalOpen: boolean;
  onToggleModal: () => void;
  onChange: () => void;
};

export function Filters({
                          isModalOpen,
                          onToggleModal,
                          onChange,
                        }: FiltersProps) {
  const {items, refine} = useRefinementList({attribute: 'brand'});
  const {canRefine: canClear, refine: clear} = useClearRefinements();
  const {items: currentRefinements} = useCurrentRefinements();
  const totalRefinements = currentRefinements.reduce(
      (acc, {refinements}) => acc + refinements.length,
      0,
  );

  return (
      <>
        <TouchableOpacity
            style={styles.filtersButton}
            onPress={onToggleModal}
        >
          <Button
              onPress={() => {
                onToggleModal();
              }}
              variant={"ghost"}>Filters</Button>
          {totalRefinements > 0 && (
              <View style={styles.itemCount}>
                <Text style={styles.itemCountText}>{totalRefinements}</Text>
              </View>
          )}
        </TouchableOpacity>

        <Modal animationType="slide" visible={isModalOpen}>
          <SafeAreaView>
            <View style={styles.container}>
              <View style={styles.title}>
                <Text style={styles.titleText}>Brand</Text>
              </View>
              <View style={styles.list}>
                {items.map((item) => {
                  return (
                      <TouchableOpacity
                          key={item.value}
                          onPress={() => {
                            refine(item.value);
                            onChange();
                          }}
                          style={styles.item}
                      >
                        <Text
                            // style={{
                            //   ...styles.labelText,
                            //   fontWeight: item.isRefined ? '800' : '400',
                            // }}

                        >
                          {item.label}
                        </Text>
                        <View style={styles.itemCount}>
                          <Text style={styles.itemCountText}>{item.count}</Text>
                        </View>
                      </TouchableOpacity>
                  );
                })}
              </View>
            </View>
            <View style={styles.filterListButtonContainer}>
              <View style={styles.filterListButton}>
                <Button
                    onPress={() => {
                      clear();
                      onChange();
                      onToggleModal();
                    }}
                    color="#252b33"
                    disabled={!canClear}
                    variant={"outline"}
                >Clear All</Button>
              </View>
              <View style={styles.filterListButton}>
                <Button
                    onPress={onToggleModal}
                    color="#252b33"
                    variant={"solid"}
                >See Results</Button>
              </View>
            </View>
          </SafeAreaView>
        </Modal>
      </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 36,
    backgroundColor: '#ffffff',
  },
  title: {
    alignItems: 'center',
  },
  titleText: {
    paddingTop: 16,
    fontSize: 32,
  },
  list: {
    marginTop: 32,
  },
  item: {
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  itemCount: {
    backgroundColor: '#252b33',
    borderRadius: 24,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginLeft: 4,
  },
  itemCountText: {
    color: '#ffffff',
    fontWeight: '800',
  },
  labelText: {
    fontSize: 16,
  },
  filterListButtonContainer: {
    flexDirection: 'row',
  },
  filterListButton: {
    flex: 1,
    alignItems: 'center',
    marginTop: 18,
  },
  filtersButton: {
    flexGrow: 1,
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersButtonText: {
    fontSize: 18,
    textAlign: 'center',
  },
});
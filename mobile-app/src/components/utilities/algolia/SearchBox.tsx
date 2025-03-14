//
// Starter code courtesy of: https://github.com/algolia/doc-code-samples/tree/master/react-instantsearch-hooks-native/getting-started/src
//

import React, {useRef, useState} from 'react';
import {StyleSheet, TextInput, View} from 'react-native';
import {useSearchBox, UseSearchBoxProps} from 'react-instantsearch-hooks';

type SearchBoxProps = UseSearchBoxProps & {
  onChange: (newValue: string) => void;
};


export function SearchBox({ onChange, ...props }: SearchBoxProps) {
  const { query, refine } = useSearchBox(props);
  const [inputValue, setInputValue] = useState(query);
  const inputRef = useRef<TextInput>(null);

  // Might have to do geo search stuff here


  function setQuery(newQuery: string) {
    setInputValue(newQuery);
    refine(newQuery);
  }

  // Track when the InstantSearch query changes to synchronize it with
  // the React state.
  // We bypass the state update if the input is focused to avoid concurrent
  // updates when typing.
  if (query !== inputValue && !inputRef.current?.isFocused()) {
    setInputValue(query);
  }

  return (
      <View style={styles.container}>
        <TextInput
            ref={inputRef}
            style={styles.input}
            value={inputValue}
            onChangeText={(newValue) => {
              setQuery(newValue);
              onChange(newValue);
            }}
            clearButtonMode="while-editing"
            autoCapitalize="none"
            autoCorrect={false}
            spellCheck={false}
            autoComplete="off"
            placeholder={'Search'}
        />
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // backgroundColor: theme.colors.light[50],
    padding: 18,
  },
  input: {
    height: 48,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
  },
});
//
// Starter code courtesy of: https://github.com/algolia/doc-code-samples/tree/master/react-instantsearch-hooks-native/getting-started/src
//

import React, {Fragment} from 'react';
import {StyleSheet, Text} from 'react-native';
import {Hit as AlgoliaHit} from '@algolia/client-search';
import {getHighlightedParts, getPropertyByPath} from 'instantsearch.js/es/lib/utils';
import {theme} from "native-base";

type HighlightPartProps = {
  children: React.ReactNode;
  isHighlighted: boolean;
};

function HighlightPart({ children, isHighlighted }: HighlightPartProps) {
  return (
      <Text style={isHighlighted ? styles.highlighted : styles.nonHighlighted}>
        {children}
      </Text>
  );
}

type HighlightProps<THit> = {
  hit: THit;
  attribute: keyof THit | string[];
  className?: string;
  separator?: string;
};

export function Highlight<THit extends AlgoliaHit<Record<string, unknown>>>({
                                                                              hit,
                                                                              attribute,
                                                                              separator = ', ',
                                                                            }: HighlightProps<THit>) {
  const { value: attributeValue = '' } =
  getPropertyByPath(hit._highlightResult, attribute as string) || {};
  const parts = getHighlightedParts(attributeValue);

  return (
      <>
        {parts.map((part, partIndex) => {
          if (Array.isArray(part)) {
            const isLastPart = partIndex === parts.length - 1;

            return (
                <Fragment key={partIndex}>
                  {part.map((subPart, subPartIndex) => (
                      <HighlightPart
                          key={subPartIndex}
                          isHighlighted={subPart.isHighlighted}
                      >
                        {subPart.value}
                      </HighlightPart>
                  ))}

                  {!isLastPart && separator}
                </Fragment>
            );
          }

          return (
              <HighlightPart key={partIndex} isHighlighted={part.isHighlighted}>
                {part.value}
              </HighlightPart>
          );
        })}
      </>
  );
}

const styles = StyleSheet.create({
  highlighted: {
    fontWeight: 'bold',
    backgroundColor: theme.colors.orange[300],
    color: '#6f6106',
    borderRadius: 2,
  },
  nonHighlighted: {
    fontWeight: 'normal',
    backgroundColor: 'transparent',
    color: 'black',
  },
});
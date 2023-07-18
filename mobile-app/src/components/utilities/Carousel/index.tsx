import React from 'react';
import {ScrollView, Text, View} from 'react-native';
import {Stat} from './Stat';
import {Slide} from './Slide';
import {styles} from './styles';
import {Row} from "native-base";

export type CarouselProps = {
  items: any[],
  variant?: "stats" | "slides",
  itemsPerInterval?: number,
}

export const Carousel: React.FC<CarouselProps> = ({items, variant = "slides", itemsPerInterval = 1}) => {

  const [interval, setInterval] = React.useState<number | undefined>(1);
  const [intervals, setIntervals] = React.useState(1);
  const [width, setWidth] = React.useState(0);

  const init = (width: number) => {
    // initialise width
    setWidth(width);
    // initialise total intervals
    const totalItems = items.length;
    setIntervals(Math.ceil(totalItems / itemsPerInterval));
  };

  const getInterval = (offset: any) => {
    for (let i = 1; i <= intervals; i++) {
      if (offset + 1 < (width / intervals) * i) {
        return i;
      }
      if (i == intervals) {
        return i;
      }
    }
  };

  let bullets = [];
  for (let i = 1; i <= intervals; i++) {
    bullets.push(
        <Text
            key={i}
            style={{
              ...styles.bullet,
              opacity: interval === i ? 0.5 : 0.1,
            }}
        >
          &bull;
        </Text>,
    );
  }

  return (
      <View style={styles.container}>
        <ScrollView
            horizontal={true}
            contentContainerStyle={{...styles.scrollView, width: `${100 * intervals}%`}}
            showsHorizontalScrollIndicator={false}
            onContentSizeChange={(w, h) => init(w)}
            onScroll={data => {
              setWidth(data.nativeEvent.contentSize.width);
              setInterval(getInterval(data.nativeEvent.contentOffset.x));
            }}
            scrollEventThrottle={200}
            pagingEnabled
            decelerationRate="fast"
        >
          {items.map((item: any, index: number) => {
            switch (variant) {
              case 'stats':
                return (
                    <Stat
                        key={index}
                        label={item.label}
                        value={item.value}
                    />
                );
              default:
                return (
                    <Slide
                        item={item}
                        key={index}
                        title={item.title}
                    />
                );
            }
          })}
        </ScrollView>
        <Row justifyContent={"center"} >
          {bullets}
        </Row>
      </View>
  );
};

export default Carousel;

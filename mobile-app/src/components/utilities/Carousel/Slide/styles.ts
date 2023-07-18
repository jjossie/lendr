import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  slide: {
    paddingTop: 10,
    paddingHorizontal: 10,
    flexBasis: '100%',
    flex: 1,
    maxWidth: '100%',
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    height: "100%"
  },
  slideText: {
    width: '100%',
    textAlign: 'left',
    fontSize: 20,
  },
});

export default styles;
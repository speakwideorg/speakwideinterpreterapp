import { Colors, Fonts } from '@app/themes';
import { normalize } from '@app/utils/orientation';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageBackground: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  map: {
    height: normalize(280),
    width: '100%',
    position: 'absolute',
  },
  main: { alignItems: 'center', top: normalize(-20) },
  logo: {
    height: normalize(70),
    width: normalize(70),
  },
  title: {
    height: normalize(30),
    width: normalize(140),
  },
  subTitle: {
    color: Colors.night_blue,
    fontFamily: Fonts.Inter_Regular,
    fontSize: normalize(11),
    marginTop: normalize(8),
  },
  v2: {
    position: 'absolute',
    bottom: normalize(20),
    flexDirection: 'row',
    alignItems: 'center',
  },
  progress: {
    height: normalize(35),
    width: normalize(35),
  },
  loading: {
    color: Colors.white,
    fontSize: normalize(10),
    fontFamily: Fonts.Inter_Medium,
  },
});

export default styles;

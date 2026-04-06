import { Colors, Fonts } from "@app/themes";
import { normalize } from "@app/utils/orientation";
import { Dimensions, StyleSheet } from "react-native";

const { width } = Dimensions.get('screen');

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.ceramic },
  topShape: { height: normalize(340), width, position: 'absolute', top: 0 },
  title: {
    fontFamily: Fonts.Manrope_Regular,
    color: Colors.night_blue,
    fontSize: normalize(20),
    marginLeft: normalize(15),
    marginTop: normalize(10),
  },
  titleBold: { fontFamily: Fonts.Manrope_SemiBold },
  subheading: {
    fontSize: normalize(11),
    color: Colors.dark_grey,
    fontFamily: Fonts.Inter_Regular,
    marginTop: normalize(5),
    marginLeft: normalize(15),
  },
  contentWrapper: {
    flex: 1,
    backgroundColor: Colors.white,
    marginTop: normalize(20),
    borderTopLeftRadius: normalize(30),
    borderTopRightRadius: normalize(30),
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 2,
    paddingTop: normalize(15),
  },
  keyboardContainer: {
    paddingBottom: normalize(45),
    paddingHorizontal: normalize(15),
  },
  label: {
    fontFamily: Fonts.Inter_Medium,
    color: Colors.night_blue,
    fontSize: normalize(13),
    marginTop: normalize(6),
  },
  mb10: { marginBottom: normalize(10) },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: normalize(8),
  },
  checkboxBorder: { borderColor: '#E8E8E8' },
  checkboxLabel: {
    marginLeft: normalize(10),
    fontSize: normalize(11),
    fontFamily: Fonts.Inter_Regular,
    color: Colors.dark_grey,
  },
  radioRow: { flexDirection: 'row', marginTop: normalize(8) },
  ratingRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: normalize(8),
  },
  helperText: {
    fontFamily: Fonts.Inter_Regular,
    color: Colors.dark_grey,
    fontSize: normalize(13),
    marginTop: normalize(8),
    marginBottom: normalize(4),
  },
  durationRow: { flexDirection: 'row' },
  termsContainer: {
    width: '90%',
    flexDirection: 'row',
    marginTop: normalize(10),
  },
  terms: {
    fontFamily: Fonts.Inter_Regular,
    fontSize: normalize(11),
    color: Colors.night_blue,
    width: '90%',
    marginLeft: normalize(8),
    top: normalize(-2),
  },
  inputTitle: { fontFamily: Fonts.Inter_Regular, color: Colors.dark_grey },
  logoView: {
    borderWidth: normalize(1),
    borderStyle: 'dashed',
    borderColor: Colors.hawkes_blue,
    height: normalize(130),
    borderRadius: normalize(8),
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: normalize(8),
    marginBottom: normalize(12),
  },
  backup: {
    height: normalize(35),
    width: normalize(35),
    resizeMode: 'contain',
  },
  title1: {
    fontFamily: Fonts.Inter_Medium,
    color: Colors.purple,
    fontSize: normalize(12),
    textDecorationColor: Colors.purple,
    textDecorationLine: 'underline',
    marginTop: normalize(15),
  },
  title2: {
    fontFamily: Fonts.Inter_Regular,
    color: Colors.dust,
    fontSize: normalize(9),
    marginTop: normalize(8),
  },
  imageDeleteContainer: {
    height: normalize(20),
    width: normalize(20),
    backgroundColor: Colors.white,
    position: 'absolute',
    top: normalize(10),
    right: normalize(10),
    borderRadius: normalize(20),
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
});

export default styles
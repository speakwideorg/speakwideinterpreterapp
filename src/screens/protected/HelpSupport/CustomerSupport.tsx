import React, { memo } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import MyStatusBar from '@app/utils/helpers/MyStatusBar';
import { Colors, Fonts, Icons, Images } from '@app/themes';
import Header from '@app/components/common/Header';
import { normalize } from '@app/utils/orientation';
import { isIos } from '@app/utils/helpers/Validation';
import { handleCall, handleEmail, hexToRGB } from '@app/utils/helpers';
import { navigate } from '@app/navigation/RootNaivgation';

const { width } = Dimensions.get('screen');

// Real Speakwide support contact details.
// These were previously hardcoded to developer placeholders (+919876543210 and
// test@gmail.com), so tapping Call or Email reached a dead number/mailbox.
// If SUPPORT_PHONE is ever blanked out, the Call option hides itself rather than
// dialling an incorrect number.
const SUPPORT_PHONE = '+13053308071';
const SUPPORT_EMAIL = 'customerservice@speakwide.com';

const contactOptions = [
  { id: '1', label: 'Chat', icon: Icons.chat },
  ...(SUPPORT_PHONE ? [{ id: '2', label: 'Call', icon: Icons.call }] : []),
  { id: '3', label: 'Email', icon: Icons.email },
];

interface ContactOptionProps {
  label: string;
  icon: any;
  onPress?: () => void;
}

const ContactOption = memo(({ label, icon, onPress }: ContactOptionProps) => (
  <TouchableOpacity
    style={styles.optionCard}
    activeOpacity={0.7}
    onPress={onPress}
  >
    <View style={styles.row}>
      <Image source={icon} style={styles.icon} />
      <Text style={styles.label}>{label}</Text>
    </View>
    <Image source={Icons.arrow_forward} style={styles.arrow} />
  </TouchableOpacity>
));

const CustomerSupport = () => {
  return (
    <View style={styles.container}>
      <Image
        source={Images.top_shape}
        resizeMode="contain"
        style={styles.topShape}
      />

      <MyStatusBar
        backgroundColor="transparent"
        barStyle="dark-content"
        translucent
      />

      <Header isBack isShowProfile={false} />

      <Text style={styles.title}>
        Customer <Text style={styles.titleBold}>Support</Text>
      </Text>
      <Text style={styles.subheading}>Select an Option to Proceed</Text>

      <View style={styles.contentWrapper}>
        <View style={styles.cardWrapper}>
          <Image
            source={Images.backgroundHeader}
            style={styles.backgroundHeader}
          />
          <View style={styles.optionsContainer}>
            {contactOptions.map(item => (
              <ContactOption
                key={item.id}
                label={item.label}
                icon={item.icon}
                onPress={() => {
                  // Keyed off the option's id rather than its array index, since the
                  // Call option is omitted when no support number is configured.
                  if (item.id === '1') {
                    navigate('SupportChat');
                  } else if (item.id === '2') {
                    handleCall(SUPPORT_PHONE);
                  } else if (item.id === '3') {
                    handleEmail(SUPPORT_EMAIL, 'Speakwide Support Request');
                  }
                }}
              />
            ))}
          </View>
        </View>
      </View>
    </View>
  );
};

export default memo(CustomerSupport);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.ceramic,
  },
  topShape: {
    height: normalize(340),
    width,
    position: 'absolute',
    top: 0,
  },
  title: {
    fontFamily: Fonts.Manrope_Regular,
    color: Colors.night_blue,
    fontSize: normalize(20),
    marginLeft: normalize(15),
    marginTop: normalize(10),
  },
  titleBold: {
    fontFamily: Fonts.Manrope_SemiBold,
  },
  subheading: {
    fontSize: normalize(11),
    color: Colors.dark_grey,
    fontFamily: Fonts.Inter_Regular,
    marginTop: normalize(5),
    marginLeft: normalize(15),
  },
  contentWrapper: {
    flex: 1,
  },
  cardWrapper: {
    marginHorizontal: normalize(15),
    marginTop: normalize(isIos() ? 30 : 26),
    backgroundColor: Colors.white,
    borderRadius: normalize(17),
    shadowColor: hexToRGB(Colors.dark_grey, isIos() ? 1 : 0.3),
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    paddingBottom: normalize(10),
  },
  backgroundHeader: {
    width: '100%',
    height: normalize(50),
    resizeMode: 'contain',
    top: normalize(-12),
    position: 'absolute',
  },
  optionsContainer: {
    paddingHorizontal: normalize(14),
    marginTop: normalize(8),
    marginBottom: normalize(3),
    gap: normalize(10),
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAF7FF',
    paddingVertical: normalize(14),
    paddingHorizontal: normalize(16),
    borderRadius: normalize(8),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: normalize(18),
    height: normalize(18),
    tintColor: Colors.night_blue,
    marginRight: normalize(10),
  },
  label: {
    fontFamily: Fonts.Inter_Regular,
    fontSize: normalize(12),
    color: Colors.night_blue,
  },
  arrow: {
    width: normalize(12),
    height: normalize(12),
    tintColor: Colors.night_blue,
  },
});

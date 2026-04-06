import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { normalize } from '@app/utils/orientation';
import { Colors, Fonts, Icons, Images } from '@app/themes';
import { isIos } from '@app/utils/helpers/Validation';
import Button from '@app/components/common/Button';

interface Props {
  onCancel: () => void;
  onConfirm: () => void;
}

const CancelSessionContent: React.FC<Props> = ({ onCancel, onConfirm }) => {
  return (
    <View style={styles.container}>
      {/* Main content */}
      <View style={styles.main}>
        <Image source={Images.cancelHourGlass} style={styles.icon} />
        <Text style={styles.title}>
          Are you sure you want to cancel the session?
        </Text>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <View style={styles.info}>
            <Image source={Icons.info} style={styles.infoIcon} />
          </View>
          <Text style={styles.infoText}>
            Cancelling this session may result in penalty fees according to our
            cancellation policy
          </Text>
        </View>
      </View>

      {/* Action buttons */}
      <View style={styles.btnRow}>
        <Button
          onPress={onCancel}
          title="No"
          width="48%"
          marginTop={0}
          colors={[Colors.snow_drift, Colors.snow_drift]}
          textColor={Colors.purple}
          elevation={0}
          shadowOpacity={0}
          borderColor='#D0B3FF'
        />
        <Button
          onPress={onConfirm}
          title="Yes, Cancel"
          width="48%"
          marginTop={0}
        />
      </View>
    </View>
  );
};

export default CancelSessionContent;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  main: {
    alignItems: 'center',
    paddingTop: normalize(16),
    paddingHorizontal: normalize(16),
  },
  icon: {
    width: normalize(80),
    height: normalize(80),
    resizeMode: 'contain',
    marginTop: normalize(8),
    marginBottom: normalize(18),
  },
  title: {
    fontSize: normalize(13),
    fontFamily: Fonts.Inter_Medium,
    color: Colors.night_blue,
    textAlign: 'center',
    marginBottom: normalize(15),
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: Colors.snow_drift,
    padding: normalize(10),
    marginHorizontal: normalize(15),
    marginBottom: normalize(30),
    borderRadius: normalize(10),
    borderColor: '#F6F6F6',
    borderWidth: normalize(1),
  },
  info: {
    justifyContent: 'center',
    alignItems: 'center',
    height: normalize(30),
    width: normalize(30),
    marginRight: normalize(8),
    backgroundColor: Colors.white,
    borderRadius: normalize(8),
    borderColor: '#F6F6F6',
    borderWidth: normalize(1),
  },
  infoIcon: {
    width: normalize(15),
    height: normalize(15),
  },
  infoText: {
    flex: 1,
    fontFamily: Fonts.Inter_Regular,
    fontSize: normalize(isIos() ? 9 : 8.5),
    color: Colors.dark_grey,
    lineHeight: normalize(15),
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.snow_drift,
    paddingVertical: normalize(16),
    paddingHorizontal: normalize(12),
    width: '100%',
    borderBottomLeftRadius: normalize(20),
    borderBottomRightRadius: normalize(20),
  },
});

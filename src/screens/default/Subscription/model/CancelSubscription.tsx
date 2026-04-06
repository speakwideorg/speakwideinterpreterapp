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
        <Image source={Images.cancel} style={styles.icon} />
        <Text style={styles.title}>
          {'We sorry to see you go!\nplease confirm cancellation'}
        </Text>
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
          borderColor="#D0B3FF"
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
    width: normalize(95),
    height: normalize(95),
    resizeMode: 'contain',
    marginTop: normalize(8),
  },
  title: {
    fontSize: normalize(13),
    fontFamily: Fonts.Inter_Medium,
    color: Colors.night_blue,
    textAlign: 'center',
    marginBottom: normalize(20),
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

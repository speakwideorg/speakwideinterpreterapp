import { Colors, Icons } from '@app/themes';
import { normalize } from '@app/utils/orientation';
import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Image, StyleProp, ViewStyle } from 'react-native';

interface CustomCheckboxProps {
  label?: string;
  checked: boolean;
  onChange: () => void;
  style?: StyleProp<ViewStyle>
  backgroundColor?: string
}

export const Checkbox: React.FC<CustomCheckboxProps> = ({
  label,
  checked,
  onChange,
  style,
  backgroundColor = Colors.night_blue
}) => {
  return (
    <TouchableOpacity
      onPress={() => onChange()}
      activeOpacity={0.7}
      style={[
        styles.termsTouch,
        style,
        checked && { backgroundColor },
      ]}
    >
      {checked && <Image source={Icons.check} style={styles.check} />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  termsTouch: {
    borderWidth: normalize(1),
    height: normalize(16),
    width: normalize(16),
    borderColor: Colors.night_blue,
    borderRadius: normalize(3),
    justifyContent: 'center',
    alignItems: 'center',
  },
  check: {
    height: normalize(9),
    width: normalize(9),
    tintColor: Colors.white,
  },
});

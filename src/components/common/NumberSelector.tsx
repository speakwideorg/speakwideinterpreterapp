import { Colors, Fonts, Icons } from '@app/themes';
import {
  horizontalScale,
  moderateScale,
  normalize,
} from '@app/utils/orientation';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  StyleProp,
  ViewStyle,
} from 'react-native';

interface NumberSelectorProps {
  value: string;
  onChange: (value: string) => void;
  min?: number;
  max?: number;
  unit?: string;
  width?: string | number;
  height?: number;
  backgroundColor?: string;
  marginVertical?: number;
  placeholderColor?: string;
  textColor?: string;
  marginRight?: number
}

export const NumberSelector: React.FC<NumberSelectorProps> = ({
  value = '0',
  onChange,
  min = 0,
  max = 60,
  unit = '',
  width = '30%',
  height = normalize(46),
  backgroundColor = Colors.white_lilae,
  marginVertical = moderateScale(7),
  placeholderColor = Colors.dust,
  textColor = Colors.black,
  marginRight
}) => {
  const numericValue = value === '' ? NaN : parseInt(value, 10);

  const increase = () => {
    if (isNaN(numericValue)) {
      onChange('1');
    } else if (numericValue < max) {
      onChange(String(numericValue + 1));
    }
  };

  const decrease = () => {
    if (isNaN(numericValue) || numericValue === 0) {
      onChange('');
    } else if (numericValue > min) {
      onChange(String(numericValue - 1));
    }
  };

  const containerStyle: StyleProp<ViewStyle | any> = {
    width: typeof width === 'number' ? width : `${width}`,
    height,
    backgroundColor,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: normalize(1.5),
    borderColor: Colors.white_chalk,
    borderRadius: moderateScale(12),
    paddingHorizontal: horizontalScale(15),
    marginVertical,
    marginRight
  };

  return (
    <View style={containerStyle}>
      <Text
        style={[
          styles.valueText,
          { color: value === '' ? placeholderColor : textColor },
        ]}
      >
        {value} {unit}
      </Text>

      <View style={styles.buttons}>
        <TouchableOpacity onPress={increase} style={[styles.iconBtn, { justifyContent: 'flex-end' }]}>
          <Image
            source={Icons.right_arrow}
            style={styles.arrowUp}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={decrease} style={styles.iconBtn}>
          <Image
            source={Icons.right_arrow}
            style={styles.arrowDown}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  valueText: {
    fontSize: normalize(12),
    fontFamily: Fonts.Inter_Regular,
    width: '66%'
  },
  buttons: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBtn: {
    height: normalize(18),
    width: normalize(22),
    alignItems: 'flex-end',
  },
  arrowUp: {
    height: normalize(10),
    width: normalize(10),
    transform: [{ rotate: '-90deg' }],
    marginVertical: normalize(1),
    resizeMode: 'contain',
  },
  arrowDown: {
    height: normalize(10),
    width: normalize(10),
    transform: [{ rotate: '90deg' }],
    marginVertical: normalize(1),
    resizeMode: 'contain',
  },
});

import { Colors, Fonts } from '@app/themes';
import { normalize } from '@app/utils/orientation';
import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';

interface CustomRadioButtonProps {
  label: string;
  selected: boolean;
  onSelect: () => void;
}

export const RadioButton: React.FC<CustomRadioButtonProps> = ({
  label,
  selected,
  onSelect,
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onSelect}
      activeOpacity={0.7}
    >
      <View style={[styles.circle]}>
        {selected && <View style={styles.innerCircle} />}
      </View>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: normalize(5),
    marginRight: normalize(10)
  },
  circle: {
    width: normalize(16),
    height: normalize(16),
    borderRadius: normalize(16),
    borderWidth: normalize(1),
    borderColor: '#969696',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCircle: {
    width: normalize(8),
    height: normalize(8),
    borderRadius: normalize(8),
    backgroundColor: Colors.purple,
  },
  label: {
    marginLeft: normalize(8),
    fontSize: normalize(12),
    fontFamily: Fonts.Inter_Regular,
    color: '#383838'
  },
});

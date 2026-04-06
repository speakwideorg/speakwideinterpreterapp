import { View, Text, TouchableOpacity, Image, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';
import React, { FC } from 'react';
import { Colors, Fonts } from '@app/themes';
import { normalize } from '@app/utils/orientation';

type MenuOptionsProps = {
  title: string;
  icon?: any;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>
};

const MenuOptions: FC<MenuOptionsProps> = ({ icon, onPress, title,style,textStyle }) => {
  return (
    <TouchableOpacity
      style={[styles.menuItem,style]}
      onPress={() => {
        if (onPress) {
          onPress();
        }
      }}
    >
      {icon && <Image source={icon} style={styles.menuItemIcon} />}
      <Text style={[styles.title,textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};

export default MenuOptions;

const styles = StyleSheet.create({
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: normalize(6),
    paddingHorizontal: normalize(4),
  },
  menuItemIcon: {
    height: normalize(14),
    width: normalize(14),
    resizeMode: 'contain',
    marginRight: normalize(10),
  },
  title: {
    fontFamily: Fonts.Inter_Medium,
    color: Colors.night_blue,
    fontSize: normalize(10),
  },
});

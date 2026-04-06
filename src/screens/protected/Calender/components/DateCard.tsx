import React, { memo, useMemo } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { normalize } from '@app/utils/orientation';
import { Colors, Fonts } from '@app/themes';

interface IDateCard {
  cardDetails: {
    day: string;
    date: string | number;
    fullDate: string;
  };
  cardIndex: number;
  onPress: (res: string) => void;
  isSelected: boolean;
}

const DateCard = ({ cardDetails, onPress, isSelected }: IDateCard) => {
  const { day, date, fullDate } = cardDetails || {};

  const containerStyle = useMemo(
    () => [styles.dateCard, isSelected && styles.dateCardSelected],
    [isSelected],
  );

  const dayTextStyle = useMemo(
    () => [styles.dayUnselectedText, isSelected && styles.daySelectedText],
    [isSelected],
  );

  const dateTextStyle = useMemo(
    () => [styles.dateUnselectedText, isSelected && styles.dateSelectedText],
    [isSelected],
  );

  return (
    <Pressable onPress={() => onPress(fullDate)} style={containerStyle}>
      <Text style={dayTextStyle}>{day?.slice(0, 3)}</Text>
      <Text style={dateTextStyle}>{date}</Text>
    </Pressable>
  );
};

export default memo(DateCard);

const styles = StyleSheet.create({
  dateCard: {
    height: normalize(63),
    width: normalize(52),
    borderRadius: normalize(9),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.9,
    borderColor: Colors.light_violet,
    backgroundColor: 'transparent',
  },
  dateCardSelected: {
    borderColor: Colors.light_purple,
    backgroundColor: Colors.white,
  },
  dayUnselectedText: {
    fontSize: normalize(12),
    color: Colors.davys_Grey,
    fontFamily: Fonts.Inter_Regular,
  },
  daySelectedText: {
    color: Colors.night_blue,
  },
  dateUnselectedText: {
    marginTop: normalize(1),
    fontSize: normalize(15),
    color: Colors.night_blue,
    fontFamily: Fonts.Inter_SemiBold,
  },
  dateSelectedText: {
    color: Colors.purple,
  },
});

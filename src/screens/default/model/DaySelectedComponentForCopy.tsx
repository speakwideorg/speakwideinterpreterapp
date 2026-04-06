import { View, Text, StyleSheet, Pressable } from 'react-native';
import React, { useState } from 'react';
import { Colors, Fonts } from '@app/themes';
import { normalize } from '@app/utils/orientation';
import { Checkbox } from '@app/components/common/Checkbox';

interface IComponent {
  daysItem: string;
  daysIndex: number;
  handleCopySelectedDays: (index: number, checked: boolean) => void;
}

export default function DaySelectedComponentForCopy({
  daysItem,
  daysIndex,
  handleCopySelectedDays,
}: IComponent) {
  const [isDaySelected, setIsDaySelected] = useState(false);

  const toggleDay = () => {
    const newChecked = !isDaySelected;
    setIsDaySelected(newChecked);
    handleCopySelectedDays(daysIndex, newChecked); // send both index & checked state
  };

  return (
    <View key={daysIndex} style={styles.dayRow}>
      <Checkbox
        checked={isDaySelected}
        onChange={toggleDay}
        style={{
          height: normalize(13),
          width: normalize(13),
          borderRadius: normalize(2),
        }}
      />
      <Pressable onPress={toggleDay}>
        <Text style={styles.day}>{daysItem}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  dayModalSection: {
    paddingVertical: normalize(13),
    width: normalize(130),
    backgroundColor: Colors.white,
    position: 'absolute',
    right: normalize(14),
    top: normalize(18),
    zIndex: 1,
    borderRadius: normalize(7),
    shadowColor: '#8A91AD',
    shadowOffset: {
      width: -1,
      height: 2,
    },
    shadowOpacity: 0.5,
    shadowRadius: 2.5,
    elevation: 5,
  },
  copyhour: {
    // height: normalize(25),
    width: '100%',
    // justifyContent: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: normalize(10),
    borderBottomColor: Colors.platinum,
    borderBottomWidth: 1.8,
    paddingBottom: normalize(10),
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayRow: {
    flexDirection: 'row',
    marginTop: normalize(14),
    paddingHorizontal: normalize(10),
  },
  image: {
    height: '100%',
    width: '100%',
    resizeMode: 'cover',
  },
  day: {
    fontSize: normalize(11),
    color: Colors.night_blue,
    fontFamily: Fonts.Inter_Medium,
    marginLeft: normalize(5),
  },
});

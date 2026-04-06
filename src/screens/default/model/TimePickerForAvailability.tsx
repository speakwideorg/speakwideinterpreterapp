import { Text, StyleSheet, Pressable } from 'react-native';
import React, { useState, useCallback, useMemo } from 'react';
import { normalize } from '@app/utils/orientation';
import { Colors, Fonts } from '@app/themes';
import DatePicker from 'react-native-date-picker';
import moment from 'moment';

interface TimePickerForAvailabilityProps {
  onSelectTime: (time: string) => void;
  isFocus: boolean;
  isClicked: (clicked: boolean) => void;
  selectTime: string;
}

export default function TimePickerForAvailability({
  onSelectTime,
  isFocus,
  isClicked,
  selectTime,
}: TimePickerForAvailabilityProps) {
  const [dateVal, setDateVal] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState(
    selectTime ? selectTime : '',
  );
  const [showPicker, setShowPicker] = useState(false);

  const displayTime = useMemo(
    () => (selectedTime === '' ? 'Select time' : selectedTime),
    [selectedTime],
  );

  const handleOpenPicker = useCallback(() => {
    setShowPicker(true);
    isClicked(true);
  }, [isClicked]);

  const handleConfirmDate = useCallback(
    (date: Date) => {
      setDateVal(date);
      const formattedTime = moment(date).format('hh:mm A'); //  12-hour format
      setSelectedTime(formattedTime);
      onSelectTime(formattedTime);
      setShowPicker(false);
    },
    [onSelectTime],
  );

  const handleCancelDate = useCallback(() => {
    setShowPicker(false);
  }, []);

  return (
    <>
      <Pressable
        onPress={handleOpenPicker}
        style={[styles.timePickerBox, isFocus && styles.timePickerBoxOnFocus]}
      >
        <Text style={styles.time} numberOfLines={1}>
          {displayTime}
        </Text>
      </Pressable>

      <DatePicker
        modal
        open={showPicker}
        date={dateVal}
        onConfirm={handleConfirmDate}
        onCancel={handleCancelDate}
        mode="time"
        locale="en_US"
        is24hourSource="locale"
      />
    </>
  );
}

const styles = StyleSheet.create({
  timePickerBox: {
    height: normalize(30),
    minWidth: normalize(70),
    paddingHorizontal: normalize(4),
    borderRadius: normalize(8),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: normalize(1),
    borderColor: Colors.white_chalk,
  },
  timePickerBoxOnFocus: {
    borderWidth: normalize(0),
    backgroundColor: Colors.lavender,
  },
  time: {
    fontSize: normalize(10),
    color: Colors.night_blue,
    fontFamily: Fonts.Inter_Medium,
  },
});

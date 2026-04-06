/* eslint-disable react-hooks/exhaustive-deps */
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import React, { useState, useCallback, useMemo } from 'react';
import { normalize } from '@app/utils/orientation';
import { Colors, Fonts, Icons } from '@app/themes';
import Button from '@app/components/common/Button';
import { Checkbox } from '@app/components/common/Checkbox';
import DaySelectedComponentForCopy from './DaySelectedComponentForCopy';
import Picker from '@app/components/common/Picker';
import TimePickerForAvailability from './TimePickerForAvailability';
import moment from 'moment';

interface AvailabilitySlot {
  startTime: string;
  endTime: string;
}

interface DayAvailability {
  isChecked: boolean;
  day: string;
  count: number;
  availability: AvailabilitySlot[];
  isSelected?: boolean; // Added to track selection state
}

interface IAvailabilitySelectedComponent {
  availabilityDetails: DayAvailability;
  availabilityIndex: number;
  clickedCopyIconIDX: string | null;
  setClickedCopyIconIDX: (id: string | null) => void;
  focusTimePickerIndex: string | null;
  setFocusTimePickerIndex: (id: string | null) => void;
  dayArr: DayAvailability[];
  setDayArr: React.Dispatch<React.SetStateAction<DayAvailability[]>>;
  handleSelectedDays: (index: number, isSelected: boolean) => void;
}

const DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export default function AvailabilitySelectedComponent({
  availabilityDetails,
  availabilityIndex,
  clickedCopyIconIDX,
  setClickedCopyIconIDX,
  focusTimePickerIndex,
  setFocusTimePickerIndex,
  dayArr,
  setDayArr,
  handleSelectedDays,
}: IAvailabilitySelectedComponent) {
  const [copyDays, setCopyDays] = useState<number[]>([]);

  // Use isChecked as the primary source of truth for checkbox state
  const isDaySelected = useMemo(
    () => availabilityDetails.isChecked,
    [availabilityDetails.isChecked],
  );

  const availabilityLength = useMemo(
    () => availabilityDetails.availability.length,
    [availabilityDetails.availability],
  );

  // Clear copy modal when clicking outside
  const clearCopyModal = useCallback(() => {
    setClickedCopyIconIDX(null);
    setCopyDays([]);
  }, [setClickedCopyIconIDX]);

  const onClickCopy = useCallback(
    (idx?: number) => {
      const newId = idx !== undefined ? `${availabilityIndex}_${idx}` : null;
      if (clickedCopyIconIDX === newId) {
        clearCopyModal();
      } else {
        setClickedCopyIconIDX(newId);
        setCopyDays([]); // Reset copy days when opening new modal
      }
    },
    [
      availabilityIndex,
      clickedCopyIconIDX,
      setClickedCopyIconIDX,
      clearCopyModal,
    ],
  );

  const handleCopySlots = useCallback(() => {
    if (!clickedCopyIconIDX || copyDays.length === 0) {
      console.warn('No copy source or target days selected');
      return;
    }

    const [sourceDayStr, sourceSlotStr] = clickedCopyIconIDX.split('_');
    const sourceDayIndex = Number(sourceDayStr);
    const sourceSlotIndex = Number(sourceSlotStr);

    // Validate indices
    if (
      isNaN(sourceDayIndex) ||
      isNaN(sourceSlotIndex) ||
      sourceDayIndex < 0 ||
      sourceDayIndex >= dayArr.length
    ) {
      console.error('Invalid source indices');
      return;
    }

    const sourceDay = dayArr[sourceDayIndex];
    const sourceSlot = sourceDay?.availability[sourceSlotIndex];

    if (!sourceSlot) {
      console.error('Source slot not found');
      return;
    }

    const newData = dayArr.map((day, dayIndex) => {
      if (copyDays.includes(dayIndex)) {
        const newAvailability = [...day.availability];

        //  Always append slot to the end
        newAvailability.push({
          startTime: sourceSlot.startTime,
          endTime: sourceSlot.endTime,
        });

        return { ...day, availability: newAvailability };
      }
      return day;
    });

    setDayArr(newData);
    clearCopyModal();
  }, [clickedCopyIconIDX, copyDays, dayArr, setDayArr, clearCopyModal]);

  const onPressAddIcon = useCallback(() => {
    setDayArr(prev =>
      prev.map((item, index) =>
        index === availabilityIndex
          ? {
              ...item,
              availability: [
                ...item.availability,
                { startTime: '', endTime: '' },
              ],
            }
          : item,
      ),
    );
  }, [availabilityIndex, setDayArr]);

  const onPressDeleteIcon = useCallback(
    (slotIndex: number) => {
      setDayArr(prev => {
        const newDayArr = prev.map((item, index) => {
          if (index === availabilityIndex) {
            const newAvailability = item.availability.filter(
              (_, i) => i !== slotIndex,
            );

            return {
              ...item,
              availability: newAvailability,
            };
          }
          return item;
        });
        return newDayArr;
      });
    },
    [availabilityIndex, setDayArr],
  );

  const handleCheckboxToggle = useCallback(() => {
    const newValue = !isDaySelected;

    // Update the dayArr directly to ensure isChecked is synced
    setDayArr(prev =>
      prev.map((item, index) =>
        index === availabilityIndex
          ? {
              ...item,
              isChecked: newValue,
              isSelected: newValue, // Keep both properties in sync
            }
          : item,
      ),
    );

    // Also call the handleSelectedDays callback if needed for parent component logic
    handleSelectedDays(availabilityIndex, newValue);
  }, [availabilityIndex, isDaySelected, setDayArr, handleSelectedDays]);

  const handleTimePickerFocus = useCallback(
    (slotIndex: number, type: 'startTime' | 'endTime') => {
      const focusId = `${availabilityIndex}_${slotIndex}_${type}`;
      setFocusTimePickerIndex(focusId);
    },
    [availabilityIndex, setFocusTimePickerIndex],
  );

  const handleTimeSelect = useCallback(
    (slotIndex: number, type: 'startTime' | 'endTime', time: string) => {
      setDayArr(prev =>
        prev.map((item, i) =>
          i === availabilityIndex
            ? {
                ...item,
                availability: item.availability.map((slot, j) =>
                  j === slotIndex
                    ? {
                        ...slot,
                        [type]: time,
                      }
                    : slot,
                ),
              }
            : item,
        ),
      );
    },
    [availabilityIndex, setDayArr],
  );

  const handleCopySelectedDays = useCallback(
    (index: number, checked: boolean) => {
      setCopyDays(prev =>
        checked ? [...prev, index] : prev.filter(i => i !== index),
      );
    },
    [setCopyDays],
  );

  const renderTimeSlot = useCallback(
    ({ item: slot, index }: { item: AvailabilitySlot; index: number }) => {
      console.log('slot is==>', slot);
      const to12Hour = (time?: string) => {
        if (!time) return '';

        // Try 12-hour first, then 24-hour
        const m = moment(time, 'hh:mm A', true).isValid()
          ? moment(time, 'hh:mm A')
          : moment(time, 'HH:mm', true);

        return m.isValid() ? m.format('hh:mm A') : '';
      };
      const slotId = `${availabilityIndex}_${index}`;
      const isStartTimeFocused = focusTimePickerIndex === `${slotId}_startTime`;
      const isEndTimeFocused = focusTimePickerIndex === `${slotId}_endTime`;
      const isCopyModalVisible = clickedCopyIconIDX === slotId;
      const isLastSlot = index === availabilityLength - 1;

      return (
        <View style={styles.section}>
          <View
            style={[
              styles.timeSlotContainer,
              index === 0 && styles.firstTimeSlot,
            ]}
          >
            <TimePickerForAvailability
              isFocus={isStartTimeFocused}
              isClicked={() => handleTimePickerFocus(index, 'startTime')}
              onSelectTime={(time: string) =>
                handleTimeSelect(index, 'startTime', time)
              }
              selectTime={to12Hour(slot.startTime)}
            />
            <View style={styles.timePickerSeparator} />
            <TimePickerForAvailability
              isFocus={isEndTimeFocused}
              isClicked={() => handleTimePickerFocus(index, 'endTime')}
              onSelectTime={(time: string) =>
                handleTimeSelect(index, 'endTime', time)
              }
              selectTime={to12Hour(slot.endTime)}
            />
          </View>

          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              onPress={() => onPressDeleteIcon(index)}
              style={styles.iconButton}
            >
              <Image
                source={Icons.delete}
                style={[styles.icon, { tintColor: Colors.ogre_Odor }]}
              />
            </TouchableOpacity>

            {isLastSlot && (
              <TouchableOpacity
                onPress={onPressAddIcon}
                style={styles.iconButton}
              >
                <Image source={Icons.add_circle} style={styles.icon} />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={() => onClickCopy(index)}
              style={styles.iconButton}
            >
              <Image source={Icons.copy_outline} style={styles.icon} />
            </TouchableOpacity>
          </View>

          <Picker visible={isCopyModalVisible} onClose={clearCopyModal}>
            <View style={styles.copyHeader}>
              <Text style={styles.copyHeaderText}>Copy hours to..</Text>
            </View>
            {DAYS.map(
              (day, dayIndex) =>
                dayIndex !== availabilityIndex && (
                  <DaySelectedComponentForCopy
                    key={`copy-day-${dayIndex}`}
                    daysItem={day}
                    daysIndex={dayIndex}
                    handleCopySelectedDays={handleCopySelectedDays}
                    // isChecked={copyDays.includes(dayIndex)}
                  />
                ),
            )}
            <View style={styles.applyButtonContainer}>
              <Button
                title="Apply"
                onPress={handleCopySlots}
                width={'95%'}
                marginTop={normalize(20)}
                angle={90}
                borderColor={Colors.light_violet}
                disabled={copyDays.length === 0}
              />
            </View>
          </Picker>
        </View>
      );
    },
    [
      availabilityIndex,
      availabilityLength,
      clickedCopyIconIDX,
      focusTimePickerIndex,
      handleTimePickerFocus,
      handleTimeSelect,
      onClickCopy,
      onPressAddIcon,
      onPressDeleteIcon,
      clearCopyModal,
      handleCopySlots,
      handleCopySelectedDays,
      copyDays,
    ],
  );

  const renderEmptyComponent = useCallback(
    () => (
      <View style={styles.unavailableContainer}>
        <Text style={styles.day}>Unavailable</Text>
        <TouchableOpacity onPress={onPressAddIcon} style={styles.iconButton}>
          <Image source={Icons.add_circle} style={styles.icon} />
        </TouchableOpacity>
      </View>
    ),
    [onPressAddIcon],
  );

  const handleContainerPress = useCallback(() => {
    clearCopyModal();
    setFocusTimePickerIndex(null);
  }, [clearCopyModal, setFocusTimePickerIndex]);

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={1}
      onPress={handleContainerPress}
    >
      <View style={styles.dayHeader}>
        <Checkbox
          checked={isDaySelected}
          onChange={handleCheckboxToggle}
          style={styles.checkbox}
        />
        <Text style={styles.day}>{availabilityDetails.day.slice(0, 3)}</Text>
      </View>

      <View style={styles.timeSlotsContainer}>
        <FlatList
          data={availabilityDetails.availability}
          renderItem={renderTimeSlot}
          ListEmptyComponent={renderEmptyComponent}
          keyExtractor={(item, index) =>
            `slot-${availabilityIndex}-${index}-${item.startTime}-${item.endTime}`
          }
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
          extraData={availabilityDetails.availability.length}
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayHeader: {
    flexDirection: 'row',
    marginTop: normalize(7),
  },
  timeSlotsContainer: {
    flex: 1,
    marginLeft: normalize(10),
  },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: normalize(4),
  },
  timeSlotContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  firstTimeSlot: {
    marginTop: 0,
  },
  timePickerSeparator: {
    height: normalize(1),
    width: normalize(5),
    backgroundColor: Colors.night_blue,
    marginHorizontal: normalize(8),
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-between',
    marginLeft: normalize(8),
  },
  iconButton: {
    height: normalize(18),
    width: normalize(18),
  },
  icon: {
    height: '100%',
    width: '100%',
    resizeMode: 'cover',
  },
  checkbox: {
    height: normalize(14),
    width: normalize(14),
    borderRadius: normalize(2),
  },
  day: {
    fontSize: normalize(12),
    color: Colors.night_blue,
    fontFamily: Fonts.Inter_Medium,
    marginLeft: normalize(5),
  },
  copyHeader: {
    width: '100%',
    paddingHorizontal: normalize(10),
    borderBottomColor: Colors.platinum,
    borderBottomWidth: 1.8,
    paddingBottom: normalize(10),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  copyHeaderText: {
    fontSize: normalize(12),
    color: Colors.night_blue,
    fontFamily: Fonts.Inter_Medium,
  },
  applyButtonContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: normalize(10),
  },
  unavailableContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginLeft: normalize(8),
    marginTop: normalize(7),
  },
});

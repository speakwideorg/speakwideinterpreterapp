import {
  View,
  Text,
  ImageBackground,
  Image,
  StyleSheet,
  Pressable,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Button from '@app/components/common/Button';
import { normalize } from '@app/utils/orientation';
import KeyboardAvoidingTemplate from '@app/components/template/KeyboardAvoidingTemplate';
import MyStatusBar from '@app/utils/helpers/MyStatusBar';
import { Colors, Fonts, Icons, Images } from '@app/themes';
import moment from 'moment';
import DatePicker from 'react-native-date-picker';
import AvailabilitySelectedComponent from '@app/screens/default/model/AvailabilitySelectedComponent';
import { useAppDispatch, useAppSelector } from '@app/store';
import { logoutRequest } from '@app/store/slice/auth.slice';
import { showMessage } from '@app/utils/helpers/Toast';
import { useIsFocused } from '@react-navigation/native';
import ExitAppModal from '@app/components/template/ExitPopup';
import {
  resetUserDefaults,
  setupAvailibilityRequest,
} from '@app/store/slice/user.slice';

type AvailabilitySlot = {
  startTime: string;
  endTime: string;
};

type DayAvailability = {
  isChecked: boolean;
  day: string;
  count: number;
  availability: AvailabilitySlot[];
};

const AvailabilitySetup = () => {
  const dispatch = useAppDispatch();
  const isFocused = useIsFocused();
  const currentDate = useMemo(() => moment(), []);
  const currentMonth = useMemo(() => currentDate.format('MMM'), [currentDate]);
  const currentYear = useMemo(() => currentDate.format('YYYY'), [currentDate]);

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [dateVal, setDateVal] = useState<Date>(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [clickedCopyIconIDX, setClickedCopyIconIDX] = useState<string | null>(
    null,
  );
  const [_, setSelectedDay] = useState<number[]>([]);
  const [isExit, setIsExit] = useState(false);
  const [focusTimePickerIndex, setFocusTimePickerIndex] = useState<
    string | null
  >(null);
  const { status, isLoading } = useAppSelector(state => state.user);

  const initialDayArr: DayAvailability[] = useMemo(
    () => [
      {
        isChecked: false,
        day: 'Monday',
        count: 2,
        availability: [{ startTime: '', endTime: '' }],
      },
      { isChecked: false, day: 'Tuesday', count: 0, availability: [] },
      { isChecked: false, day: 'Wednesday', count: 3, availability: [] },
      { isChecked: false, day: 'Thursday', count: 1, availability: [] },
      { isChecked: false, day: 'Friday', count: 2, availability: [] },
      { isChecked: false, day: 'Saturday', count: 0, availability: [] },
      { isChecked: false, day: 'Sunday', count: 1, availability: [] },
    ],
    [],
  );

  const [dayArr, setDayArr] = useState<DayAvailability[]>(initialDayArr);

  const handleDateConfirm = useCallback((date: Date) => {
    const tempFullDate = moment(date).format('YYYY-MM-DD');
    const tempMonth = moment(tempFullDate).format('MMM');
    const tempYear = moment(tempFullDate).format('YYYY');

    setDateVal(date);
    setSelectedMonth(tempMonth);
    setSelectedYear(tempYear);
    setShowCalendar(false);
  }, []);

  const handleDateCancel = useCallback(() => {
    setShowCalendar(false);
  }, []);

  const handleOpenCalendar = useCallback(() => {
    setShowCalendar(true);
  }, []);

  const handleSelectedDays = useCallback((index: number, checked: boolean) => {
    setSelectedDay(prev =>
      checked ? [...prev, index] : prev.filter(i => i !== index),
    );
  }, []);

  const renderAvailabilityItem = useCallback(
    ({ item, index }: { item: DayAvailability; index: number }) => (
      <AvailabilitySelectedComponent
        availabilityDetails={item}
        availabilityIndex={index}
        clickedCopyIconIDX={clickedCopyIconIDX}
        setClickedCopyIconIDX={setClickedCopyIconIDX}
        focusTimePickerIndex={focusTimePickerIndex}
        setFocusTimePickerIndex={setFocusTimePickerIndex}
        dayArr={dayArr}
        setDayArr={setDayArr}
        handleSelectedDays={handleSelectedDays}
      />
    ),
    [clickedCopyIconIDX, focusTimePickerIndex, dayArr, handleSelectedDays],
  );

  const ItemSeparator = useCallback(
    () => <View style={styles.separator} />,
    [],
  );

  useEffect(() => {
    if (isFocused) {
      switch (status) {
        case 'user/setupAvailibilitySuccess': {
          dispatch(resetUserDefaults());
          break;
        }
        case 'user/setupAvailibilityFailure': {
          dispatch(resetUserDefaults());
          break;
        }
      }
    }
  }, [dispatch, isFocused, status]);

  const contentContainerStyle = useMemo(
    () => ({
      paddingBottom:
        clickedCopyIconIDX != null ? normalize(210) : normalize(70),
    }),
    [clickedCopyIconIDX],
  );

  const handleContinue = () => {
    let hasError = false;

    // Convert 12h ("06:30 PM") → 24h ("18:30")
    const to24Hour = (time: string) => {
      const m = moment(time, 'hh:mm A', true);
      return m.isValid() ? m.format('HH:mm') : '';
    };

    // Overlap check (always compare 24h values)
    const hasOverlappingSlots = (slots: AvailabilitySlot[]) => {
      const normalized = slots
        .map(slot => ({
          start: to24Hour(slot.startTime),
          end: to24Hour(slot.endTime),
        }))
        .filter(slot => slot.start && slot.end)
        .sort((a, b) => a.start.localeCompare(b.start));

      for (let i = 0; i < normalized.length - 1; i++) {
        if (normalized[i].end > normalized[i + 1].start) {
          return true;
        }
      }
      return false;
    };

    const weeklySchedule = dayArr.map(day => {
      if (day.isChecked) {
        if (
          !day.availability ||
          day.availability.length === 0 ||
          day.availability.some(slot => !slot.startTime || !slot.endTime)
        ) {
          showMessage(`Missing time slot for ${day.day}`);
          hasError = true;
        }

        if (hasOverlappingSlots(day.availability)) {
          showMessage(`Overlapping time slots for ${day.day}`);
          hasError = true;
        }

        return {
          day: day.day,
          offDay: false,
          slots: day.availability.map(slot => ({
            from: to24Hour(slot.startTime),
            to: to24Hour(slot.endTime),
          })),
        };
      }

      return {
        day: day.day,
        offDay: true,
        slots: [],
      };
    });

    if (hasError) return;

    const payload = {
      weeklySchedule,
    };

    // console.log('payload===>', payload);

    dispatch(setupAvailibilityRequest(payload));
  };

  return (
    <KeyboardAvoidingTemplate
      contentContainerStyle={styles.container}
      loaderEnable={isLoading}
    >
      <View style={styles.main}>
        <ImageBackground source={Images.background} style={styles.background}>
          <MyStatusBar
            backgroundColor={'transparent'}
            barStyle={'dark-content'}
            translucent
          />
          <View style={styles.v}>
            <View style={styles.logoRowContainer}>
              <Image source={Icons.logo} style={styles.logo} />
              <TouchableOpacity
                style={styles.exitContainer}
                onPress={() => {
                  setIsExit(true);
                }}
              >
                <Image
                  source={Icons.icon_exit}
                  style={styles.exit}
                  tintColor={Colors.purple}
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.title}>
              Set Up <Text style={styles.titleBold}>Your Availability</Text>
            </Text>
            <View style={styles.titleMonthSection}>
              <Text style={styles.dashboardTitle}>Select Month</Text>
              <Pressable
                onPress={handleOpenCalendar}
                style={styles.monthWithIcon}
              >
                <Text style={styles.dateMonthTitle}>
                  {selectedMonth} {selectedYear}
                </Text>
                <Image
                  source={Icons.arrow_drop_down}
                  style={styles.arrowDropIcon}
                />
              </Pressable>
            </View>
          </View>
          {isExit && (
            <ExitAppModal
              visible={isExit}
              onCancel={() => setIsExit(false)}
              onConfirm={() => {
                setIsExit(false);
                dispatch(logoutRequest({}));
              }}
            />
          )}
          {/* <View style={styles.headerContainer}>
            <Image source={Icons.logo} style={styles.logo} />
            <Text style={styles.title}>
              Set Up <Text style={styles.titleBold}>Your Availability</Text>
            </Text>

            <View style={styles.titleMonthSection}>
              <Text style={styles.dashboardTitle}>Calendar</Text>
              <Pressable
                onPress={handleOpenCalendar}
                style={styles.monthWithIcon}
              >
                <Text style={styles.dateMonthTitle}>
                  {selectedMonth} {selectedYear}
                </Text>
                <Image
                  source={Icons.arrow_drop_down}
                  style={styles.arrowDropIcon}
                />
              </Pressable>
            </View>
          </View> */}
        </ImageBackground>
        <View style={styles.v1}>
          <Image
            source={Images.backgroundHeader}
            style={styles.backgroundHeader}
          />
          <View style={styles.weeklyHoursButton}>
            <Button
              title="Weekly Hours"
              onPress={() => {}}
              disabled
              height={normalize(28)}
              width={normalize(110)}
              marginTop={0}
              borderRadius={normalize(20)}
              fontSize={normalize(11)}
              colors={['#8142E9', '#8142E9', '#C29DFF']}
              angle={180}
              borderColor={Colors.light_violet}
            />
          </View>
          <View style={styles.listContainer}>
            <FlatList
              data={dayArr}
              scrollEnabled={false}
              renderItem={renderAvailabilityItem}
              ItemSeparatorComponent={ItemSeparator}
              contentContainerStyle={contentContainerStyle}
              ListFooterComponent={
                <View style={styles.footer}>
                  <Button
                    title={'Continue'}
                    onPress={() => {
                      handleContinue();
                      // navigate('AddPaymentCard');
                    }}
                    width={'100%'}
                    marginTop={0}
                  />
                </View>
              }
              keyExtractor={(item, index) => `${item.day}-${index}`}
            />

            {showCalendar && (
              <DatePicker
                modal
                open={true}
                date={dateVal}
                onConfirm={handleDateConfirm}
                onCancel={handleDateCancel}
                mode="date"
                is24hourSource="locale"
              />
            )}
          </View>
        </View>
      </View>
    </KeyboardAvoidingTemplate>
  );
};

export default AvailabilitySetup;

const styles = StyleSheet.create({
  container: { paddingBottom: normalize(45) },
  main: { flex: 1, backgroundColor: Colors.white },
  background: { width: '100%', height: normalize(300), position: 'absolute' },
  v: { paddingHorizontal: normalize(15) },
  logoRowContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: normalize(40),
    alignItems: 'center',
    marginTop: normalize(30),
  },
  logo: {
    height: normalize(40),
    width: normalize(40),
    resizeMode: 'contain',
  },
  exitContainer: {
    width: normalize(25),
    height: normalize(25),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.hawkes_blue,
    borderRadius: normalize(25),
  },
  exit: {
    height: '70%',
    width: '70%',
    resizeMode: 'contain',
  },
  title: {
    fontSize: normalize(18),
    color: Colors.night_blue,
    fontFamily: Fonts.Manrope_Regular,
    marginTop: normalize(10),
  },
  v1: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: normalize(15),
    borderTopRightRadius: normalize(15),
    marginTop: normalize(235),
    alignItems: 'center',
    paddingTop: normalize(5),
  },
  flexContainer: { flex: 1 },
  headerContainer: {
    paddingHorizontal: normalize(15),
    paddingBottom: normalize(45),
  },

  // container: { paddingBottom: normalize(30) },
  // main: { flex: 1, backgroundColor: Colors.white },
  // background: {
  //   width: '100%',
  //   height: normalize(300),
  //   position: 'absolute',
  // },

  // logo: {
  //   height: normalize(35),
  //   width: normalize(35),
  //   marginTop: normalize(isIos() ? 10 : 26),
  //   borderRadius: normalize(40),
  //   justifyContent: 'center',
  //   alignItems: 'center',
  //   shadowColor: Colors.dark_grey,
  //   shadowOffset: { width: 0, height: 4 },
  //   shadowOpacity: 0.2,
  //   shadowRadius: 10,
  //   elevation: 4,
  //   resizeMode: 'cover',
  // },
  // title: {
  //   fontSize: normalize(18),
  //   color: Colors.night_blue,
  //   fontFamily: Fonts.Manrope_Regular,
  //   marginTop: normalize(10),
  // },
  titleBold: {
    fontFamily: Fonts.Manrope_SemiBold,
  },
  contentWrapper: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: normalize(15),
    borderTopRightRadius: normalize(15),
    paddingTop: normalize(5),
  },
  backgroundHeader: {
    width: '100%',
    height: normalize(50),
    resizeMode: 'contain',
    top: normalize(-12),
    position: 'absolute',
  },
  weeklyHoursButton: {
    position: 'absolute',
    top: -normalize(22),
    alignSelf: 'center',
  },
  listContainer: {
    paddingHorizontal: normalize(15),
    marginTop: normalize(25),
  },
  separator: {
    height: normalize(1),
    backgroundColor: Colors.platinum,
    width: '90%',
    marginVertical: normalize(20),
    alignSelf: 'center',
  },
  footer: {
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: normalize(50),
  },
  titleMonthSection: {
    flexDirection: 'row',
    marginTop: normalize(25),
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-between',
  },
  dashboardTitle: {
    fontFamily: Fonts.Inter_Medium,
    color: Colors.night_blue,
    fontSize: normalize(15),
  },
  monthWithIcon: {
    height: normalize(40),
    paddingHorizontal: normalize(12),
    borderRadius: normalize(8),
    backgroundColor: Colors.white,
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateMonthTitle: {
    fontFamily: Fonts.Inter_Medium,
    color: Colors.night_blue,
    fontSize: normalize(12),
  },
  arrowDropIcon: {
    height: normalize(10),
    width: normalize(10),
    resizeMode: 'contain',
    marginLeft: normalize(20),
  },
});

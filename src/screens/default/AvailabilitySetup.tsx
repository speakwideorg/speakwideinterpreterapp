/* eslint-disable react-hooks/exhaustive-deps */
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
import {
  profileDetailsRequest,
  resetAuthDefaults,
} from '@app/store/slice/auth.slice';
import { showMessage } from '@app/utils/helpers/Toast';
import { useIsFocused } from '@react-navigation/native';
import { isIos } from '@app/utils/helpers/Validation';
import { goBack, navigate } from '@app/navigation/RootNaivgation';
import { setupAvailibilityRequest } from '@app/store/slice/user.slice';

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

interface ProfileData {
  availability: {
    weeklySchedule: Array<{
      day: string;
      offDay: boolean;
      slots: Array<{
        from: string;
        to: string;
      }>;
    }>;
  };
}

const AvailabilitySetup = (props: any) => {
  let pageType = props?.route?.params?.type;

  const dispatch = useAppDispatch();
  const isFocused = useIsFocused();
  const profileDetails: ProfileData = useAppSelector(
    state => state.auth.profileDetailsResponse,
  );
  const { status, message, isLoading } = useAppSelector(state => state.auth);

  const fetchProfileDetails = () => {
    dispatch(profileDetailsRequest());
  };

  useEffect(() => {
    if (isFocused) {
      fetchProfileDetails();
    }
  }, [isFocused]);

  // ---------- Calendar setup ----------
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
  const [selectedDay, setSelectedDay] = useState<number[]>([]);
  const [focusTimePickerIndex, setFocusTimePickerIndex] = useState<
    string | null
  >(null);

  // ---------- Build DayAvailability from API ----------
  const [dayArr, setDayArr] = useState<DayAvailability[]>([]);

  useEffect(() => {
    if (profileDetails?.availability?.weeklySchedule) {
      const mapped = profileDetails.availability.weeklySchedule.map(day => ({
        day: day.day,
        isChecked: !day.offDay,
        count: day.slots?.length || 0,
        availability:
          day.slots?.map(slot => ({
            startTime: slot.from,
            endTime: slot.to,
          })) || [],
      }));
      setDayArr(mapped);
    }
  }, [profileDetails]);

  // ---------- Calendar handlers ----------
  const handleDateConfirm = useCallback((date: Date) => {
    const tempMonth = moment(date).format('MMM');
    const tempYear = moment(date).format('YYYY');

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

  // ---------- Render Items ----------
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

  const contentContainerStyle = useMemo(
    () => ({
      paddingBottom:
        clickedCopyIconIDX != null ? normalize(210) : normalize(70),
    }),
    [clickedCopyIconIDX],
  );

  useEffect(() => {
    if (isFocused) {
      switch (status) {
        case 'auth/setupAvailibilitySuccess': {
          goBack();
          showMessage(message);
          dispatch(resetAuthDefaults());
          dispatch(profileDetailsRequest());
          break;
        }
        case 'auth/setupAvailibilityFailure': {
          showMessage(message);
          dispatch(resetAuthDefaults());
          break;
        }
      }
    }
  }, [status]);

  // ---------- Submit ----------
  const handleContinue = () => {
    let hasError = false;

    const to24Hour = (time: string) => {
      if (!time) return '';

      // If already in 24-hour format (HH:mm)
      const is24Hour = moment(time, 'HH:mm', true).isValid();
      if (is24Hour) {
        return time;
      }

      // If in 12-hour format (hh:mm AM/PM)
      const m12 = moment(time, 'hh:mm A', true);
      if (m12.isValid()) {
        return m12.format('HH:mm');
      }

      return '';
    };

    const weeklySchedule = dayArr.map(day => {
      console.log('day is ===>', day);
      if (day.isChecked) {
        if (
          !day.availability ||
          day.availability.length === 0 ||
          day.availability.some(slot => !slot.startTime || !slot.endTime)
        ) {
          showMessage(`Missing time slot for ${day.day}`);
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
      } else {
        return {
          day: day.day,
          offDay: true,
          slots: [],
        };
      }
    });

    if (hasError) return;

    const payload = { weeklySchedule };

    console.log('payload is ===>', payload);
    dispatch(setupAvailibilityRequest(payload));
  };

  // ---------- UI ----------
  return (
    <View style={styles.flexContainer}>
      <ImageBackground source={Images.background} style={styles.background} />
      <MyStatusBar
        backgroundColor={'transparent'}
        barStyle={'dark-content'}
        translucent
      />
      <KeyboardAvoidingTemplate
        contentContainerStyle={styles.container}
        loaderEnable={isLoading}
      >
        <View style={styles.headerContainer}>
          {pageType === 'Update' && (
            <TouchableOpacity onPress={goBack} style={styles.backContainer}>
              <Image source={Icons.arrow_right} style={styles.arrow_right} />
            </TouchableOpacity>
          )}

          {pageType !== 'Update' && (
            <Image source={Icons.logo} style={styles.logo} />
          )}
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
        </View>

        <View style={styles.main}>
          <View style={styles.contentWrapper}>
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
                      onPress={handleContinue}
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
                />
              )}
            </View>
          </View>
        </View>
      </KeyboardAvoidingTemplate>
    </View>
  );
};

export default AvailabilitySetup;

const styles = StyleSheet.create({
  flexContainer: { flex: 1 },
  container: { paddingBottom: normalize(30) },
  main: { flex: 1, backgroundColor: Colors.white },
  background: {
    width: '100%',
    height: normalize(300),
    position: 'absolute',
  },
  headerContainer: {
    paddingHorizontal: normalize(15),
    paddingBottom: normalize(45),
  },
  logo: {
    height: normalize(35),
    width: normalize(35),
    marginTop: normalize(isIos() ? 10 : 26),
    borderRadius: normalize(40),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.dark_grey,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
    resizeMode: 'cover',
  },
  title: {
    fontSize: normalize(18),
    color: Colors.night_blue,
    fontFamily: Fonts.Manrope_Regular,
    marginTop: normalize(10),
  },
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
  backContainer: {
    height: normalize(35),
    width: normalize(35),
    marginTop: normalize(isIos() ? 10 : 26),
    backgroundColor: Colors.white,
    borderRadius: normalize(40),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.dark_grey,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  arrow_right: {
    height: normalize(22),
    width: normalize(22),
    resizeMode: 'contain',
  },
});

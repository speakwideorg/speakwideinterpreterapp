/* eslint-disable react-hooks/exhaustive-deps */
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { normalize } from '@app/utils/orientation';
import { Colors, Fonts, Icons } from '@app/themes';
import DateCard from '../components/DateCard';
import moment from 'moment';
import DatePicker from 'react-native-date-picker';
import RNCalendarEvents from 'react-native-calendar-events';
import { useIsFocused } from '@react-navigation/native';
import { getInterpreterAllSecheduledRequest } from '@app/store/slice/interpreterSession.slice';
import { useAppDispatch, useAppSelector } from '@app/store';
import { showMessage } from '@app/utils/helpers/Toast';
/* ================= CALENDAR PERMISSION ================= */
const requestPermission = async () => {
  await RNCalendarEvents.requestPermissions();
};

export default function DatesCardComponent({
  onChangeDate,
}: {
  onChangeDate: (date: string) => void;
}) {
  const dateListRef = useRef<FlatList>(null);
  const isFocused = useIsFocused();
  const dispatch = useAppDispatch();

  const today = moment().format('YYYY-MM-DD');
  const currentMonth = moment().format('MMM');
  const currentYear = moment().format('YYYY');

  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [monthDates, setMonthDates] = useState<any[]>([]);
  const [dateVal, setDateVal] = useState<Date>(new Date());
  const [showCalendar, setShowCalendar] = useState(false);

  const [syncedEventIds, setSyncedEventIds] = useState<Set<string>>(new Set());

  const sessionList = useAppSelector(
    state => state.interpreterSession.getSechudledSessionsResponse,
  );

  const [isSyncing, setIsSyncing] = useState(false);

  const CARD_WIDTH = normalize(52);
  const CARD_GAP = normalize(10);
  const ITEM_SIZE = CARD_WIDTH + CARD_GAP;

  function getMonthDatesWithDays(monthName: string, year: number | string) {
    const startOfMonth = moment(`${monthName} ${year}`, 'MMM YYYY').startOf(
      'month',
    );
    const daysInMonth = startOfMonth.daysInMonth();
    const result = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const date = moment(`${day} ${monthName} ${year}`, 'D MMM YYYY');
      result.push({
        day: date.format('dddd'),
        date: date.format('DD'),
        month: date.format('MM'),
        year: date.format('YYYY'),
        fullDate: date.format('YYYY-MM-DD'),
      });
    }
    setMonthDates(result);
  }

  /* ================= SYNC SINGLE SESSION ================= */
  const syncSessionToCalendar = async (session: any) => {
    try {
      const calendars = await RNCalendarEvents.findCalendars();
      console.log('calenders===>', calendars);
      const calendar = calendars.find(c => c.isPrimary) || calendars[0];
      if (!calendar) return null;

      const eventId = await RNCalendarEvents.saveEvent(
        `${session.language_one} → ${session.language_two}`,
        {
          startDate: moment(session.start_date_time).toISOString(),
          endDate: moment(session.end_date_time).toISOString(),
          location: session?.location ? session?.location : session?.format,
          notes: `Session ID: ${session._id}\nClient: ${session.client}`,
          calendarId: calendar.id,
        },
      );

      return eventId;
    } catch (e) {
      console.log('Sync error', e);
      return null;
    }
  };

  useEffect(() => {
    getMonthDatesWithDays(selectedMonth, selectedYear);
  }, []);

  /* ================= FETCH SESSIONS ================= */
  useEffect(() => {
    if (isFocused) {
      requestPermission();

      dispatch(
        getInterpreterAllSecheduledRequest({
          list_type: 'schedule',
          page: 1,
          limit: 100,
        }),
      );
    }
  }, [isFocused]);

  /* ================= SYNC ALL ================= */
  const syncAllSessionsForDate = async () => {
    setIsSyncing(true);
    try {
      for (const session of sessionList?.data?.docs || []) {
        if (!syncedEventIds.has(session._id)) {
          const eventId = await syncSessionToCalendar(session);
          if (eventId) {
            setSyncedEventIds(prev => new Set(prev).add(session._id));
          }
        }
      }
    } finally {
      showMessage('All sessions synced to calendar');
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    if (!monthDates.length) return;
    const index = monthDates.findIndex(d => d.fullDate === selectedDate);
    if (index < 0) return;

    setTimeout(() => {
      dateListRef.current?.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0.5,
      });
    }, 300);
  }, [selectedDate, monthDates]);

  return (
    <View style={styles.container}>
      <View style={styles.titleMonthSection}>
        <Text style={styles.dashboardTitle}>Calendar</Text>
        <Pressable
          onPress={() => setShowCalendar(true)}
          style={styles.monthWithIcon}
        >
          <Text style={styles.dateMonthTitle}>
            {selectedMonth} {selectedYear}
          </Text>
          <Image source={Icons.arrow_drop_down} style={styles.arrowDropIcon} />
        </Pressable>
      </View>
      <View style={styles.syncContainer}>
        <TouchableOpacity
          style={styles.syncButton}
          onPress={syncAllSessionsForDate}
          disabled={isSyncing}
        >
          <Image source={Icons.schedule} style={styles.syncIcon} />
          <Text style={styles.syncText}>
            {isSyncing ? 'Syncing...' : 'Sync Sessions to Calendar'}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={dateListRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: normalize(15) }}
        data={monthDates}
        keyExtractor={(item, index) => item.fullDate + index}
        renderItem={({ item, index }) => (
          <DateCard
            cardDetails={item}
            cardIndex={index}
            onPress={res => {
              onChangeDate(res);
              setSelectedDate(res);
            }}
            isSelected={selectedDate === item?.fullDate}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ width: CARD_GAP }} />}
        getItemLayout={(_, index) => ({
          length: ITEM_SIZE,
          offset: ITEM_SIZE * index,
          index,
        })}
        onScrollToIndexFailed={info => {
          dateListRef.current?.scrollToOffset({
            offset: info.averageItemLength * info.index,
            animated: true,
          });
        }}
      />

      {showCalendar && (
        <DatePicker
          modal
          open={true}
          date={dateVal}
          onConfirm={date => {
            const tempFullDate = moment(date).format('YYYY-MM-DD');
            const tempMonth = moment(tempFullDate).format('MMM');
            const tempYear = moment(tempFullDate).format('YYYY');

            onChangeDate(tempFullDate);
            getMonthDatesWithDays(tempMonth, tempYear);
            setSelectedDate(tempFullDate);
            setDateVal(date);
            setSelectedMonth(tempMonth);
            setSelectedYear(tempYear);
            setShowCalendar(false);
          }}
          onCancel={() => setShowCalendar(false)}
          mode="date"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: normalize(12),
  },
  dashboardTitle: {
    fontFamily: Fonts.Inter_Medium,
    color: Colors.night_blue,
    fontSize: normalize(20),
  },
  dateMonthTitle: {
    fontFamily: Fonts.Inter_Medium,
    color: Colors.night_blue,
    fontSize: normalize(14),
  },
  arrowDropIcon: {
    height: normalize(13),
    width: normalize(13),
    resizeMode: 'contain',
    marginLeft: normalize(13),
  },
  monthWithIcon: {
    height: normalize(30),
    paddingHorizontal: normalize(10),
    borderRadius: normalize(8),
    backgroundColor: Colors.white,
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: normalize(15),
  },
  titleMonthSection: {
    flexDirection: 'row',
    marginLeft: normalize(15),
    marginTop: normalize(5),
    marginBottom: normalize(10),
    alignItems: 'center',
  },
  syncContainer: {
    paddingHorizontal: normalize(15),
    marginBottom: normalize(10),
  },
  syncButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: Colors.purple,
    padding: normalize(12),
    borderRadius: normalize(25),
  },
  syncIcon: { width: 20, height: 20, tintColor: Colors.white, marginRight: 8 },
  syncText: { color: Colors.white, fontFamily: Fonts.Inter_Medium },
});

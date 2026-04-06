/* eslint-disable react-hooks/exhaustive-deps */
import React, { memo, useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Image,
  Dimensions,
  FlatList,
  Text,
} from 'react-native';
import moment from 'moment';
import RNCalendarEvents from 'react-native-calendar-events';
import { useIsFocused } from '@react-navigation/native';

import { Colors, Images, Fonts } from '@app/themes';
import { normalize } from '@app/utils/orientation';
import MyStatusBar from '@app/utils/helpers/MyStatusBar';
import Header from '@app/components/common/Header';
import DatesCardComponent from './model/DatesCardComponent';
import ScheduleCard from './components/ScheduleCard';
// import { transformCalendarData } from '@app/utils/helpers/transformCalendarData';
import { useAppDispatch, useAppSelector } from '@app/store';
import { getInterpreterListRequest } from '@app/store/slice/interpreterSession.slice';

const { width } = Dimensions.get('screen');

/* ================= CALENDAR PERMISSION ================= */
const requestPermission = async () => {
  await RNCalendarEvents.requestPermissions();
};
/* ====================================================== */

const Calender = () => {
  const isFocused = useIsFocused();
  const dispatch = useAppDispatch();

  const today = useMemo(() => moment().format('YYYY-MM-DD'), []);
  const [selectedDate, setSelectedDate] = useState(today);
  const [sessionData, setSessionData] = useState<any[]>([]);

  const sessionList = useAppSelector(
    state => state.interpreterSession.getInterpreterListResponse?.data,
  );

  /* ================= DATE CHANGE ================= */
  const handleDateChange = useCallback((date: string) => {
    setSelectedDate(date);
  }, []);

  /* ================= FETCH SESSIONS ================= */
  useEffect(() => {
    if (isFocused) {
      requestPermission();
      dispatch(
        getInterpreterListRequest({
          list_type: 'calender_list',
          page: 1,
          limit: 20,
          calender_date: selectedDate,
        }),
      );
    }
  }, [isFocused, selectedDate]);

  useEffect(() => {
    if (sessionList?.docs) {
      setSessionData(sessionList.docs);
    }
  }, [sessionList]);

  /* ================= SYNC SINGLE SESSION ================= */
  // const syncSessionToCalendar = async (session: any) => {
  //   try {
  //     const calendars = await RNCalendarEvents.findCalendars();
  //     const calendar = calendars.find(c => c.isPrimary) || calendars[0];
  //     if (!calendar) return null;

  //     const eventId = await RNCalendarEvents.saveEvent(
  //       `${session.language_one} → ${session.language_two}`,
  //       {
  //         startDate: moment(session.start_date_time).toISOString(),
  //         endDate: moment(session.end_date_time).toISOString(),
  //         location: 'Online',
  //         notes: `Session ID: ${session._id}\nClient: ${session.client}`,
  //         calendarId: calendar.id,
  //       },
  //     );

  //     return eventId;
  //   } catch (e) {
  //     console.log('Sync error', e);
  //     return null;
  //   }
  // };

  /* ================= TOGGLE SYNC ================= */
  // const toggleSessionSync = async (session: any) => {
  //   const sessionId = session._id;
  //   if (!sessionId) return;

  //   if (syncedEventIds.has(sessionId)) {
  //     const events = await RNCalendarEvents.fetchAllEvents(
  //       moment(selectedDate).startOf('day').toISOString(),
  //       moment(selectedDate).endOf('day').toISOString(),
  //     );

  //     const event = events.find(e =>
  //       e.notes?.includes(`Session ID: ${sessionId}`),
  //     );

  //     if (event) {
  //       await RNCalendarEvents.removeEvent(event.id);
  //       const copy = new Set(syncedEventIds);
  //       copy.delete(sessionId);
  //       setSyncedEventIds(copy);
  //     }
  //   } else {
  //     const eventId = await syncSessionToCalendar(session);
  //     if (eventId) {
  //       setSyncedEventIds(prev => new Set(prev).add(sessionId));
  //     }
  //   }
  // };

  /* ================= SYNC ALL ================= */
  // const syncAllSessionsForDate = async () => {
  //   setIsSyncing(true);
  //   try {
  //     for (const session of sessionData) {
  //       if (!syncedEventIds.has(session._id)) {
  //         const eventId = await syncSessionToCalendar(session);
  //         if (eventId) {
  //           setSyncedEventIds(prev => new Set(prev).add(session._id));
  //         }
  //       }
  //     }
  //   } finally {
  //     setIsSyncing(false);
  //   }
  // };

  /* ================= BUILD CALENDAR DATA ================= */
  // const getEvents = async () => {
  //   // const deviceEvents = await RNCalendarEvents.fetchAllEvents(
  //   //   moment(selectedDate).startOf('day').toISOString(),
  //   //   moment(selectedDate).endOf('day').toISOString(),
  //   // );

  //   // const formattedDeviceEvents = transformCalendarData(deviceEvents);

  //   const formattedSessions = sessionData.map(session => ({
  //     ...session,
  //     type: 'session',
  //     isSynced: syncedEventIds.has(session._id),
  //   }));

  //   setCalendarData([...formattedSessions]);

  //   // setCalendarData([...formattedDeviceEvents, ...formattedSessions]);
  // };

  // useEffect(() => {
  //   getEvents();
  // }, [selectedDate, sessionData, syncedEventIds]);

  /* ================= RENDER ================= */
  const renderItem = useCallback(
    ({ item }: { item: any }) => (
      <ScheduleCard
        details={item}
        isSession
        // isSynced={syncedEventIds.has(item._id)}
        // onSyncToggle={() => toggleSessionSync(item)}
      />
    ),
    [],
  );

  return (
    <View style={styles.container}>
      <Image source={Images.top_shape} style={styles.topShape} />
      <MyStatusBar translucent backgroundColor="transparent" />
      <Header />
      <DatesCardComponent onChangeDate={handleDateChange} />

      {/* <View style={styles.syncContainer}>
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
      </View> */}

      <FlatList
        data={sessionData}
        renderItem={renderItem}
        keyExtractor={(_, i) => i.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyLabel}>No Data Found</Text>
          </View>
        }
      />
    </View>
  );
};

export default memo(Calender);

/* ================= STYLES (UNCHANGED) ================= */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.ceramic },
  topShape: { height: normalize(340), width, position: 'absolute' },
  syncContainer: { paddingHorizontal: normalize(15), marginTop: normalize(10) },
  syncButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: Colors.purple,
    padding: normalize(12),
    borderRadius: normalize(25),
  },
  syncIcon: { width: 20, height: 20, tintColor: Colors.white, marginRight: 8 },
  syncText: { color: Colors.white, fontFamily: Fonts.Inter_Medium },
  listContent: { padding: normalize(15) },
  emptyContainer: { marginTop: 40, alignItems: 'center' },
  emptyLabel: { color: Colors.gray },
});

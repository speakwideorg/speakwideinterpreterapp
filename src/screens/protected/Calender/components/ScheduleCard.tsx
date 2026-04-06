/* eslint-disable react-hooks/exhaustive-deps */
import React, { memo, useState, useCallback } from 'react';
import { Image, StyleSheet, Text, View, Pressable } from 'react-native';
import moment from 'moment';

import { normalize } from '@app/utils/orientation';
import { Colors, Fonts, Icons } from '@app/themes';
import AlertModal from '@app/components/common/AlertModal';
import ScheduleDetailsModal from '../model/ScheduleDetailsModal';
// import { useAppDispatch } from '@app/store';
// import { acceptSessionRequest } from '@app/store/slice/interpreterSession.slice';

interface IScheduleCard {
  details: any;
  isSession?: boolean;
  isSynced?: boolean;
  onSyncToggle?: () => void;
}

/* ================= HELPERS ================= */
const formatTime = (date?: string) => (date ? moment(date).format('h:mm') : '');

const formatDuration = (start?: string, end?: string) => {
  if (!start || !end) return '';
  const mins = moment(end).diff(moment(start), 'minutes');
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  return `${m}m`;
};
/* =========================================== */

const ScheduleCard = ({ details, isSession = false }: IScheduleCard) => {
  const [isScheduleDetailsModal, setIsScheduleDetailsModal] = useState(false);

  const handleOpenModal = useCallback(() => {
    setIsScheduleDetailsModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsScheduleDetailsModal(false);
  }, []);

  const startTime = formatTime(details.start_date_time);
  const endTime = formatTime(details.end_date_time);

  const timeDisplay = startTime && endTime ? `${startTime} - ${endTime}` : '';

  const titleDisplay = details.client || 'Session';

  const subtitleDisplay = `${details.language_one || ''}${
    details.language_two ? ' - ' + details.language_two : ''
  }`;
  // const dispatch = useAppDispatch();

  return (
    <View style={styles.container}>
      <Text style={styles.time}>{timeDisplay}</Text>

      <View style={styles.cardContainer}>
        <Pressable
          style={[styles.scheduleDetailsBox, isSession && styles.sessionCard]}
          onPress={handleOpenModal}
        >
          <View style={styles.nameLangHrsSection}>
            <View style={styles.dotNameSection}>
              <Image source={Icons.themeDot} style={styles.dotIcon} />
              <View style={styles.nameLang}>
                <Text style={styles.name}>{titleDisplay}</Text>
                <Text style={styles.lang}>{subtitleDisplay}</Text>
              </View>
            </View>

            <Text style={styles.hr}>
              {formatDuration(details.start_date_time, details.end_date_time)}
            </Text>
          </View>

          <Text style={styles.zoomText}>{details?.format}</Text>
        </Pressable>
      </View>

      {isScheduleDetailsModal && (
        <AlertModal visible onClose={handleCloseModal} padding={0}>
          <ScheduleDetailsModal
            details={details}
            onCancel={handleCloseModal}
            // onConfirm={() =>
            //   dispatch(acceptSessionRequest({ id: details?._id }))
            // }
          />
        </AlertModal>
      )}
    </View>
  );
};

export default memo(ScheduleCard);

const styles = StyleSheet.create({
  container: {
    marginVertical: normalize(5),
    width: '100%',
    flexDirection: 'row',
  },
  cardContainer: {
    flex: 1,
  },
  time: {
    marginRight: normalize(15),
    fontSize: normalize(13),
    fontFamily: Fonts.Inter_Medium,
    color: Colors.purple,
    minWidth: normalize(80),
  },
  scheduleDetailsBox: {
    flex: 1,
    padding: normalize(10),
    borderWidth: 1.8,
    borderColor: Colors.pale_Lavender,
    borderRadius: normalize(15),
    backgroundColor: Colors.white,
    shadowColor: '#CDCAE3',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 2,
  },
  sessionCard: {
    borderColor: Colors.purple,
    borderWidth: 2,
  },
  nameLangHrsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  dotNameSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  dotIcon: {
    height: normalize(13),
    width: normalize(13),
    resizeMode: 'cover',
    marginTop: normalize(2),
  },
  nameLang: {
    marginLeft: normalize(10),
    flex: 1,
  },
  name: {
    fontSize: normalize(13),
    fontFamily: Fonts.Inter_SemiBold,
    color: Colors.night_blue,
  },
  lang: {
    marginTop: normalize(1),
    fontSize: normalize(12),
    fontFamily: Fonts.Inter_Regular,
    color: Colors.pinkest,
  },
  hr: {
    fontSize: normalize(13),
    fontFamily: Fonts.Inter_SemiBold,
    color: Colors.gray,
  },
  zoomText: {
    marginTop: normalize(10),
    marginLeft: normalize(25),
    fontSize: normalize(12),
    fontFamily: Fonts.Inter_Medium,
    color: Colors.purple,
  },
  sessionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: normalize(10),
  },
  sessionType: {
    fontSize: normalize(11),
    fontFamily: Fonts.Inter_Regular,
    color: Colors.dark_grey,
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.purple,
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(6),
    borderRadius: normalize(15),
  },
  syncedButton: {
    backgroundColor: Colors.green,
  },
  syncIcon: {
    width: normalize(12),
    height: normalize(12),
    tintColor: Colors.white,
    marginRight: normalize(4),
  },
  syncButtonText: {
    fontSize: normalize(11),
    fontFamily: Fonts.Inter_Medium,
    color: Colors.white,
  },
});

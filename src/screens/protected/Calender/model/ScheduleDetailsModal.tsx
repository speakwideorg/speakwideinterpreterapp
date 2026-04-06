import React, { memo } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Fonts, Icons, Images } from '@app/themes';
import { normalize } from '@app/utils/orientation';
// import Button from '@app/components/common/Button';
import moment from 'moment';
import { formatDateTime } from '@app/utils/helpers';

interface Props {
  onCancel: () => void;
  // onConfirm: () => void;
  details: any;
}

const formatTime = (date?: string) => (date ? moment(date).format('h:mm') : '');

const ScheduleDetailsModal: React.FC<Props> = ({
  onCancel,
  // onConfirm,
  details,
}) => {
  const startTime = formatTime(details?.start_date_time);
  const endTime = formatTime(details?.end_date_time);
  const timeDisplay = startTime && endTime ? `${startTime} - ${endTime}` : '';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {details?.language_one} - {details?.language_two}
      </Text>

      <View style={styles.rowBetween}>
        <View style={styles.rowLeft}>
          <View style={styles.iconBox}>
            <Image source={Icons.calendar} style={styles.smallIcon} />
          </View>
          <Text style={styles.timeDateText}>
            {formatDateTime(details?.start_date_time).formattedDate}
          </Text>
        </View>

        <View style={styles.rowLeft}>
          <View style={styles.iconBox}>
            <Image source={Icons.schedule} style={styles.smallIcon} />
          </View>
          <Text style={styles.timeDateText}>{timeDisplay}</Text>
        </View>
      </View>

      <View style={styles.br} />

      <View style={styles.fullUserSection}>
        <View style={styles.userSection}>
          <Image
            source={
              details?.client_profile_image
                ? { uri: details?.client_profile_image }
                : Images.user_profile
            }
            style={styles.profileBox}
          />
          <View>
            <Text numberOfLines={1} style={styles.nameText}>
              {details?.client}
            </Text>
            <Text style={styles.userTypeText}>Client</Text>
          </View>
        </View>
      </View>

      {/* <View style={styles.br2} />

      <View style={styles.buttonSection}>
        <Button
          onPress={onCancel}
          title="Decline"
          colors={[Colors.white, Colors.white]}
          textColor={Colors.purple}
          elevation={0}
          shadowOpacity={0}
          borderColor="#D0B3FF"
          width="48%"
        />
        <Button
          onPress={onConfirm}
          title="Accept"
          marginTop={normalize(10)}
          width="48%"
        />
      </View> */}

      <TouchableOpacity onPress={() => onCancel?.()} style={styles.touch}>
        <Image source={Icons.close} style={styles.closeIcon} />
      </TouchableOpacity>
    </View>
  );
};

export default memo(ScheduleDetailsModal);

const styles = StyleSheet.create({
  container: {
    paddingVertical: normalize(12),
    paddingHorizontal: normalize(15),
    paddingBottom: normalize(18),
  },
  title: {
    fontFamily: Fonts.Inter_Medium,
    color: Colors.night_blue,
    fontSize: normalize(14),
    marginVertical: normalize(10),
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  rowLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    height: normalize(23),
    width: normalize(23),
    borderRadius: normalize(4),
    backgroundColor: Colors.water,
    marginRight: normalize(5),
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileBox: {
    height: normalize(28),
    width: normalize(28),
    borderRadius: normalize(14),
    backgroundColor: Colors.water,
    marginRight: normalize(7),
  },
  br: {
    height: normalize(1),
    width: '100%',
    backgroundColor: Colors.platinum,
    marginVertical: normalize(14),
  },
  br2: {
    height: normalize(1),
    width: '100%',
    backgroundColor: Colors.platinum,
    marginBottom: normalize(10),
    marginTop: normalize(18),
  },
  timeDateText: {
    fontFamily: Fonts.Inter_Regular,
    color: Colors.night_blue,
    fontSize: 13,
  },
  nameText: {
    fontFamily: Fonts.Inter_SemiBold,
    color: Colors.night_blue,
    fontSize: normalize(11.5),
  },
  userTypeText: {
    fontStyle: 'italic',
    color: Colors.dust,
    fontSize: normalize(10),
    marginTop: normalize(1),
  },
  userSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fullUserSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  smallIcon: {
    height: '55%',
    width: '55%',
    resizeMode: 'contain',
    tintColor: Colors.purple,
  },
  groupIcon: {
    height: '80%',
    width: '80%',
    resizeMode: 'contain',
    tintColor: Colors.purple,
  },
  peopleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: normalize(12),
  },
  peopleIconBox: {
    marginRight: normalize(7),
  },
  peopleLabel: {
    fontFamily: Fonts.Inter_Regular,
    color: Colors.night_blue,
    fontSize: normalize(10),
  },
  buttonSection: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  touch: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: normalize(10),
    zIndex: 10,
  },
  closeIcon: {
    height: normalize(22),
    width: normalize(22),
    tintColor: '#1C1B1F',
  },
});

import React, { FC, memo, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { normalize } from '@app/utils/orientation';
import { Colors, Fonts, Icons } from '@app/themes';
import { hexToRGB } from '@app/utils/helpers';
import Button from '@app/components/common/Button';
import { isIos } from '@app/utils/helpers/Validation';
import moment from 'moment';
import { IMAGES_BUCKET_URL } from '@app/utils/constants';

type SessionItemProps = {
  index: number;
  item: any;
  type:
    | 'Requests'
    | 'Scheduled'
    | 'Completed'
    | 'Active'
    | 'Rejected'
    | 'Completed';
  onMenuPress: (
    coordinates: { x: number; y: number; width: number; height: number },
    item: any,
  ) => void;
  onPressDecline?: () => void;
  onPressAccept?: () => void;
  onPress?: () => void;
  onPressJoin?: () => void;
  from?: string;
};

const SessionItem: FC<SessionItemProps> = ({
  item,
  type,
  onMenuPress,
  onPressAccept,
  onPressDecline,
  onPress,
  onPressJoin,
  from,
}) => {
  const menuButtonRef = useRef<View>(null);
  console.log('type is ===>', type);

  const handlePress = useCallback(() => {
    menuButtonRef.current?.measureInWindow((x, y, width, height) => {
      onMenuPress({ x, y, width, height }, item);
    });
  }, [onMenuPress, item]);

  return (
    <Pressable
      onPress={() => onPress?.()}
      style={[
        styles.card,
        {
          borderLeftColor:
            type === 'Completed' ? Colors.teal_blue : Colors.light_purple,
        },
      ]}
    >
      {/* Header: Profile Image + Name + Location */}
      <View style={styles.header}>
        <View style={styles.profileImageWrapper}>
          <Image
            source={
              item?.client_profile_image === '' ||
              item?.client_profile_image === null ||
              item?.client_profile_image === undefined
                ? Icons.icon_user
                : {
                    uri:
                      IMAGES_BUCKET_URL.profile_user +
                      item?.client_profile_image,
                  }
            }
            style={styles.profileImage}
            tintColor={
              item?.client_profile_image === '' ||
              item?.client_profile_image === null ||
              item?.client_profile_image === undefined
                ? Colors.melrose
                : undefined
            }
          />
        </View>
        <View style={styles.headerTextContainer}>
          <Text style={styles.name}>{item.client}</Text>
          <View style={styles.locationRow}>
            <Image source={Icons.location} style={styles.locationIcon} />
            <Text numberOfLines={1} style={styles.address}>
              {item?.location || 'Nil'}
            </Text>
          </View>
        </View>
      </View>

      {/* Date + Time Row */}
      <View
        style={[
          styles.row,
          { marginBottom: normalize(type === 'Scheduled' ? 12 : 10) },
        ]}
      >
        <View style={styles.tag}>
          <Image source={Icons.calendar} style={styles.icon} />
          <Text style={styles.tagText}>
            {moment(item.start_date_time).format('DD MMM')}
          </Text>
        </View>
        <View style={[styles.tag, styles.timeTag]}>
          <Image
            source={Icons.schedule}
            style={[styles.icon, styles.timeIcon]}
          />
          <Text style={styles.tagText}>
            {moment(item.start_date_time).format('hh:mm A') +
              ' - ' +
              moment(item.end_date_time).format('hh:mm A')}
          </Text>
        </View>
      </View>

      {/* Link */}
      {item.link_to_join && type !== 'Rejected' && (
        <View style={[styles.gpsRow, styles.linkRow]}>
          <Text numberOfLines={1} style={[styles.gpsText, styles.linkText]}>
            {item.link_to_join}
          </Text>
          <TouchableOpacity style={styles.copyButton}>
            <Image
              source={Icons.copy}
              style={styles.copyIcon}
              tintColor={'#FC2793'}
            />
          </TouchableOpacity>
        </View>
      )}

      {/* GPS Location */}
      {item.location && (
        <View
          style={[
            styles.gpsRow,
            // type !== 'Requests' && type !== 'Active' && { marginBottom: 0 },
            type === 'Completed' && { marginBottom: normalize(0) },
          ]}
        >
          <Image source={Icons.gps} style={[styles.icon, styles.gpsIcon]} />
          <Text numberOfLines={1} style={styles.gpsText}>
            {item.location}
          </Text>
        </View>
      )}

      {/* Menu Button */}
      {type !== 'Requests' &&
        type !== 'Active' &&
        type !== 'Rejected' &&
        from !== 'sessionList' && (
          <TouchableOpacity
            ref={menuButtonRef}
            style={styles.menuButton}
            onPress={handlePress}
          >
            <Image source={Icons.menu_dots} style={styles.menuIcon} />
          </TouchableOpacity>
        )}

      {/* Buttons */}
      {(type === 'Requests' || item?.isRequest) && (
        <View style={styles.buttonsRow}>
          {type === 'Requests' && (
            <Button
              onPress={() => onPressDecline?.()}
              title="Decline"
              width="48%"
              marginTop={0}
              colors={[Colors.snow_drift, Colors.snow_drift]}
              textColor={Colors.purple}
              elevation={0}
              shadowOpacity={0}
              borderColor="#D0B3FF"
            />
          )}
          <Button
            onPress={() => {
              onPressAccept?.();
            }}
            title={type === 'Active' ? 'Join Session' : 'Accept'}
            width={type === 'Active' ? '100%' : '48%'}
            marginTop={0}
          />
        </View>
      )}
      {(type === 'Scheduled' || type === 'Active') && (
        <View style={[styles.buttonsRow]}>
          <Button
            onPress={() => {
              onPressJoin?.();
            }}
            title={'Join Session'}
            width={'100%'}
            marginTop={0}
          />
        </View>
      )}
    </Pressable>
  );
};

export default memo(SessionItem);

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: normalize(12),
    padding: normalize(15),
    marginBottom: normalize(15),
    shadowColor: hexToRGB(Colors.black, isIos() ? 1 : 0.5),
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
    borderLeftWidth: normalize(4),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: normalize(12),
  },
  headerTextContainer: {
    flex: 1,
  },
  avatar: {
    width: normalize(40),
    height: normalize(40),
    borderRadius: normalize(8),
    marginRight: normalize(12),
  },
  name: {
    fontFamily: Fonts.Inter_SemiBold,
    fontSize: normalize(14),
    color: Colors.night_blue,
    marginBottom: normalize(5),
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIcon: {
    height: normalize(12),
    width: normalize(12),
    marginRight: normalize(5),
  },
  address: {
    fontFamily: Fonts.Inter_Regular,
    fontSize: normalize(11),
    color: '#535353',
  },
  row: {
    flexDirection: 'row',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5EEFF',
    borderRadius: normalize(7),
    paddingVertical: normalize(6),
    paddingHorizontal: normalize(10),
    marginRight: normalize(10),
  },
  icon: {
    width: normalize(16),
    height: normalize(16),
    marginRight: normalize(6),
    resizeMode: 'contain',
  },
  tagText: {
    fontFamily: Fonts.Inter_Regular,
    fontSize: normalize(10),
    color: Colors.night_blue,
  },
  timeTag: {
    backgroundColor: '#FFF7EE',
  },
  timeIcon: {
    tintColor: '#FFBE79',
  },
  gpsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E9FCFF',
    paddingVertical: normalize(8),
    paddingHorizontal: normalize(10),
    borderRadius: normalize(7),
    marginBottom: normalize(12),
  },
  gpsText: {
    fontFamily: Fonts.Inter_Medium,
    fontSize: normalize(10),
    color: Colors.night_blue,
    width: '92%',
  },
  gpsIcon: {
    tintColor: '#00879B',
  },
  linkRow: {
    backgroundColor: '#FFF6FA',
  },
  linkText: {
    color: '#FC2793',
  },
  copyButton: {
    width: '10%',
    alignItems: 'center',
  },
  copyIcon: {
    width: normalize(16),
    height: normalize(16),
    resizeMode: 'contain',
    marginRight: 0,
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: normalize(12),
    borderTopColor: '#E8E8E8',
    borderTopWidth: normalize(1),
  },
  menuButton: {
    height: normalize(30),
    width: normalize(30),
    position: 'absolute',
    top: normalize(8),
    right: normalize(8),
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIcon: {
    resizeMode: 'contain',
    height: normalize(14),
    width: normalize(14),
  },
  profileImageWrapper: {
    height: normalize(40),
    width: normalize(40),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: normalize(8),
    overflow: 'hidden',
    marginRight: normalize(8),
    backgroundColor: Colors.white,
    borderWidth: normalize(1.5),
    borderColor: Colors.lilac,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});

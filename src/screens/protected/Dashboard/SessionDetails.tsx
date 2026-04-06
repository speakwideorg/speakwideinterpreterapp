/* eslint-disable react-hooks/exhaustive-deps */
import React, { FC, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  ScrollView,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { DashboardStackParamList } from '@app/types';
import { Colors, Fonts, Icons, Images } from '@app/themes';
import { normalize } from '@app/utils/orientation';
import { hexToRGB } from '@app/utils/helpers';
import { isIos } from '@app/utils/helpers/Validation';
import MyStatusBar from '@app/utils/helpers/MyStatusBar';
import Header from '@app/components/common/Header';
import Button from '@app/components/common/Button';
import { navigate } from '@app/navigation/RootNaivgation';
import { useIsFocused } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '@app/store';
import {
  acceptSessionRequest,
  declineRequestedSessionRequest,
  declineSessionRequest,
  getInterpreterDetailsRequest,
  getSessionUpdateApproveRequest,
  getSessionUpdateRejectRequest,
} from '@app/store/slice/interpreterSession.slice';
import { IMAGES_BUCKET_URL } from '@app/utils/constants';
import moment from 'moment';
import Css from '@app/themes/Css';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Loader from '@app/utils/helpers/Loader';
import { notificationMarkReadRequest } from '@app/store/slice/Notification.slice';

const { width } = Dimensions.get('screen');

type Props = StackScreenProps<DashboardStackParamList, 'SessionDetails'>;

type InfoRowProps = {
  icon: any;
  label: string;
  value: string;
};

const InfoRow: FC<InfoRowProps> = React.memo(({ icon, label, value }) => (
  <View style={styles.infoRowWrapper}>
    <View style={styles.iconWrapper}>
      <Image source={icon} style={styles.iconStyle} />
    </View>
    <View>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  </View>
));

const SessionDetails: FC<Props> = ({ route }) => {
  const { details, type, from } = route?.params;
  const isFromNotificationList = from === 'notificationList';
  console.log(details, '_details', from);

  const insets = useSafeAreaInsets();
  const isFcoused = useIsFocused();
  const dispatch = useAppDispatch();
  // select only the piece of state we care about to avoid re-renders
  const getInterpreterDetailsResponse = useAppSelector(
    state => state.interpreterSession.getInterpreterDetailsResponse,
  );
  const { status, loading } = useAppSelector(state => state.interpreterSession);

  useEffect(() => {
    if (isFcoused) {
      dispatch(getInterpreterDetailsRequest({ id: details?._id }));
    }
  }, [isFcoused]);
  useEffect(() => {
    console.log('isFromNotificationList', isFromNotificationList, details);
    if (isFromNotificationList && details?.notification_id) {
      dispatch(notificationMarkReadRequest({ id: details.notification_id }));
    }
  }, [details?.notification_id]);

  // Memoize derived UI values to avoid passing new objects/strings each render
  const avatarSource = useMemo(() => {
    const img = getInterpreterDetailsResponse?.client?.profile_image;
    if (!img) return Icons.icon_user;
    return { uri: IMAGES_BUCKET_URL.profile_user + img };
  }, [getInterpreterDetailsResponse?.client?.profile_image]);

  console.log('avtar source===>', avatarSource);

  const avatarTint = useMemo(() => {
    const img = getInterpreterDetailsResponse?.client?.profile_image;
    return !img ? Colors.melrose : undefined;
  }, [getInterpreterDetailsResponse?.client?.profile_image]);

  const dateString = useMemo(
    () =>
      `${moment(getInterpreterDetailsResponse?.start_date_time)
        .local()
        .format('dddd, DD MMMM YYYY')}`,
    [getInterpreterDetailsResponse?.start_date_time],
  );

  const startTimeString = useMemo(
    () =>
      `${moment(getInterpreterDetailsResponse?.start_date_time)
        .local()
        .format('hh:mm A')}`,
    [getInterpreterDetailsResponse?.start_date_time],
  );

  const endTimeString = useMemo(
    () =>
      `${moment(getInterpreterDetailsResponse?.end_date_time)
        .local()
        .format('hh:mm A')}`,
    [getInterpreterDetailsResponse?.end_date_time],
  );

  const sessionFormatTitle = useMemo(
    () => `${getInterpreterDetailsResponse?.format?.title ?? 'NA'}`,
    [getInterpreterDetailsResponse?.format?.title],
  );

  const languagesString = useMemo(
    () =>
      `${getInterpreterDetailsResponse?.language_one?.language_display_name} ↔ ${getInterpreterDetailsResponse?.language_two?.language_display_name}`,
    [
      getInterpreterDetailsResponse?.language_one?.language_display_name,
      getInterpreterDetailsResponse?.language_two?.language_display_name,
    ],
  );

  const sessionTypeString = useMemo(
    () =>
      `${getInterpreterDetailsResponse?.type?.expertise_display_name ?? 'NA'}`,
    [getInterpreterDetailsResponse?.type?.expertise_display_name],
  );

  const interpreterTypeString = useMemo(
    () => `${getInterpreterDetailsResponse?.interpreter_type ?? 'NA'}`,
    [getInterpreterDetailsResponse?.interpreter_type],
  );

  const descriptionString = useMemo(
    () =>
      `${
        getInterpreterDetailsResponse?.details
          ? getInterpreterDetailsResponse?.details
          : 'NA'
      }`,
    [getInterpreterDetailsResponse?.details],
  );

  const prefferedGender = useMemo(
    () =>
      `${
        getInterpreterDetailsResponse.preferred_gender
          ? getInterpreterDetailsResponse.preferred_gender
          : 'NA'
      }`,
    [getInterpreterDetailsResponse],
  );

  useEffect(() => {
    switch (status) {
      case 'interpreterSession/declineSessionSuccess': {
        navigate('Success', {
          type: 'DetailsSessionDeclined',
          title: 'Session',
          title1: ' Successfully',
          subTitle: 'Declined',
        });
        break;
      }
      case 'interpreterSession/acceptSessionSuccess': {
        navigate('Success', {
          type: 'DetailsSessionAccepted',
          title: 'Session',
          title1: ' Successfully',
          subTitle: 'Accepted',
        });
        break;
      }
    }
  }, [status]);

  useEffect(() => {
    switch (status) {
      case 'interpreterSession/getSessionUpdateRejectSuccess': {
        navigate('Success', {
          type: 'DetailsSessionDeclined',
          title: 'Session',
          title1: ' Successfully',
          subTitle: 'Declined',
        });
        break;
      }
      case 'interpreterSession/getSessionUpdateApproveSuccess': {
        navigate('Success', {
          type: 'DetailsSessionAccepted',
          title: 'Session',
          title1: ' Successfully',
          subTitle: 'Accepted',
        });
        break;
      }
    }
  }, [status]);

  return (
    <View style={styles.container}>
      <Image
        source={Images.top_shape}
        resizeMode="contain"
        style={styles.topShape}
      />
      <MyStatusBar
        backgroundColor="transparent"
        barStyle="dark-content"
        translucent
      />
      <Loader visible={loading} />

      <ScrollView
        style={Css.f1}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: normalize(30) }}
      >
        <Header
          isBack
          isShowProfile={type === 'RequestDetails'}
          isShowName={false}
          // isNotiShow={!isFromNotificationList}
        />

        <View style={styles.headerRowStyle}>
          <Text style={styles.dashboardTitle}>
            Session <Text style={styles.boldText}>Details</Text>
          </Text>
          {type === 'ScheduledDetails' && (
            <Button
              title="Sync to calendar"
              onPress={() => {}}
              width={'42%'}
              fontFamily={Fonts.Inter_Medium}
              fontSize={normalize(11.5)}
              height={normalize(40)}
              marginTop={0}
            />
          )}
        </View>

        <View style={styles.contentWrapper}>
          <View
            style={[
              styles.card,
              { flexDirection: 'row', alignItems: 'center' },
            ]}
          >
            <Image
              source={avatarSource}
              style={styles.avatar}
              tintColor={avatarTint}
            />

            {/* ⭐ ADD flex:1 HERE */}
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>
                {getInterpreterDetailsResponse?.client?.full_name}
              </Text>

              <View style={styles.locationRow}>
                <Image source={Icons.location} style={styles.locationIcon} />

                <Text style={styles.address}>
                  {getInterpreterDetailsResponse?.location
                    ? getInterpreterDetailsResponse?.location
                    : 'Nil'}
                </Text>
              </View>

              {getInterpreterDetailsResponse?.isOnSite && (
                <Text style={[styles.address, { marginTop: normalize(3) }]}>
                  Lat & Lng:{' '}
                  {getInterpreterDetailsResponse?.geo_loc?.coordinates?.join(
                    ',',
                  )}
                </Text>
              )}
            </View>
          </View>

          {/* Session Info */}
          <View style={styles.card}>
            <InfoRow icon={Icons.calendar} label="Date" value={dateString} />

            <View style={styles.rowBetween}>
              <InfoRow
                icon={Icons.schedule}
                label="Start Time"
                value={startTimeString}
              />
              <InfoRow
                icon={Icons.schedule}
                label="End Time"
                value={endTimeString}
              />
            </View>

            <View style={styles.rowBetween}>
              <InfoRow
                icon={Icons.tv_signin}
                label="Session Format"
                value={sessionFormatTitle}
              />
              <InfoRow
                icon={Icons.female}
                label="Preferred Gender"
                value={prefferedGender}
              />
            </View>
          </View>

          <View style={styles.card}>
            <InfoRow
              icon={Icons.translate}
              label="Languages"
              value={languagesString}
            />
          </View>

          <View style={styles.card}>
            <InfoRow
              icon={Icons.frame}
              label="Session Type"
              value={sessionTypeString}
            />
          </View>
          <View style={styles.card}>
            <InfoRow
              icon={Icons.icon_user}
              label="Interpreter Type"
              value={interpreterTypeString}
            />
          </View>

          {/* Description */}
          <Text style={styles.descriptionTitle}>Description</Text>
          <View style={styles.card}>
            <Text style={styles.descriptionText}>{descriptionString}</Text>
          </View>
        </View>
      </ScrollView>
      {type === 'ScheduledDetails' &&
        getInterpreterDetailsResponse?.is_update_requested && (
          <View
            style={[
              styles.btnRow,
              {
                marginBottom: insets.bottom > 0 ? insets.bottom : normalize(16), // safer bottom padding
              },
            ]}
          >
            <Button
              onPress={() =>
                dispatch(
                  getSessionUpdateRejectRequest({
                    id: getInterpreterDetailsResponse._id,
                  }),
                )
              }
              title="Reject"
              width="48%"
              marginTop={10}
              colors={[Colors.snow_drift, Colors.snow_drift]}
              textColor={Colors.purple}
              elevation={0}
              shadowOpacity={0}
              borderColor="#D0B3FF"
            />
            <Button
              onPress={() =>
                dispatch(
                  getSessionUpdateApproveRequest({
                    id: getInterpreterDetailsResponse._id,
                  }),
                )
              }
              title="Approve"
              width="48%"
              marginTop={10}
            />
          </View>
        )}
      {type === 'RequestDetails' && (
        <View
          style={[
            styles.btnRow,
            {
              marginBottom: insets.bottom > 0 ? insets.bottom : normalize(16), // safer bottom padding
            },
          ]}
        >
          <Button
            onPress={() =>
              dispatch(declineRequestedSessionRequest({ id: details._id }))
            }
            title="Decline"
            width="48%"
            marginTop={10}
            colors={[Colors.snow_drift, Colors.snow_drift]}
            textColor={Colors.purple}
            elevation={0}
            shadowOpacity={0}
            borderColor="#D0B3FF"
          />
          <Button
            onPress={() => dispatch(acceptSessionRequest({ id: details._id }))}
            title="Accept"
            width="48%"
            marginTop={10}
          />
        </View>
      )}
    </View>
  );
};

export default React.memo(SessionDetails);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.ceramic,
  },
  topShape: {
    height: normalize(340),
    width,
    position: 'absolute',
    top: 0,
  },
  dashboardTitle: {
    fontFamily: Fonts.Manrope_Regular,
    color: Colors.night_blue,
    fontSize: normalize(20),
  },
  boldText: {
    fontFamily: Fonts.Manrope_Bold,
  },
  contentWrapper: {
    marginTop: normalize(25),
    paddingHorizontal: normalize(15),
  },
  headerRowStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: normalize(15),
    marginTop: normalize(10),
  },
  card: {
    backgroundColor: Colors.white,
    padding: normalize(12),
    borderRadius: normalize(12),
    marginBottom: normalize(15),
    shadowColor: hexToRGB(Colors.black, isIos() ? 0.5 : 0.5),
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 3,
    elevation: 4,
  },
  avatar: {
    width: normalize(45),
    height: normalize(45),
    borderRadius: normalize(8),
    marginRight: normalize(12),
  },
  name: {
    fontFamily: Fonts.Inter_SemiBold,
    fontSize: normalize(13.5),
    color: Colors.night_blue,
    marginBottom: normalize(8),
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
    flexShrink: 1, // prevents overflow and enables wrapping
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: normalize(12),
  },
  infoRowWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconWrapper: {
    backgroundColor: '#F6F0FF',
    height: normalize(35),
    width: normalize(35),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: normalize(8),
    marginRight: normalize(12),
  },
  iconStyle: {
    height: normalize(18),
    width: normalize(18),
    tintColor: Colors.purple,
  },
  infoLabel: {
    fontSize: normalize(10),
    fontFamily: Fonts.Inter_Regular,
    color: '#9EA0A4',
    marginBottom: normalize(5),
  },
  infoValue: {
    fontSize: normalize(11),
    fontFamily: Fonts.Inter_Regular,
    color: Colors.night_blue,
  },
  descriptionTitle: {
    fontSize: normalize(14),
    fontFamily: Fonts.Inter_SemiBold,
    color: Colors.night_blue,
    marginBottom: normalize(5),
  },
  descriptionText: {
    fontSize: normalize(12),
    fontFamily: Fonts.Inter_Regular,
    color: Colors.dark_grey,
    lineHeight: normalize(18),
  },
  btnRow: {
    height: normalize(85),
    width,
    flexDirection: 'row',
    paddingHorizontal: normalize(15),
    justifyContent: 'space-between',
    paddingTop: normalize(10),
    shadowColor: hexToRGB(Colors.black, isIos() ? 0.3 : 0.5),
    backgroundColor: Colors.white,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: -8 },
    shadowRadius: 5,
    elevation: 4,
  },
});

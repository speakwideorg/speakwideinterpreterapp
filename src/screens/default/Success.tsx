/* eslint-disable react-hooks/exhaustive-deps */
import React, { FC, useMemo } from 'react';
import {
  Text,
  ImageBackground,
  StyleSheet,
  ImageSourcePropType,
  View,
  Image,
} from 'react-native';
import { Colors, Fonts, Icons, Images } from '@app/themes';
import { normalize } from '@app/utils/orientation';
import Button from '@app/components/common/Button';
import { goBack, navigate, reset } from '@app/navigation/RootNaivgation';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '@app/types';
import { useAppDispatch } from '@app/store';
import { profileDetailsRequest } from '@app/store/slice/auth.slice';
import { StackActions, useNavigation } from '@react-navigation/native';
import { isIos } from '@app/utils/helpers/Validation';

type Props = StackScreenProps<RootStackParamList, 'Success'>;

const Success: FC<Props> = ({ route }) => {
  const { type, title, title1, title2, title4, subTitle, details, isInfo } =
    route.params || {};
  const dispatch = useAppDispatch();
  const navigation = useNavigation();

  const buttonLabels: Record<string, string> = {
    Logout: 'Back to Login',
    ResetPassword: 'Continue',
    BankAccountAdd: 'Continue',
    Transaction: 'Continue',
    SessionAccepted: 'Done',
    SessionDeclined: 'Done',
    DetailsSessionDeclined: 'Done',
    DetailsSessionAccepted: 'Done',
    DisputeDeclined: 'Go Back',
    DisputeAccepted: 'Go Back',
    AccountUpdate: 'Back to Settings',
    BankRemoved: 'Back to Settings',
    LinkAccount: 'Back to Settings',
    ChangePassword: 'Back to Settings',
    SubscriptionCancel: 'Back to Settings',
    RaiseDispute: 'Done',
    ProfileSave: 'Back to Profile',
    SubscriptionSuccess: 'Done',
    AddNewPaymentCard: 'Done',
    UpgradeSubscription: 'Done',
  };

  const actionHandlers: Record<string, () => void> = {
    ResetPassword: () => navigate('Login'),
    BankAccountAdd: () => navigate('Subscription'),
    Transaction: () => {},
    SubscriptionCancel: () => navigation.dispatch(StackActions.pop(2)),
    ProfileSave: () => navigation.dispatch(StackActions.pop(2)),
    ChangePassword: () => navigation.dispatch(StackActions.pop(2)),
    Logout: () => reset(0, 'Login'),
    SubscriptionSuccess: () => dispatch(profileDetailsRequest()),
    AddNewPaymentCard: () => goBack(),
    UpgradeSubscription: () => navigation.dispatch(StackActions.pop(4)),
    DetailsSessionDeclined: () => reset(0, 'Dashboard'),
    DetailsSessionAccepted: () => reset(0, 'Dashboard'),
    RaiseDispute: () => reset(0, 'Dashboard'),
  };

  const { bgImage, textColor, marginTopTitle, buttonLabel } = useMemo(() => {
    const isCancelled =
      type === 'SessionDeclined' ||
      type === 'Cancelled' ||
      type === 'DisputeDeclined' ||
      type === 'SubscriptionCancel';
    return {
      bgImage: isCancelled ? Images.cancelled : Images.success,
      textColor: isCancelled ? Colors.salmon : Colors.purple,
      marginTopTitle: isCancelled
        ? normalize(type === 'SubscriptionCancel' ? 115 : 30)
        : 0,
      buttonLabel: buttonLabels[type ?? ''] || 'Back to Session',
    };
  }, [type]);

  const handlePress = () => {
    if (type && actionHandlers[type]) {
      actionHandlers[type]();
    } else {
      goBack();
    }
  };

  return (
    <ImageBackground
      source={bgImage as ImageSourcePropType}
      style={styles.background}
      resizeMode="cover"
    >
      <Text
        style={[styles.title, { color: textColor, marginTop: marginTopTitle }]}
      >
        {title}
        {title1 && (
          <Text style={[styles.subTitle, { color: textColor }]}>{title1}</Text>
        )}
        {title2 && (
          <Text
            style={[
              styles.subTitle,
              { color: textColor, fontFamily: Fonts.Manrope_Medium },
            ]}
          >
            {title2}
          </Text>
        )}
        {title4 && title4}
      </Text>

      {subTitle && (
        <Text style={[styles.subTitle, { color: textColor }]}>{subTitle}</Text>
      )}

      {details && !isInfo ? (
        <Text
          style={[
            styles.details,
            type === 'SubscriptionCancel' && styles.details1,
          ]}
        >
          {details}
        </Text>
      ) : null}

      {isInfo && details ? (
        <View style={styles.infoBox}>
          <View style={styles.info}>
            <Image source={Icons.info} style={styles.infoIcon} />
          </View>
          <Text style={styles.infoText}>{details}</Text>
        </View>
      ) : null}

      <Button
        title={buttonLabel}
        onPress={handlePress}
        marginTop={normalize(18)}
      />
    </ImageBackground>
  );
};

export default Success;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: Fonts.Manrope_Bold,
    fontSize: normalize(22),
    textAlign: 'center',
  },
  subTitle: {
    fontFamily: Fonts.Manrope_Regular,
    fontSize: normalize(22),
    marginTop: normalize(2),
    textAlign: 'center',
  },
  details: {
    color: Colors.night_blue,
    fontFamily: Fonts.Inter_Regular,
    fontSize: normalize(13),
    marginTop: normalize(15),
    marginHorizontal: normalize(15),
    textAlign: 'center',
  },
  details1: {
    color: Colors.dark_grey,
    fontSize: normalize(12),
    marginHorizontal: normalize(20),
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
    backgroundColor: '#FFF0EF',
    padding: normalize(10),
    marginBottom: normalize(10),
    borderRadius: normalize(10),
    borderColor: '#F6F6F6',
    borderWidth: normalize(1),
    marginTop: normalize(15),
  },
  info: {
    justifyContent: 'center',
    alignItems: 'center',
    height: normalize(30),
    width: normalize(30),
    marginRight: normalize(8),
    backgroundColor: Colors.white,
    borderRadius: normalize(8),
    borderColor: '#F6F6F6',
    borderWidth: normalize(1),
  },
  infoIcon: {
    width: normalize(15),
    height: normalize(15),
  },
  infoText: {
    flex: 1,
    fontFamily: Fonts.Inter_Regular,
    fontSize: normalize(isIos() ? 9 : 8.5),
    color: Colors.dark_grey,
    lineHeight: normalize(15),
  },
});

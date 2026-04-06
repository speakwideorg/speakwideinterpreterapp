/* eslint-disable react-hooks/exhaustive-deps */
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { Colors, Fonts, Icons, Images } from '@app/themes';
import MyStatusBar from '@app/utils/helpers/MyStatusBar';
import { normalize } from '@app/utils/orientation';
import { isIos } from '@app/utils/helpers/Validation';
import Button from '@app/components/common/Button';
import { goBack, navigate } from '@app/navigation/RootNaivgation';
import { useAppDispatch, useAppSelector } from '@app/store';
import { useIsFocused } from '@react-navigation/native';
import { showMessage } from '@app/utils/helpers/Toast';
import {
  cancelSubscriptionRequest,
  resetUserDefaults,
  subscriptionDetailsRequest,
} from '@app/store/slice/user.slice';
import SubscriptionPlanItem from './component/SubscriptionPlanItem';
import AlertModal from '@app/components/common/AlertModal';
import CancelSubscription from './model/CancelSubscription';
import KeyboardAvoidingTemplate from '@app/components/template/KeyboardAvoidingTemplate';
import { profileDetailsRequest } from '@app/store/slice/auth.slice';

const { width } = Dimensions.get('screen');

const SubscriptionDetails = () => {
  const dispatch = useAppDispatch();
  const isFocused = useIsFocused();
  const subscriptionId = useAppSelector(
    state =>
      state.auth.profileDetailsResponse?.subscriptionDetails?.planDetails?._id,
  );
  const { subscriptionListResponse } = useAppSelector(state => state.default);
  const subscriptionDetailsResponse = useAppSelector(
    state => state.user.subscriptionDetailsResponse,
  );

  console.log('subscriptionDetailsResponse', subscriptionDetailsResponse);
  console.log('subscriptionListResponse', subscriptionListResponse);
  const { status, isLoading } = useAppSelector(state => state.user);
  const { profileDetailsResponse } = useAppSelector(state => state.auth);
  const [isCancelled, setIsCancelled] = useState(false);

  const currentplan = subscriptionListResponse?.filter(
    (itm: any) => itm?._id === subscriptionId,
  )[0];
  console.log('currentplan==>', currentplan);
  useEffect(() => {
    if (status === 'user/cancelSubscriptionSuccess') {
      showMessage('Subscription cancelled successfully');
      // goBack();

      setTimeout(() => {
        dispatch(profileDetailsRequest());
        dispatch(
          subscriptionDetailsRequest({ subscriptionId: subscriptionId }),
        );
        navigate('Success', {
          type: 'SubscriptionCancel',
          title: 'Subscription',
          subTitle: 'Successfully Cancelled',
          isInfo: true,
          details:
            'You will have access to subscription features until the end of your billing period',
        });
      }, 2000);
    } else if (status === 'user/cancelSubscriptionFailure') {
      showMessage('Failed to cancel subscription. Please try again.');
    }
  }, [status]);

  useEffect(() => {
    if (isFocused) {
      switch (status) {
        case 'user/subscriptionDetailsSuccess': {
          dispatch(resetUserDefaults());
          break;
        }
        case 'user/subscriptionDetailsFailure': {
          break;
        }
      }
    }
  }, [status, isFocused]);

  return (
    <KeyboardAvoidingTemplate
      contentContainerStyle={styles.container}
      loaderEnable={isLoading}
      scrollEnable
    >
      <Image source={Images.shape} style={styles.shape} />
      <MyStatusBar
        backgroundColor={'transparent'}
        barStyle={'dark-content'}
        translucent
      />
      <View style={styles.v}>
        <TouchableOpacity onPress={() => goBack()} style={styles.backContainer}>
          <Image source={Icons.arrow_right} style={styles.arrow_right} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          Subscription
          <Text style={{ fontFamily: Fonts.Manrope_SemiBold }}>
            {' Details'}
          </Text>
        </Text>
        <Text style={styles.subTitle}>
          Choose the plan that's right for you
        </Text>
        {profileDetailsResponse?.subscriptionDetails?.status === 'canceled' ? (
          <Text style={styles.noActivePlan}>No Active Plan</Text>
        ) : (
          <SubscriptionPlanItem
            index={0}
            item={currentplan}
            marginBottom={normalize(12)}
            isHideButton={true}
            marginRight={0}
          />
        )}

        <Button
          onPress={() => {
            navigate('UpgradeSubscriptionList');
          }}
          title={
            profileDetailsResponse?.subscriptionDetails?.status === 'canceled'
              ? 'Choose Your Plan'
              : 'Upgrade your Plan'
          }
          width={width - normalize(30)}
        />

        {profileDetailsResponse?.subscriptionDetails?.status !== 'canceled' && (
          <TouchableOpacity
            onPress={() => setIsCancelled(true)}
            style={styles.touch1}
          >
            <Text style={styles.cancel}>Cancel Subscription</Text>
          </TouchableOpacity>
        )}
      </View>
      {isCancelled && (
        <AlertModal
          visible={isCancelled}
          onClose={() => setIsCancelled(false)}
          padding={0}
        >
          <CancelSubscription
            onCancel={() => setIsCancelled(false)}
            onConfirm={() => {
              setIsCancelled(false);
              dispatch(cancelSubscriptionRequest({}));
              // showMessage('work in progress');
              // setTimeout(() => {
              //   navigate('Success', {
              //     type: 'SubscriptionCancel',
              //     title: 'Subscription',
              //     subTitle: 'Successfully Cancelled',
              //     isInfo: true,
              //     details:
              //       'You will have access to subscription features until the end of your billing period',
              //   });
              // }, 500);
            }}
          />
        </AlertModal>
      )}
    </KeyboardAvoidingTemplate>
  );
};

export default SubscriptionDetails;

const styles = StyleSheet.create({
  container: { paddingBottom: normalize(45) },
  shape: {
    height: normalize(180),
    width: '100%',
    resizeMode: 'contain',
    position: 'absolute',
    top: 0,
  },
  v: { paddingHorizontal: normalize(15) },
  backContainer: {
    height: normalize(35),
    width: normalize(35),
    backgroundColor: Colors.white,
    borderRadius: normalize(40),
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: normalize(isIos() ? 10 : 18),
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
  headerTitle: {
    fontSize: normalize(18),
    color: Colors.night_blue,
    fontFamily: Fonts.Manrope_Regular,
    marginTop: normalize(10),
    marginBottom: normalize(6),
  },
  bankLogoWrapper: {
    borderColor: '#F3F3F3',
    borderWidth: normalize(1),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    height: normalize(35),
    width: normalize(50),
    borderRadius: normalize(5),
    overflow: 'hidden',
  },
  icon: { height: normalize(20), width: normalize(35), resizeMode: 'cover' },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: normalize(10),
    borderColor: '#E8E8E8',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(10),
  },
  cardText: {
    fontSize: normalize(12),
    color: Colors.night_blue,
    fontFamily: Fonts.Inter_Medium,
  },
  primaryTag: {
    backgroundColor: '#F0E7FF',
    alignSelf: 'flex-start',
    paddingHorizontal: normalize(6),
    paddingVertical: normalize(1),
    borderRadius: normalize(30),
    marginTop: normalize(1),
  },
  primaryText: {
    color: Colors.purple,
    fontFamily: Fonts.Inter_Medium,
    fontSize: normalize(6),
  },
  arrow: {
    height: normalize(10),
    width: normalize(10),
    resizeMode: 'contain',
  },
  checkContainer: {
    width: normalize(25),
    height: normalize(25),
    borderRadius: normalize(25),
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentMethodTitle: {
    color: Colors.night_blue,
    fontFamily: Fonts.Inter_Medium,
    fontSize: normalize(13),
  },
  subTitle: {
    fontFamily: Fonts.Inter_Regular,
    color: Colors.dark_grey,
    fontSize: normalize(12),
    marginTop: normalize(6),
    marginBottom: normalize(20),
  },
  touch1: {
    justifyContent: 'center',
    alignSelf: 'center',
    padding: normalize(12),
    marginTop: normalize(5),
  },
  cancel: {
    color: '#FF4C35',
    fontFamily: Fonts.Inter_Medium,
    fontSize: normalize(13),
  },
  noActivePlan: {
    fontFamily: Fonts.Inter_Medium,
    fontSize: normalize(14),
    color: Colors.dark_grey,
    alignSelf: 'center',
    marginBottom: normalize(20),
  },
});

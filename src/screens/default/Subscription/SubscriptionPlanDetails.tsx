import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import React, { FC, useEffect, useState } from 'react';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '@app/types';
import { Colors, Fonts, Icons, Images } from '@app/themes';
import MyStatusBar from '@app/utils/helpers/MyStatusBar';
import { normalize } from '@app/utils/orientation';
import { isIos } from '@app/utils/helpers/Validation';
import PlanItem from './model/PlanItem';
import Button from '@app/components/common/Button';
import { goBack, navigate } from '@app/navigation/RootNaivgation';
import AlertModal from '@app/components/common/AlertModal';
import CancelSubscription from './model/CancelSubscription';
import { showMessage } from '@app/utils/helpers/Toast';
import { useAppDispatch, useAppSelector } from '@app/store';
import { cancelSubscriptionRequest } from '@app/store/slice/user.slice';

const SubscriptionPlanDetails: FC<
  StackScreenProps<RootStackParamList, 'SubscriptionPlanDetails'>
> = ({ route }) => {
  const { plan, type } = route?.params;
  const { status, isLoading, cancelSubscriptionResponse } = useAppSelector(
    state => state.user,
  );
  const dispatch = useAppDispatch();

  const [isSelected, setIsSelected] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  console.log('cancelSubscriptionResponse', cancelSubscriptionResponse);

  useEffect(() => {
    if (status === 'user/cancelSubscriptionSuccess') {
      showMessage('Subscription cancelled successfully');
      // goBack();
      setTimeout(() => {
        navigate('Success', {
          type: 'SubscriptionCancel',
          title: 'Subscription',
          subTitle: 'Successfully Cancelled',
          isInfo: true,
          details:
            'You will have access to subscription features until the end of your billing period',
        });
      }, 500);
    } else if (status === 'user/cancelSubscriptionFailure') {
      showMessage('Failed to cancel subscription. Please try again.');
    }
  }, [status]);

  return (
    <View style={styles.container}>
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
          {`${type === 'Select' ? '' : 'Subscription '}`}
          {
            <Text style={{ fontFamily: Fonts.Manrope_SemiBold }}>
              {`${type === 'Select' ? 'Select Plan' : 'Details'}`}
            </Text>
          }
        </Text>

        {type === 'Details' && (
          <Text style={[styles.headerSubTitle]}>
            {'Choose the plan that’s right for you'}
          </Text>
        )}
      </View>

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: normalize(40),
          paddingTop: normalize(isIos() ? 13 : 15),
          alignItems: 'center',
        }}
      >
        <PlanItem index={0} item={plan} isHideButton={true} marginRight={0} />

        <View style={{ padding: normalize(18), width: '100%' }}>
          {type === 'Select' && (
            <>
              <Text style={styles.rates}>Payment Methods</Text>

              <View style={styles.v1}>
                <View style={styles.bankLogoWrapper}>
                  <Image source={Images.CIBC} style={styles.icon} />
                </View>

                <View style={styles.v2}>
                  <Text style={styles.title}>Canadian Impe... -6545</Text>
                  <View
                    style={{
                      backgroundColor: '#F0E7FF',
                      marginTop: normalize(3),
                      alignSelf: 'flex-start',
                      paddingHorizontal: normalize(11),
                      paddingVertical: normalize(2),
                      borderRadius: normalize(30),
                    }}
                  >
                    <Text style={styles.subTitle}>Primary</Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => setIsSelected(!isSelected)}
                  style={[
                    {
                      backgroundColor: isSelected
                        ? Colors.purple
                        : Colors.white,
                    },
                    styles.touch,
                  ]}
                >
                  {isSelected && (
                    <Image
                      source={Icons.check}
                      style={styles.check}
                      tintColor={Colors.white}
                    />
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}
          <Button
            onPress={() => {
              if (type === 'Select') {
                navigate('Success', {
                  title: 'Transaction',
                  subTitle: 'Successful',
                  details: 'View details in transaction history.',
                  type: 'Transaction',
                });
              }
            }}
            title={type === 'Details' ? 'Upgrade your Plan' : 'Confirm Plan'}
            width={'100%'}
            marginTop={normalize(5)}
          />

          {type === 'Details' && (
            <TouchableOpacity
              onPress={() => setIsCancelled(true)}
              style={styles.touch1}
            >
              <Text style={styles.cancel}>Cancel Subscription</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

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
    </View>
  );
};

export default SubscriptionPlanDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  shape: {
    height: normalize(180),
    width: '100%',
    resizeMode: 'contain',
    position: 'absolute',
    top: 0,
  },
  rates: {
    color: Colors.night_blue,
    fontFamily: Fonts.Inter_Regular,
    fontSize: normalize(12),
  },
  v: {
    paddingHorizontal: normalize(15),
  },
  backContainer: {
    height: normalize(35),
    width: normalize(35),
    resizeMode: 'contain',
    backgroundColor: Colors.white,
    borderRadius: normalize(40),
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: normalize(isIos() ? 10 : 18),
    shadowColor: Colors.dark_grey,
    shadowOffset: {
      width: 0,
      height: 4,
    },
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
  headerSubTitle: {
    fontFamily: Fonts.Inter_Regular,
    color: Colors.dark_grey,
    fontSize: normalize(12),
    marginBottom: normalize(6),
  },
  v1: {
    height: normalize(45),
    width: '100%',
    marginVertical: normalize(18),
    flexDirection: 'row',
    alignItems: 'center',
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
  },
  icon: { height: normalize(20), width: normalize(35), resizeMode: 'contain' },
  v2: {
    marginHorizontal: normalize(15),
  },
  title: {
    fontFamily: Fonts.Inter_Regular,
    color: Colors.night_blue,
    fontSize: normalize(11),
  },
  subTitle: {
    fontFamily: Fonts.Inter_Medium,
    color: Colors.purple,
    fontSize: normalize(10),
  },
  touch: {
    width: normalize(20),
    height: normalize(20),
    borderRadius: normalize(20),
    position: 'absolute',
    right: 0,
    zIndex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: normalize(1),
    borderColor: Colors.purple,
  },
  check: {
    height: normalize(11),
    width: normalize(11),
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
});

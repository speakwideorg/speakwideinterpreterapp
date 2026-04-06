import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageBackground,
  Dimensions,
} from 'react-native';
import React, { FC } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { Colors, Fonts, Icons, Images } from '@app/themes';
import { normalize } from '@app/utils/orientation';
import Button from '@app/components/common/Button';
import { navigate } from '@app/navigation/RootNaivgation';
import Css from '@app/themes/Css';
import { useAppSelector } from '@app/store';
import { showMessage } from '@app/utils/helpers/Toast';

const { width } = Dimensions.get('screen');

export interface SubscriptionPlanInterface {
  _id: string;
  title: string;
  price: number;
  stripeProductId: string;
  stripePriceId: string;
  plans: {
    pay_frequency: {
      interval: string;
      frequency: number;
    };
    isUnlimitedSession: boolean;
    priority_response: boolean;
    allday_support: false;
    no_of_sessions: string;
  };
  status: string;
  free_trial_in_days: number;
}

interface SubscriptionPlanItemProps {
  item: SubscriptionPlanInterface;
  index: number;
  isLastIndex?: boolean;
  isHideButton?: boolean;
  marginRight?: number;
  marginBottom?: number;
}

const SubscriptionPlanItem: FC<SubscriptionPlanItemProps> = ({
  item = {
    _id: '',
    plans: {
      pay_frequency: {
        interval: '',
        frequency: 0,
      },
      isUnlimitedSession: false,
      priority_response: false,
      allday_support: false,
      no_of_sessions: '',
    },
    price: '',
    status: '',
    stripePriceId: '',
    stripeProductId: '',
    title: '',
    free_trial_in_days: 0,
  },
  index,
  isHideButton = false,
  marginRight = normalize(6),
  marginBottom = 0,
}) => {
  const { profileDetailsResponse } = useAppSelector(state => state.auth);
  console.log(
    'profileDetailsResponse',
    profileDetailsResponse.subscriptionDetails.planDetails._id,
    item._id,
  );
  const plans = [
    {
      isAvailable: true,
      title: '# of sessions',
      subTitle: '(per month)',
      value: item?.plans?.no_of_sessions,
    },
    {
      isAvailable: true,
      title: 'Pay Frequency',
      subTitle: '',
      value: item?.plans?.pay_frequency.frequency,
    },
    {
      isAvailable: item?.plans?.priority_response,
      title: `Priority Response`,
      subTitle: '',
      value: '',
    },
    {
      isAvailable: item?.plans?.allday_support,
      title: '24/7 Support',
      subTitle: '',
      value: '',
    },
  ];

  return (
    <View key={index} style={[styles.card, { marginRight, marginBottom }]}>
      <LinearGradient
        useAngle={true}
        angle={160}
        colors={['#90A9FF', '#8142E9']}
        style={[styles.linear]}
      >
        <Image source={Images.vector} style={styles.vector} />
        {/* <View style={styles.v2}>
            <Image source={Icons.star} style={styles.star} />
            <Text style={styles.txt2}>POPULAR</Text>
          </View> */}
        <View style={[Css.f1, Css.p6, Css.pb15]}>
          <Text style={styles.price}>
            {`${item?.price}`}
            {<Text style={styles.plan}>/monthly</Text>}
          </Text>
          {item?.free_trial_in_days > 0 && (
            <Text
              style={[
                styles.txt,
                { fontSize: normalize(13), marginTop: normalize(0) },
              ]}
            >
              + Get {item?.free_trial_in_days} days free trial
            </Text>
          )}
          {/* {item?.trial && <Text style={styles.trail}>{item.trial}</Text>} */}
          <ImageBackground source={Images.shapebox} style={styles.shape}>
            <Text style={styles.type}>{item.title} Monthly Plan</Text>
          </ImageBackground>

          <Text style={styles.txt}>This plan gets</Text>

          <View style={styles.plansContainer}>
            {plans?.map((_item, _index) => (
              <View key={_index} style={styles.itemView}>
                <View style={styles.itemLeftContainer}>
                  <View
                    style={[
                      styles.imageView,
                      {
                        backgroundColor: _item.isAvailable
                          ? Colors.blue_chalk
                          : Colors.pearl,
                      },
                    ]}
                  >
                    <Image
                      source={_item.isAvailable ? Icons.check : Icons.close}
                      style={{
                        height: normalize(_item.isAvailable ? 8 : 16),
                        width: normalize(_item.isAvailable ? 8 : 16),
                      }}
                      tintColor={
                        _item.isAvailable ? Colors.purple : Colors.orange
                      }
                    />
                  </View>
                  {_index === plans.length - 1 ? null : (
                    <View style={[styles.line]} />
                  )}
                </View>
                <Text
                  style={[
                    styles.fetures,
                    _index === plans.length - 1 ? {} : Css.mb10,
                  ]}
                >
                  {_item.title}
                  {_item.subTitle ? (
                    <Text
                      style={{ color: Colors.dark_grey }}
                    >{` ${_item.subTitle}`}</Text>
                  ) : (
                    ''
                  )}
                  {_item.value && `: ${_item.value}`}
                </Text>
              </View>
            ))}
          </View>

          {!isHideButton && (
            <Button
              onPress={() => {
                if (
                  profileDetailsResponse?.subscriptionDetails?.planDetails
                    ?._id === item._id
                ) {
                  showMessage('You cannot select your current plan');
                  return;
                }
                navigate('UpgradeSubscriptionDetails', {
                  planId: item?._id,
                });
              }}
              title={
                profileDetailsResponse?.subscriptionDetails?.planDetails
                  ?._id === item._id
                  ? 'Current Plan'
                  : 'Choose Plan'
              }
              fontFamily={Fonts.Inter_Medium}
              width={'100%'}
              colors={[Colors.snow, Colors.snow]}
              marginTop={normalize(16)}
              borderColor={Colors.white}
              textColor={Colors.night_blue}
            />
          )}
        </View>
      </LinearGradient>
    </View>
  );
};

export default SubscriptionPlanItem;

const styles = StyleSheet.create({
  vector: {
    height: normalize(300),
    width: normalize(300),
    resizeMode: 'contain',
    position: 'absolute',
    top: normalize(-35),
    right: 0,
  },
  card: {
    borderRadius: normalize(12),
    overflow: 'hidden',
    width: width - normalize(30),
  },
  linear: {
    borderRadius: normalize(12),
    width: '100%',
    overflow: 'hidden',
  },
  price: {
    fontFamily: Fonts.Manrope_SemiBold,
    color: Colors.white,
    fontSize: normalize(28),
  },
  plan: {
    fontFamily: Fonts.Manrope_Regular,
    color: Colors.white,
    fontSize: normalize(12),
  },
  trail: {
    fontFamily: Fonts.Inter_Medium,
    color: Colors.water,
    fontSize: normalize(11),
  },
  shape: {
    borderRadius: normalize(30),
    overflow: 'hidden',
    paddingVertical: normalize(6),
    paddingHorizontal: normalize(12),
    alignSelf: 'flex-start',
    marginTop: normalize(5),
  },
  type: {
    color: Colors.white,
    fontFamily: Fonts.Manrope_SemiBold,
    fontSize: normalize(12),
  },
  txt: {
    color: Colors.white,
    fontFamily: Fonts.Inter_Medium,
    fontSize: normalize(11),
    marginTop: normalize(12),
  },
  plansContainer: {
    backgroundColor: Colors.white,
    borderRadius: normalize(15),
    padding: normalize(13),
    marginTop: normalize(10),
    flex: 1,
  },
  itemLeftContainer: {
    width: normalize(20),
    alignItems: 'center',
    flexDirection: 'column',
    boxSizing: 'border-box',
  },
  line: {
    width: 2,
    backgroundColor: Colors.blue_chalk,
    flex: 1,
    marginVertical: normalize(2),
  },
  itemView: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  imageView: {
    height: normalize(20),
    width: normalize(20),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: normalize(30),
    overflow: 'hidden',
  },
  fetures: {
    fontFamily: Fonts.Inter_Regular,
    color: Colors.night_blue,
    fontSize: normalize(11),
    flex: 1,
    marginTop: normalize(3),
    marginLeft: normalize(5),
  },
  v2: {
    height: normalize(26),
    width: normalize(85),
    backgroundColor: Colors.white,
    borderRadius: normalize(30),
    position: 'absolute',
    right: normalize(25),
    top: normalize(30),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: normalize(10),
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  star: {
    height: normalize(13),
    width: normalize(13),
  },
  txt2: {
    fontFamily: Fonts.Manrope_SemiBold,
    color: Colors.purple,
    fontSize: normalize(10),
  },
});

/* eslint-disable react-hooks/exhaustive-deps */
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from 'react-native';
import React, { FC, useEffect, useRef, useState } from 'react';
import { StackScreenProps } from '@react-navigation/stack';
import { SettingsStackParamList } from '@app/types';
import { Colors, Fonts, Icons, Images } from '@app/themes';
import MyStatusBar from '@app/utils/helpers/MyStatusBar';
import { normalize } from '@app/utils/orientation';
import { isIos } from '@app/utils/helpers/Validation';
import Button from '@app/components/common/Button';
import { goBack, navigate } from '@app/navigation/RootNaivgation';
import Css from '@app/themes/Css';
import { useAppDispatch, useAppSelector } from '@app/store';
import { useIsFocused } from '@react-navigation/native';
import { showMessage } from '@app/utils/helpers/Toast';
import { profileDetailsRequest } from '@app/store/slice/auth.slice';
import { useStripe } from '@stripe/stripe-react-native';
import {
  cardListRequest,
  createPaymentRequest,
} from '@app/store/slice/user.slice';
import SubscriptionPlanItem, {
  SubscriptionPlanInterface,
} from './component/SubscriptionPlanItem';
import Loader from '@app/utils/helpers/Loader';

interface CardProps {
  label: string;
  borderBottomWidth?: number;
  isPrimary?: boolean;
  onPress?: () => void;
  isSelected?: boolean;
}

const RenderCard = ({
  label,
  borderBottomWidth,
  isPrimary = false,
  onPress,
  isSelected = false,
}: CardProps) => (
  <TouchableOpacity
    activeOpacity={0.8}
    style={[styles.card, { borderBottomWidth }]}
    onPress={onPress}
  >
    <View style={styles.cardContent}>
      <View style={styles.bankLogoWrapper}>
        <Image source={Icons.icon_payment_card} style={styles.icon} />
      </View>
      <View>
        <Text style={styles.cardText}>{label}</Text>
        {isPrimary && (
          <View style={styles.primaryTag}>
            <Text style={styles.primaryText}>Primary</Text>
          </View>
        )}
      </View>
    </View>

    {/* Check Circle */}
    <Pressable
      onPress={onPress}
      style={[
        styles.checkContainer,
        {
          backgroundColor: isSelected ? Colors.purple : Colors.white,
          borderWidth: normalize(1),
          borderColor: Colors.purple,
        },
      ]}
    >
      {isSelected && (
        <Image
          source={Icons.check}
          style={[styles.arrow, { tintColor: Colors.white }]}
        />
      )}
    </Pressable>
  </TouchableOpacity>
);

const UpgradeSubscriptionDetails: FC<
  StackScreenProps<SettingsStackParamList, 'UpgradeSubscriptionDetails'>
> = ({ route }) => {
  const dispatch = useAppDispatch();
  const isFocused = useIsFocused();
  const { confirmPayment } = useStripe();
  const { planId } = route?.params;
  const { status, cardListsResponse, createPaymentResponse, isLoading } =
    useAppSelector(state => state.user);
  const subscriptionList = useAppSelector(
    state => state.default.subscriptionListResponse,
  );
  const item = subscriptionList?.find(
    (subs: SubscriptionPlanInterface) => subs?._id === planId,
  );

  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  useEffect(() => {
    if (isFocused) {
      dispatch(cardListRequest({}));
    }
  }, [isFocused]);

  const handleConfirmPayment = async () => {
    try {
      const clientSecret = createPaymentResponse?.client_secret;
      if (clientSecret === null) {
        setTimeout(() => {
          dispatch(profileDetailsRequest());
          navigate('Success', {
            type: 'UpgradeSubscription',
            title: 'Subscription ',
            title1: 'Upgraded Successfully',
          });
        }, 2000);
        return;
      }
      if (!clientSecret) {
        showMessage('Missing payment client secret');
        return;
      }

      const result = await confirmPayment(clientSecret);

      if (result.error) {
        const {
          code,
          message,
          localizedMessage,
          declineCode,
          stripeErrorCode,
          type,
        } = result.error;

        const finalError =
          localizedMessage ||
          message ||
          `Payment failed: ${
            code || stripeErrorCode || type || 'Unknown error'
          }`;

        const developerError = `${finalError}${
          declineCode ? ` (Decline code: ${declineCode})` : ''
        }`;

        showMessage(developerError);
        return;
      }

      if (result.paymentIntent) {
        showMessage('Payment successful!');
        setTimeout(() => {
          dispatch(profileDetailsRequest());
          navigate('Success', {
            type: 'UpgradeSubscription',
            title: 'Subscription ',
            title1: 'Upgraded Successfully',
          });
        }, 2000);
      }
    } catch (error: any) {
      showMessage(error?.message || 'Unexpected payment error occurred');
    }
  };

  useEffect(() => {
    if (isFocused) {
      switch (status) {
        case 'user/createPaymentSuccess': {
          handleConfirmPayment();
          break;
        }
        case 'user/createPaymentFailure': {
          break;
        }
      }
    }
  }, [status, isFocused]);

  const handlePayment = async () => {
    if (!selectedCardId) {
      showMessage('Please Select a Card');
      return;
    }

    dispatch(
      createPaymentRequest({
        priceId: item?.stripePriceId,
        paymentMethodId: selectedCardId,
      }),
    );
  };

  return (
    <View style={styles.container}>
      <Image source={Images.shape} style={styles.shape} />
      <MyStatusBar
        backgroundColor={'transparent'}
        barStyle={'dark-content'}
        translucent
      />
      <Loader visible={isLoading} />
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
      </View>

      <ScrollView
        style={Css.f1}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[Css.aic, Css.pb20, isIos() ? Css.pt6 : Css.pt8]}
      >
        <SubscriptionPlanItem
          key={item?._id?.toString()}
          index={item?._id}
          item={item}
          marginRight={normalize(10)}
          marginBottom={normalize(12)}
          isHideButton={true}
        />

        <View style={[Css.w100, Css.pl9, Css.pr9]}>
          <Text style={styles.paymentMethodTitle}>Payment Methods</Text>
          {cardListsResponse?.map((method: any, index: number) => {
            const { card, id } = method;
            const brand = card?.brand?.toLowerCase() || 'default';
            const maskedLabel = `${
              card.display_brand?.toUpperCase() || brand
            } •••• ${card.last4}`;
            return (
              <RenderCard
                key={id}
                label={maskedLabel}
                borderBottomWidth={
                  index === cardListsResponse?.length - 1 ? 0 : 1
                }
                isPrimary={index === 0}
                isSelected={selectedCardId === id}
                onPress={() =>
                  setSelectedCardId(prev => (prev === id ? null : id))
                }
              />
            );
          })}

          <Button
            onPress={handlePayment}
            title={'Confirm Plan'}
            width={'100%'}
            marginTop={normalize(5)}
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default UpgradeSubscriptionDetails;

const styles = StyleSheet.create({
  container: { flex: 1 },
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
});

/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Platform,
} from 'react-native';
import { Colors, Fonts, Icons } from '@app/themes';
import { normalize } from '@app/utils/orientation';
import TextInput from '@app/components/common/TextInput';
import Button from '@app/components/common/Button';
import { navigate } from '@app/navigation/RootNaivgation';
import { formatPhoneNumber, hexToRGB } from '@app/utils/helpers';
import {
  CardField,
  CardFieldInput,
  confirmPlatformPaySetupIntent,
  createPaymentMethod,
  isPlatformPaySupported,
  PlatformPay,
  PlatformPayButton,
} from '@stripe/stripe-react-native';
import {
  addCardRequest,
  addPaymentMethodRequest,
  cardListRequest,
} from '@app/store/slice/user.slice';
import { showMessage } from '@app/utils/helpers/Toast';
import { useAppDispatch, useAppSelector } from '@app/store';
import { useIsFocused } from '@react-navigation/native';

interface Props {
  onCancel: () => void;
  onConfirm: (data: {
    cardHolderName: string;
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    billingAddress: string;
  }) => void;
}

type PaymentProps = {
  cardHolderName: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  billingAddress: string;
  bankName: string;
  bankAccountNumber: string;
  bankRoutingNumber: string;
  note: string;
  cardDetails?: CardFieldInput.Details;
  email: string;
  phone: string;
};

const AddNewCard: React.FC<Props> = ({ onCancel, onConfirm }) => {
  const dispatch = useAppDispatch();
  const isFocused = useIsFocused();
  const { status, paymentMethodResponse } = useAppSelector(state => state.user);
  const [isCardFocused, setIsCardFocused] = useState(false);
  const [info, setInfo] = useState<PaymentProps>({
    cardHolderName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    billingAddress: '',
    bankName: '',
    bankAccountNumber: '',
    bankRoutingNumber: '',
    note: '',
    cardDetails: undefined,
    email: '',
    phone: '',
  });

  const [isApplePaySupported, setIsApplePaySupported] = useState(false);
  const [isGooglePaySupported, setIsGooglePaySupported] = useState(false);

  useEffect(() => {
    if (isFocused) {
      switch (status) {
        case 'user/addCardSuccess': {
          dispatch(cardListRequest({}));
          onConfirm({
            cardHolderName: info.cardHolderName,
            cardNumber: info.cardNumber,
            expiryDate: info.expiryDate,
            cvv: info.cvv,
            billingAddress: info.billingAddress,
          });
          setTimeout(() => {
            navigate('Success', {
              type: 'AddNewPaymentCard',
              title: 'Card ',
              subTitle: 'Added',
              title1: 'Successfully',
            });
          }, 1000);
          break;
        }
        case 'user/addCardFailure': {
          break;
        }
      }
    }
  }, [status, isFocused, dispatch]);

  const updateValue = (field: keyof PaymentProps, value: boolean | string) => {
    setInfo(prevState => ({
      ...prevState,
      [field]: value,
    }));
  };

  const handleConfirm = async () => {
    if (!info.cardHolderName) {
      showMessage('Please Enter Cardholder Name');
      return;
    }
    if (!info.email) {
      showMessage('Please Enter Email Address');
      return;
    }
    if (!info.cardDetails) {
      showMessage('Please Enter Card Details');
      return;
    }

    try {
      const result = await createPaymentMethod({
        paymentMethodType: 'Card',
        paymentMethodData: {
          billingDetails: {
            name: info.cardHolderName,
            email: info.email,
            phone: info.phone,
          },
        },
      });
      if (result.paymentMethod) {
        dispatch(
          addCardRequest({ paymentMethodId: result?.paymentMethod?.id }),
        );
      }
    } catch (error) {
      showMessage('Something went wrong');
      console.log('error in handle payement');
    }
  };

  // Check for Platform Pay Support
  useEffect(() => {
    (async () => {
      if (Platform.OS === 'ios') {
        const apple = await isPlatformPaySupported();
        setIsApplePaySupported(apple);
      } else {
        const google = await isPlatformPaySupported({
          googlePay: { testEnv: false }, // Live setting
        });
        setIsGooglePaySupported(google);
      }
    })();
    dispatch(addPaymentMethodRequest({}));
  }, []);

  const pay = async () => {
    try {
      console.log('payemnt method response ==>', paymentMethodResponse);
      const clientSecret = paymentMethodResponse?.clientSecret;
      if (!clientSecret) {
        showMessage('Session expired. Please try again.');
        return;
      }

      let result;

      // FIX: Platform Specific Logic to avoid "must provide googlePay parameter"
      if (Platform.OS === 'ios') {
        result = await confirmPlatformPaySetupIntent(clientSecret, {
          applePay: {
            merchantCountryCode: 'US',
            currencyCode: 'USD',
            cartItems: [
              {
                label: 'Save Card to Account',
                amount: '0.00',
                paymentType: PlatformPay.PaymentType.Immediate,
              },
            ],
          },
        });
      } else {
        result = await confirmPlatformPaySetupIntent(clientSecret, {
          googlePay: {
            testEnv: false, // Live Mode
            merchantName: 'SpeakWide',
            merchantCountryCode: 'US',
            currencyCode: 'USD',
            billingAddressConfig: {
              format: PlatformPay.BillingAddressFormat.Full,
              isRequired: true,
            },
          },
        });
      }

      if (result?.error) {
        if (result.error.code !== 'Canceled') {
          showMessage(result.error.message || 'Payment failed');
        }
        return;
      }

      // Handle successful result
      const paymentMethodId = result?.setupIntent?.paymentMethodId;
      if (paymentMethodId) {
        await dispatch(addCardRequest({ paymentMethodId }));
      }
      dispatch(cardListRequest({}));
    } catch (err) {
      console.error('Platform Pay Exception:', err);
      showMessage('An unexpected error occurred.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Add New Card</Text>
        <TouchableOpacity onPress={onCancel}>
          <Image source={Icons.close} style={styles.closeIcon} />
        </TouchableOpacity>
      </View>

      {/* Form Fields */}
      <TextInput
        title="Card Holder Name"
        value={info.cardHolderName}
        onChangeText={txt => updateValue('cardHolderName', txt)}
        placeholder="Enter holder name"
      />
      <TextInput
        title={'Email'}
        value={info.email}
        onChangeText={txt => updateValue('email', txt)}
        placeholder="Enter your email"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        title={'Phone'}
        value={formatPhoneNumber(info.phone)}
        onChangeText={txt => updateValue('phone', txt.replace(/\D/g, ''))}
        placeholder="Enter your phone number"
        keyboardType="numeric"
        maxLength={14}
      />

      <View style={styles.container_new}>
        <Text style={[styles.cardTitle]}>Card Number</Text>
        <View
          style={{
            borderColor: isCardFocused
              ? hexToRGB(Colors.purple, 0.5)
              : Colors.white_chalk,
          }}
        >
          <CardField
            onFocus={() => setIsCardFocused(true)}
            postalCodeEnabled={false}
            style={{ height: normalize(45), marginTop: normalize(5) }}
            cardStyle={{
              fontSize: normalize(11),
              textColor: Colors.night_blue,
              placeholderColor: Colors.dust,
              fontFamily: Fonts.Inter_SemiBold,
              borderWidth: normalize(1),
              borderColor: Colors.white_chalk,
              borderRadius: normalize(12),
              backgroundColor: Colors.white_lilae,
            }}
            onCardChange={(cardDetails: any) =>
              updateValue('cardDetails', cardDetails)
            }
          />
        </View>
      </View>

      <Button
        title="Save Card"
        onPress={handleConfirm}
        marginTop={normalize(10)}
        isLoading={status === 'user/addCardRequest'}
      />

      <Text style={styles.orText}>OR</Text>

      {((Platform.OS === 'ios' && isApplePaySupported) ||
        (Platform.OS === 'android' && isGooglePaySupported)) && (
        <PlatformPayButton
          onPress={pay}
          type={PlatformPay.ButtonType.Continue}
          appearance={PlatformPay.ButtonStyle.Black}
          borderRadius={14}
          style={styles.payButton}
        />
      )}
    </View>
  );
};

export default AddNewCard;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: normalize(10),
    paddingBottom: normalize(15),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '90%',
  },
  headerTitle: {
    fontFamily: Fonts.Manrope_Medium,
    color: Colors.purple,
    fontSize: normalize(13),
  },
  closeIcon: {
    height: normalize(25),
    width: normalize(25),
    right: normalize(-5),
  },
  container_new: {
    height: normalize(50),
    backgroundColor: Colors.white,
    width: '95%',
    marginBottom: normalize(30),
    paddingHorizontal: normalize(8),
  },
  cardTitle: {
    fontFamily: Fonts.Inter_Medium,
    color: Colors.night_blue,
    fontSize: normalize(13),
    marginTop: normalize(6),
  },

  orText: {
    fontFamily: Fonts.DMSans_Bold,
    marginTop: normalize(10),
    fontSize: normalize(15),
  },
  payButton: {
    width: '90%',
    height: normalize(45),
    marginTop: normalize(10),
    // backgroundColor: Colors.purple,
  },
});

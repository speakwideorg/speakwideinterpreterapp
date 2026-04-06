/* eslint-disable react-hooks/exhaustive-deps */
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import KeyboardAvoidingTemplate from '@app/components/template/KeyboardAvoidingTemplate';
import { normalize } from '@app/utils/orientation';
import { Colors, Fonts, Icons, Images } from '@app/themes';
import Button from '@app/components/common/Button';
import MyStatusBar from '@app/utils/helpers/MyStatusBar';
import {
  isIos,
  validateEmail,
  validPhoneNumber,
} from '@app/utils/helpers/Validation';
import TextInput from '@app/components/common/TextInput';
import { formatPhoneNumber, hexToRGB } from '@app/utils/helpers';
import ExitAppModal from '@app/components/template/ExitPopup';
import { logoutRequest } from '@app/store/slice/auth.slice';
import { useAppDispatch, useAppSelector } from '@app/store';
import {
  CardField,
  CardFieldInput,
  confirmPlatformPaySetupIntent,
  isPlatformPaySupported,
  PlatformPay,
  PlatformPayButton,
  useStripe,
} from '@stripe/stripe-react-native';
import { showMessage } from '@app/utils/helpers/Toast';
import { useIsFocused } from '@react-navigation/native';
import {
  addCardRequest,
  addPaymentMethodRequest,
  cardListRequest,
  resetUserDefaults,
} from '@app/store/slice/user.slice';
import { navigate } from '@app/navigation/RootNaivgation';
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

const AddPaymentCard = () => {
  const dispatch = useAppDispatch();
  const isFocused = useIsFocused();
  const { createPaymentMethod } = useStripe();
  const [isExit, setIsExit] = useState(false);
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
  const { status, isLoading, paymentMethodResponse } = useAppSelector(
    state => state.user,
  );
  const [isDisabled, setIsDisabled] = useState(false);
  const [isInfoVisible, setIsInfoVisible] = useState(false);

  const [isApplePaySupported, setIsApplePaySupported] = useState(false);
  const [isGooglePaySupported, setIsGooglePaySupported] = useState(false);

  const updateValue = (field: keyof PaymentProps, value: boolean | string) => {
    setInfo(prevState => ({
      ...prevState,
      [field]: value,
    }));
  };

  useEffect(() => {
    if (isFocused) {
      switch (status) {
        case 'user/addPaymentMethodSuccess': {
          dispatch(resetUserDefaults());
          break;
        }
        case 'user/addPaymentMethodFailure': {
          dispatch(resetUserDefaults());
          break;
        }
        case 'user/addCardSuccess': {
          dispatch(resetUserDefaults());
          break;
        }
        case 'user/addCardFailure': {
          dispatch(resetUserDefaults());
          break;
        }
      }
    }
  }, [dispatch, isFocused, status]);

  useEffect(() => {
    if (isFocused) {
      dispatch(addPaymentMethodRequest({}));
    }
  }, [isFocused]);

  const handleAddPaymentMethod = async () => {
    Keyboard.dismiss();
    try {
      if (!info.cardHolderName) {
        showMessage('Please Enter Cardholder Name');
        return;
      } else if (!validateEmail(info?.email)) {
        showMessage('Invalid email provided.');
        return;
      } else if (!validPhoneNumber(info?.phone)) {
        showMessage('Invalid phone number provided.');
        return;
      } else if (!info.cardDetails) {
        showMessage('Please Enter Card Details');
        return;
      }

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

      console.log('result is ===>', result);

      if (result.paymentMethod) {
        dispatch(
          addCardRequest({ paymentMethodId: result?.paymentMethod?.id }),
        );
      } else {
        showMessage(result.error.message);
      }
    } catch (error) {
      console.log('error in handle payemnt', error);
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
    <KeyboardAvoidingTemplate
      contentContainerStyle={styles.container}
      loaderEnable={isLoading}
    >
      <View style={styles.main}>
        <ImageBackground source={Images.background} style={styles.background}>
          <MyStatusBar
            backgroundColor={'transparent'}
            barStyle={'dark-content'}
            translucent
          />
          <View style={styles.v}>
            {isInfoVisible && (
              <TouchableWithoutFeedback onPress={() => setIsInfoVisible(false)}>
                <View style={styles.overlay} />
              </TouchableWithoutFeedback>
            )}
            <View style={styles.logoRowContainer}>
              <Image source={Icons.logo} style={styles.logo} />
              <TouchableOpacity
                style={styles.exitContainer}
                onPress={() => {
                  setIsExit(true);
                }}
              >
                <Image
                  source={Icons.icon_exit}
                  style={styles.exit}
                  tintColor={Colors.purple}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.titleRow}>
              <Text style={styles.title}>
                Add
                <Text style={{ fontFamily: Fonts.Manrope_SemiBold }}>
                  {' Payment Method'}
                </Text>
              </Text>
              <View style={styles.infoWrapper}>
                <TouchableOpacity
                  style={styles.iIconContainer}
                  onPress={() => setIsInfoVisible(true)}
                >
                  <Text style={styles.infoText}>i</Text>
                </TouchableOpacity>
                {isInfoVisible && (
                  <View style={styles.tooltip}>
                    <Text style={styles.tooltipText}>
                      <Text style={{ fontFamily: Fonts.Inter_Bold }}>
                        This card is used only for your Speakwide subscription.{' '}
                      </Text>{' '}
                      It will not be used for payouts or receiving payments.
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
          {isExit && (
            <ExitAppModal
              visible={isExit}
              onCancel={() => setIsExit(false)}
              onConfirm={() => {
                setIsExit(false);
                dispatch(logoutRequest({}));
              }}
            />
          )}
        </ImageBackground>

        <View style={styles.v1}>
          <Image
            source={Images.backgroundHeader}
            style={styles.backgroundHeader}
          />

          <TextInput
            title={'Cardholder Name'}
            value={info.cardHolderName}
            onChangeText={txt => updateValue('cardHolderName', txt)}
            placeholder="Enter name on card"
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
            // value={info.phone}
            // onChangeText={txt => updateValue('phone', txt)}

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
          <View style={styles.buttonContainer}>
            <Button
              title="Save"
              onPress={handleAddPaymentMethod}
              //   navigate('Success', {
              //     title: 'Payment Method',
              //     subTitle: 'Successfully Added',
              //     type: 'Payment',
              //   })
              // }
              width={'100%'}
              angle={60}
              isLoading={isLoading}
              // disabled={isDisabled}
            />
          </View>

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

          <TouchableOpacity
            style={styles.skipContainer}
            onPress={() => navigate('SubscriptionSetup')}
          >
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingTemplate>
  );
};

export default AddPaymentCard;

const styles = StyleSheet.create({
  logoRowContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: normalize(40),
    alignItems: 'center',
    marginTop: normalize(isIos() ? 10 : 26),
  },
  logo: {
    height: normalize(40),
    width: normalize(40),
    resizeMode: 'contain',
  },
  exitContainer: {
    width: normalize(25),
    height: normalize(25),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.hawkes_blue,
    borderRadius: normalize(25),
  },
  exit: {
    height: '70%',
    width: '70%',
    resizeMode: 'contain',
  },
  container: {
    paddingBottom: normalize(45),
  },
  main: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  background: {
    width: '100%',
    height: normalize(300),
    position: 'absolute',
  },
  v: {
    paddingHorizontal: normalize(15),
  },
  backContainer: {
    height: normalize(35),
    width: normalize(35),
    resizeMode: 'contain',
    marginTop: normalize(isIos() ? 10 : 26),
    backgroundColor: Colors.white,
    borderRadius: normalize(40),
    justifyContent: 'center',
    alignItems: 'center',
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: normalize(10),
  },
  title: {
    fontSize: normalize(18),
    color: Colors.night_blue,
    fontFamily: Fonts.Manrope_Regular,
  },
  v1: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: normalize(15),
    borderTopRightRadius: normalize(15),
    marginTop: normalize(170),
    alignItems: 'center',
    paddingTop: normalize(5),
  },
  backgroundHeader: {
    width: '100%',
    height: normalize(50),
    resizeMode: 'contain',
    top: normalize(-12),
    position: 'absolute',
  },
  buttonContainer: {
    marginTop: normalize(8),
    flexDirection: 'row',
    width: '90%',
    justifyContent: 'space-between',
  },
  selectionContaier: {
    backgroundColor: Colors.alabaster,
    height: normalize(45),
    flexDirection: 'row',
    width: '90%',
    justifyContent: 'space-between',
    borderRadius: normalize(9),
    borderColor: Colors.blue_chalk,
    borderWidth: normalize(1.5),
    padding: normalize(3),
    marginBottom: normalize(12),
  },
  selectionItem: {
    backgroundColor: Colors.white,
    width: '48%',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: hexToRGB(Colors.melrose, isIos() ? 0.4 : 1),
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 1,
    shadowRadius: normalize(10),
    elevation: 10,
    borderRadius: normalize(8),
  },
  deSelectionItem: {
    width: '48%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectionTitle: {
    fontFamily: Fonts.Inter_Medium,
    color: Colors.night_blue,
    fontSize: normalize(12),
  },
  deSelectionTitle: {
    fontFamily: Fonts.Inter_Regular,
    color: Colors.dark_grey,
    fontSize: normalize(12),
  },
  container_new: {
    height: normalize(50),
    backgroundColor: Colors.white,
    width: '95%',
    marginBottom: normalize(30),
    padding: normalize(8),
  },
  cardTitle: {
    fontFamily: Fonts.Inter_Medium,
    color: Colors.night_blue,
    fontSize: normalize(13),
    marginTop: normalize(6),
    // marginLeft: normalize(8),
  },
  iIconContainer: {
    width: normalize(20),
    height: normalize(20),
    borderRadius: normalize(11),
    borderWidth: normalize(1),
    borderColor: Colors.dark_grey,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: normalize(8),
  },
  infoText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#555',
  },
  infoWrapper: {
    position: 'relative',
    zIndex: 10,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  tooltip: {
    position: 'absolute',
    bottom: normalize(25),
    right: normalize(0),
    backgroundColor: Colors.white,
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(8),
    borderRadius: normalize(8),
    minWidth: normalize(180),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.dark_grey,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
    zIndex: 11,
  },
  tooltipText: {
    color: Colors.night_blue,
    fontSize: normalize(9),
    fontFamily: Fonts.Inter_Medium,
  },
  skipContainer: {
    marginTop: normalize(15),
    marginBottom: normalize(10),
    // backgroundColor: Colors.yellow,
    padding: normalize(10),
  },
  skipText: {
    fontFamily: Fonts.Inter_SemiBold,
    fontSize: normalize(14),
    color: Colors.night_blue,
    textDecorationLine: 'underline',
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

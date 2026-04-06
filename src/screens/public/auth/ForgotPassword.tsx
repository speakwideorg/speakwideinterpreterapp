/* eslint-disable react-hooks/exhaustive-deps */
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  TouchableOpacity,
} from 'react-native';
import React, { useEffect, useMemo, useState } from 'react';
import KeyboardAvoidingTemplate from '@app/components/template/KeyboardAvoidingTemplate';
import { normalize } from '@app/utils/orientation';
import { Colors, Fonts, Icons, Images } from '@app/themes';
import Button from '@app/components/common/Button';
import MyStatusBar from '@app/utils/helpers/MyStatusBar';
import { goBack, navigate } from '@app/navigation/RootNaivgation';
import {
  isIos,
  validateEmail,
  validPhoneNumber,
} from '@app/utils/helpers/Validation';
import TextInput from '@app/components/common/TextInput';
import { showMessage } from '@app/utils/helpers/Toast';
import {
  forgotPasswordRequest,
  resetAuthDefaults,
} from '@app/store/slice/auth.slice';
import { useAppDispatch, useAppSelector } from '@app/store';
import { useIsFocused } from '@react-navigation/native';
import CountryPicker, {
  Country,
  CountryCode,
} from 'react-native-country-picker-modal';
import { formatPhoneNumber } from '@app/utils/helpers';

const ForgotPassword = () => {
  const dispatch = useAppDispatch();
  const isFocused = useIsFocused();
  const { status, message, isLoading } = useAppSelector(state => state.auth);
  const [value, setValue] = useState('');

  const [countryCode, setCountryCode] = useState<CountryCode>('US');
  const [callingCode, setCallingCode] = useState<string>('1');
  const [countryPickerVisible, setCountryPickerVisible] = useState(false);

  /** Detect phone vs email */
  const isPhone = useMemo(() => {
    return /^\d+$/.test(value);
  }, [value]);

  useEffect(() => {
    if (isFocused) {
      switch (status) {
        case 'auth/forgotPasswordSuccess': {
          showMessage(message);
          dispatch(resetAuthDefaults());
          navigate('OtpVerification', {
            type: 'Forgot',
            phoneOrEmail: isPhone ? `+${callingCode}${value}` : value,
          });
          break;
        }
        case 'auth/forgotPasswordFailure': {
          showMessage(message);
          dispatch(resetAuthDefaults());
          break;
        }
      }
    }
  }, [status]);

  const handleForgotPassword = () => {
    if (!validateEmail(value) && !validPhoneNumber(value)) {
      showMessage('Invalid email / phone number provided.');
    } else {
      let payload;
      if (validateEmail(value)) {
        payload = {
          role: 'interpreter',
          type: 'email',
          email: value,
        };
      } else {
        payload = {
          role: 'interpreter',
          type: 'phone',
          phone: `+${callingCode}${value}`,
        };
      }

      dispatch(forgotPasswordRequest(payload));
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
            <TouchableOpacity
              onPress={() => goBack()}
              style={styles.backContainer}
            >
              <Image source={Icons.arrow_right} style={styles.arrow_right} />
            </TouchableOpacity>

            <Text style={styles.title}>
              Forgot{' '}
              <Text style={{ fontFamily: Fonts.Manrope_SemiBold }}>
                Password
              </Text>
            </Text>
            <Text style={styles.subTitle}>
              Please enter your email address or phone number to receive the OTP
            </Text>
          </View>
        </ImageBackground>

        <View style={styles.v1}>
          <Image
            source={Images.backgroundHeader}
            style={styles.backgroundHeader}
          />

          {/* Email / Phone Input */}
          <View style={styles.phoneMainContainer}>
            <Text style={styles.phoneLabel}>Email / Phone</Text>

            <View style={styles.phoneInputWrapper}>
              {/* Country code only for phone */}
              {isPhone && (
                <TouchableOpacity
                  style={styles.countryCodeButton}
                  onPress={() => setCountryPickerVisible(true)}
                >
                  <CountryPicker
                    countryCode={countryCode}
                    withFilter
                    withFlag
                    withCallingCode
                    visible={countryPickerVisible}
                    onSelect={(country: Country) => {
                      setCountryCode(country.cca2);
                      setCallingCode(country.callingCode[0]);
                      setCountryPickerVisible(false);
                    }}
                    onClose={() => setCountryPickerVisible(false)}
                  />
                  <Text style={styles.callingCodeText}>+{callingCode}</Text>
                </TouchableOpacity>
              )}

              <View style={styles.phoneInputContainer}>
                <TextInput
                  // value={value}
                  // onChangeText={setValue}
                  value={isPhone ? formatPhoneNumber(value) : value}
                  onChangeText={
                    isPhone
                      ? (txt: string) => {
                          setValue(txt.replace(/\D/g, ''));
                        }
                      : setValue
                  }
                  placeholder={
                    isPhone
                      ? 'Enter your phone number'
                      : 'Enter your email address'
                  }
                  keyboardType={isPhone ? 'phone-pad' : 'email-address'}
                  maxLength={isPhone ? 14 : undefined}
                  style={styles.phoneInput}
                  width={'100%'}
                  autoCapitalize="none"
                />
              </View>
            </View>
          </View>

          <Button title="Send OTP" onPress={() => handleForgotPassword()} />
        </View>
      </View>
    </KeyboardAvoidingTemplate>
  );
};

export default ForgotPassword;

const styles = StyleSheet.create({
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
  title: {
    fontSize: normalize(18),
    color: Colors.night_blue,
    fontFamily: Fonts.Manrope_Regular,
    marginTop: normalize(10),
  },
  subTitle: {
    fontSize: normalize(12),
    color: Colors.dark_grey,
    fontFamily: Fonts.Inter_Regular,
    marginTop: normalize(isIos() ? 8 : 5),
  },
  v1: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: normalize(15),
    borderTopRightRadius: normalize(15),
    marginTop: normalize(210),
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

  // New Phone Input Styles
  phoneMainContainer: {
    width: '90%',
    marginTop: normalize(15),
  },
  phoneLabel: {
    fontSize: normalize(14),
    fontFamily: Fonts.Inter_Medium,
    color: Colors.night_blue,
    marginBottom: normalize(8),
  },
  phoneInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  countryCodeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(8),
    borderWidth: normalize(1),
    borderColor: Colors.white_chalk,
    borderRadius: normalize(8),
    backgroundColor: Colors.white,
    marginRight: normalize(10),
    minWidth: normalize(70),
  },
  countryPickerButton: {
    // paddingRight: normalize(5),
  },
  callingCodeText: {
    fontSize: normalize(14),
    fontFamily: Fonts.Inter_Regular,
    color: Colors.night_blue,
    marginLeft: normalize(5),
  },
  phoneInputContainer: {
    flex: 1,
  },
  phoneInput: {
    marginTop: 0,
  },
});

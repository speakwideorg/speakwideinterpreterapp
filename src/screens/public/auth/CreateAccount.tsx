import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  Platform,
  useWindowDimensions,
  TouchableOpacity,
} from 'react-native';
import React, { useState } from 'react';
import KeyboardAvoidingTemplate from '@app/components/template/KeyboardAvoidingTemplate';
import { normalize } from '@app/utils/orientation';
import { Colors, Fonts, Icons, Images } from '@app/themes';
import TextInput from '@app/components/common/TextInput';
import Button from '@app/components/common/Button';
import MyStatusBar from '@app/utils/helpers/MyStatusBar';
import { navigate } from '@app/navigation/RootNaivgation';
import {
  isIos,
  validateEmail,
  validateFullName,
  validatePassword,
  validPhoneNumber,
} from '@app/utils/helpers/Validation';
import { Checkbox } from '@app/components/common/Checkbox';
import Picker from '@app/components/common/Picker';
import UserAgreement from './model/UserAgreement';
import { showMessage } from '@app/utils/helpers/Toast';
import { useAppDispatch, useAppSelector } from '@app/store';
import { createAccountRequest } from '@app/store/slice/auth.slice';
import RenderHtml from 'react-native-render-html';
import { ScrollView } from 'react-native-gesture-handler';
import { cmsDetailsRequest } from '@app/store/slice/default.slice';
import CountryPicker, {
  Country,
  CountryCode,
} from 'react-native-country-picker-modal';

type CreaeAccountProps = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirm_password: string;
  terms: boolean;
};

const CreateAccount = () => {
  const { width } = useWindowDimensions();
  const { isLoading, device_token } = useAppSelector(state => state.auth);
  const { cmsDetailsResponse } = useAppSelector(state => state.default);
  const dispatch = useAppDispatch();
  const [visible, setVisible] = useState<boolean>(false);
  const [slug, setSlug] = useState('');
  const [info, setInfo] = useState<CreaeAccountProps>({
    confirm_password: '',
    email: '',
    fullName: '',
    password: '',
    phone: '',
    terms: false,
  });

  const [countryCode, setCountryCode] = useState<CountryCode>('US');
  const [callingCode, setCallingCode] = useState<string>('1');
  const [countryPickerVisible, setCountryPickerVisible] = useState(false);

  const updateValue = (
    field: keyof CreaeAccountProps,
    value: boolean | string,
  ) => {
    setInfo(prevState => ({
      ...prevState,
      [field]: value,
    }));
  };

  const handleCreateAccountValidate = () => {
    if (!validateFullName(info?.fullName)) {
      showMessage('Invalid name provided.');
    } else if (!validateEmail(info?.email)) {
      showMessage('Invalid email provided.');
      // } else if (!validPhoneNumber(info?.phone)) {
      // showMessage('Invalid phone number provided.');
    } else if (!validatePassword(info?.password)) {
      showMessage('Invalid password provided.');
    } else if (!validatePassword(info?.confirm_password)) {
      showMessage('Invalid confirm password provided.');
    } else if (info?.confirm_password?.trim() !== info?.password?.trim()) {
      showMessage('Password mismatch!');
    } else if (!info?.terms) {
      showMessage('Please accept the Terms of Service & Privacy Policy.');
    }
    // else {
    //   setVisible(true);
    // }
    else {
      handleCreateAccount({ isCheck: info.terms });
    }
  };

  const handleCreateAccount = async ({ isCheck }: { isCheck: boolean }) => {
    if (isCheck) {
      setVisible(false);
      const payload = {
        full_name: info?.fullName?.trim(),
        email: info?.email?.trim().toLowerCase(),
        phone: `+${callingCode}${info?.phone}` || '',
        password: info?.password?.trim(),
        confirm_password: info?.confirm_password?.trim(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        deviceToken: device_token,
        deviceType:
          Platform.OS === 'ios'
            ? 'iOS'
            : Platform.OS === 'android'
            ? 'Android'
            : 'Unknown',
      };
      dispatch(createAccountRequest(payload));
    } else {
      showMessage('Please accept the Terms & Condition.');
    }
  };

  const formatPhoneNumber = (phone: string) => {
    if (!phone) return '';

    const cleaned = phone.replace(/\D/g, '');
    const phoneNumberLength = cleaned.length;

    if (phoneNumberLength < 4) return cleaned;

    if (phoneNumberLength < 7) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    }

    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(
      6,
      10,
    )}`;
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
          <Image source={Icons.logo} style={styles.logo} />

          <Text style={styles.title}>
            Get
            <Text style={{ fontFamily: Fonts.Manrope_SemiBold }}>
              {' Started Here'}
            </Text>
          </Text>
        </ImageBackground>

        <View style={styles.v1}>
          <Image
            source={Images.backgroundHeader}
            style={styles.backgroundHeader}
          />
          <TextInput
            title={'Full Name'}
            value={info.fullName}
            onChangeText={txt => updateValue('fullName', txt)}
            placeholder="Enter your full name"
            autoCapitalize="words"
          />
          <TextInput
            title={'Email'}
            value={info.email}
            onChangeText={txt => updateValue('email', txt)}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {/* Fixed Phone Number Section */}
          <View style={styles.phoneMainContainer}>
            <Text style={styles.phoneLabel}>Phone</Text>
            <View style={styles.phoneInputWrapper}>
              <TouchableOpacity
                style={styles.countryCodeButton}
                onPress={() => setCountryPickerVisible(true)}
              >
                <CountryPicker
                  countryCode={countryCode}
                  withFilter
                  withFlag
                  withCallingCode
                  withEmoji
                  visible={countryPickerVisible}
                  onSelect={(country: Country) => {
                    setCountryCode(country.cca2 as CountryCode);
                    setCallingCode(country.callingCode[0]);
                    setCountryPickerVisible(false);
                  }}
                  onClose={() => setCountryPickerVisible(false)}
                  containerButtonStyle={styles.countryPickerButton}
                />
                <Text style={styles.callingCodeText}>+{callingCode}</Text>
              </TouchableOpacity>

              <View style={styles.phoneInputContainer}>
                <TextInput
                  // value={info.phone}
                  value={formatPhoneNumber(info.phone)}
                  onChangeText={txt =>
                    updateValue('phone', txt.replace(/\D/g, ''))
                  }
                  // onChangeText={txt => updateValue('phone', txt)}
                  placeholder="Enter your phone number"
                  keyboardType="numeric"
                  maxLength={14}
                  style={styles.phoneInput}
                  width={'100%'}
                />
              </View>
            </View>
          </View>
          <TextInput
            title={'Password'}
            value={info.password}
            onChangeText={txt => updateValue('password', txt)}
            placeholder="Enter your password"
            secureTextEntry={true}
            autoCapitalize="none"
          />
          <TextInput
            title={'Confirm Password'}
            value={info.confirm_password}
            onChangeText={txt => updateValue('confirm_password', txt)}
            placeholder="Re-enter your password"
            secureTextEntry={true}
            autoCapitalize="none"
          />

          <View style={styles.termsContainer}>
            <Checkbox
              checked={info.terms}
              onChange={() => updateValue('terms', !info.terms)}
            />
            <Text style={styles.terms}>
              {'By creating account, I agree to '}
              <Text
                onPress={() => {
                  dispatch(cmsDetailsRequest({ slug: 'terms-conditions' }));
                  setSlug('Terms & condition');
                  setVisible(true);
                }}
                style={styles.highlight}
              >
                {'Terms of Service'}
              </Text>
              {' & '}
              <Text
                onPress={() => {
                  dispatch(cmsDetailsRequest({ slug: 'privacy-policy' }));
                  setSlug('Privacy Policy');
                  setVisible(true);
                }}
                style={styles.highlight}
              >
                {'Privacy Policy'}
              </Text>
              {' & '}
              <Text
                onPress={() => {
                  dispatch(
                    cmsDetailsRequest({ slug: 'interpreter-agreement' }),
                  );
                  setSlug('User Agreement');
                  setVisible(true);
                }}
                style={styles.highlight}
              >
                {` User Agreement`}
              </Text>
            </Text>
          </View>

          <Button
            title="Create Account"
            onPress={() => handleCreateAccountValidate()}
            marginTop={normalize(32)}
          />

          <Text style={styles.txt}>
            {'Already have an account? '}
            <Text onPress={() => navigate('Login')} style={styles.highlight}>
              Login
            </Text>
          </Text>
        </View>
      </View>
      <Picker
        visible={visible}
        onClose={() => setVisible(false)}
        isShowCloseBtn={true}
      >
        {/* <UserAgreement
          onCancel={() => setVisible(false)}
          onConfirm={(isCheck: boolean) => {
            handleCreateAccount({ isCheck });
          }}
        /> */}
        <Text style={styles.headerModal}>{slug}</Text>
        <ScrollView
          style={{ maxHeight: normalize(450) }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: normalize(10) }}
        >
          <RenderHtml
            contentWidth={width}
            source={{ html: cmsDetailsResponse?.content }}
          />
        </ScrollView>
      </Picker>
    </KeyboardAvoidingTemplate>
  );
};

export default CreateAccount;

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
  logo: {
    height: normalize(40),
    width: normalize(40),
    resizeMode: 'contain',
    marginTop: normalize(isIos() ? 10 : 26),
    marginHorizontal: normalize(8),
  },
  title: {
    fontSize: normalize(18),
    color: Colors.night_blue,
    fontFamily: Fonts.Manrope_Regular,
    marginHorizontal: normalize(15),
    marginTop: normalize(10),
  },
  v1: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: normalize(15),
    borderTopRightRadius: normalize(15),
    marginTop: normalize(155),
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
  termsContainer: {
    width: '90%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: normalize(10),
  },
  terms: {
    fontFamily: Fonts.Inter_Regular,
    fontSize: normalize(12),
    color: Colors.gray,
    width: '90%',
    lineHeight: normalize(18),
    top: normalize(-4),
  },
  highlight: {
    fontFamily: Fonts.Inter_SemiBold,
    color: Colors.night_blue,
  },
  txt: {
    fontFamily: Fonts.Inter_Regular,
    fontSize: normalize(12),
    color: Colors.dark_grey,
    marginVertical: normalize(15),
  },
  headerModal: {
    fontFamily: Fonts.Manrope_SemiBold,
    fontSize: normalize(15),
    color: Colors.night_blue,
    marginBottom: normalize(8),
    textAlign: 'center',
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

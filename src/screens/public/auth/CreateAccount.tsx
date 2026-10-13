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
import React, { useState, useEffect, useRef } from 'react';
import KeyboardAvoidingTemplate from '@app/components/template/KeyboardAvoidingTemplate';
import { normalize } from '@app/utils/orientation';
import { Colors, Fonts, Icons, Images } from '@app/themes';
import TextInput from '@app/components/common/TextInput';
import { CaptchaWebView } from '@app/components/common/CaptchaWebView';
import { CaptchaV2Modal } from '@app/components/common/CaptchaV2Modal';
import { RECAPTCHA_SITE_KEY, BASE_URL_LIVE } from '@env';
import { RECAPTCHA_CONFIG } from '@app/utils/constants';
import Button from '@app/components/common/Button';
import MyStatusBar from '@app/utils/helpers/MyStatusBar';
import { navigate } from '@app/navigation/RootNaivgation';
import {
  isIos,
  validateEmail,
  validateFullName,
  validatePassword,
} from '@app/utils/helpers/Validation';
import { Checkbox } from '@app/components/common/Checkbox';
import Picker from '@app/components/common/Picker';
import { showMessage } from '@app/utils/helpers/Toast';
import { useAppDispatch, useAppSelector } from '@app/store';
import {
  createAccountRequest,
  resetV2Required,
  resetRateLimitCooldown,
} from '@app/store/slice/auth.slice';
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

type RegistrationPhase =
  | 'idle'
  | 'checking-v3'
  | 'submitting'
  | 'awaiting-v2'
  | 'cooldown'
  | 'completed'
  | 'error';

const CreateAccount = () => {
  const { width } = useWindowDimensions();
  const {
    isLoading,
    device_token,
    token,
    status,
    v2Required,
    rateLimitCooldown,
  } = useAppSelector(state => state.auth);
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

  // Registration lifecycle states matching website useRegistrationCaptcha
  const [phase, setPhase] = useState<RegistrationPhase>('idle');
  const [cooldownSeconds, setCooldownSeconds] = useState<number>(0);
  const [v2Message, setV2Message] = useState<string>('');

  // Screen-memory capture for registration payload across v3 and v2 retries
  const pendingPayloadRef = useRef<any>(null);
  const isMountedRef = useRef<boolean>(true);

  // Unmount safety: clear in-memory payload
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      pendingPayloadRef.current = null;
    };
  }, []);

  // Cooldown countdown timer for HTTP 429
  useEffect(() => {
    let interval: any = null;
    if (cooldownSeconds > 0) {
      interval = setInterval(() => {
        setCooldownSeconds(prev => {
          if (prev <= 1) {
            if (interval) clearInterval(interval);
            if (phase === 'cooldown') {
              setPhase('awaiting-v2');
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [cooldownSeconds, phase]);

  // Handle backend HTTP 403 RECAPTCHA_V2_REQUIRED signal
  useEffect(() => {
    if (
      v2Required &&
      (phase === 'submitting' || phase === 'checking-v3')
    ) {
      if (isMountedRef.current) {
        console.log('[CreateAccount] Backend 403 RECAPTCHA_V2_REQUIRED received -> opening v2 checkbox modal');
        setV2Message('');
        setPhase('awaiting-v2');
        dispatch(resetV2Required());
      }
    }
  }, [v2Required, phase, dispatch]);

  // Handle HTTP 429 rate limit signal
  useEffect(() => {
    if (rateLimitCooldown && rateLimitCooldown > 0) {
      if (isMountedRef.current) {
        console.log('[CreateAccount] HTTP 429 Rate limit received, cooldown:', rateLimitCooldown);
        setCooldownSeconds(rateLimitCooldown);
        setPhase('cooldown');
        dispatch(resetRateLimitCooldown());
      }
    }
  }, [rateLimitCooldown, dispatch]);

  // Handle successful registration (token stored -> navigation to onboarding)
  useEffect(() => {
    if (token && phase === 'submitting') {
      if (isMountedRef.current) {
        console.log('[CreateAccount] Registration successful!');
        setPhase('completed');
        pendingPayloadRef.current = null;
      }
    }
  }, [token, phase]);

  // Handle registration failure
  useEffect(() => {
    if (
      status === 'auth/createAccountFailure' &&
      phase === 'submitting'
    ) {
      if (isMountedRef.current) {
        setPhase('error');
      }
    }
  }, [status, phase]);

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
    if (
      phase === 'submitting' ||
      phase === 'checking-v3' ||
      phase === 'cooldown' ||
      cooldownSeconds > 0
    ) {
      return;
    }

    if (!validateFullName(info?.fullName)) {
      showMessage('Invalid name provided.');
    } else if (!validateEmail(info?.email)) {
      showMessage('Invalid email provided.');
    } else if (!validatePassword(info?.password)) {
      showMessage('Invalid password provided.');
    } else if (!validatePassword(info?.confirm_password)) {
      showMessage('Invalid confirm password provided.');
    } else if (info?.confirm_password?.trim() !== info?.password?.trim()) {
      showMessage('Password mismatch!');
    } else if (!info?.terms) {
      showMessage('Please accept the Terms of Service & Privacy Policy.');
    } else {
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
        has_sms_consent: 'false',
        deviceType:
          Platform.OS === 'ios'
            ? 'iOS'
            : Platform.OS === 'android'
            ? 'Android'
            : 'Unknown',
      };

      console.log('[CreateAccount] Triggering Google reCAPTCHA v3 verification (action: interpreter_signup)');
      pendingPayloadRef.current = payload;
      setPhase('checking-v3');
    } else {
      showMessage('Please accept the Terms & Condition.');
    }
  };

  // v3 Token received -> Submit registration with v3 token
  const handleV3Success = (captchaToken: string) => {
    if (!isMountedRef.current) return;
    if (pendingPayloadRef.current) {
      const finalPayload = {
        ...pendingPayloadRef.current,
        recaptchaToken: captchaToken,
        recaptchaVersion: 'v3' as const,
      };
      setPhase('submitting');
      dispatch(createAccountRequest(finalPayload));
    }
  };

  // v3 Error or 10-second timeout -> Fall back directly to v2 modal per specification
  const handleV3Error = (err: string) => {
    if (!isMountedRef.current) return;
    console.log('[CreateAccount] v3 failed or timed out. Falling back to v2 checkbox:', err);
    setPhase('awaiting-v2');
  };

  // v2 Solved -> Automatically resubmit payload with v2 token
  const handleV2Solved = (v2Token: string) => {
    if (!isMountedRef.current) return;
    console.log('[CreateAccount] v2 solved successfully -> submitting with v2 token');
    if (pendingPayloadRef.current) {
      const finalPayload = {
        ...pendingPayloadRef.current,
        recaptchaToken: v2Token,
        recaptchaVersion: 'v2' as const,
      };
      setPhase('submitting');
      dispatch(createAccountRequest(finalPayload));
    }
  };

  // v2 Dismissed or Back pressed -> Keep entered details, return to idle
  const handleV2Cancel = () => {
    if (!isMountedRef.current) return;
    console.log('[CreateAccount] v2 cancelled by user -> returning to form');
    setPhase('idle');
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
    <>
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
              autoCapitalize="none"
              keyboardType="email-address"
            />

            {/* Redesigned Phone Number Input with Country Picker */}
            <View style={styles.phoneMainContainer}>
              <Text style={styles.phoneLabel}>Phone Number</Text>
              <View style={styles.phoneInputWrapper}>
                <TouchableOpacity
                  style={styles.countryCodeButton}
                  onPress={() => setCountryPickerVisible(true)}
                  activeOpacity={0.8}
                >
                  <CountryPicker
                    countryCode={countryCode}
                    withFilter
                    withFlag
                    withCallingCode
                    withAlphaFilter
                    onSelect={(country: Country) => {
                      setCountryCode(country.cca2);
                      setCallingCode(country.callingCode[0] || '1');
                    }}
                    visible={countryPickerVisible}
                    onClose={() => setCountryPickerVisible(false)}
                    containerButtonStyle={styles.countryPickerButton}
                  />
                  <Text style={styles.callingCodeText}>+{callingCode}</Text>
                </TouchableOpacity>

                <View style={styles.phoneInputContainer}>
                  <TextInput
                    value={formatPhoneNumber(info?.phone)}
                    onChangeText={txt => {
                      const cleaned = txt.replace(/\D/g, '');
                      updateValue('phone', cleaned);
                    }}
                    placeholder="Enter phone number"
                    keyboardType="phone-pad"
                    maxLength={14}
                    style={styles.phoneInput}
                  />
                </View>
              </View>
            </View>

            <TextInput
              title={'Password'}
              value={info.password}
              onChangeText={txt => updateValue('password', txt)}
              placeholder="Enter your password"
              secureTextEntry
            />
            <TextInput
              title={'Confirm Password'}
              value={info.confirm_password}
              onChangeText={txt => updateValue('confirm_password', txt)}
              placeholder="Re-enter your password"
              secureTextEntry
            />

            <View style={styles.termsContainer}>
              <Checkbox
                checked={info.terms}
                onChange={() => updateValue('terms', !info.terms)}
              />
              <Text style={styles.terms}>
                By creating an account, you agree to our
                <Text
                  onPress={() => {
                    dispatch(
                      cmsDetailsRequest({
                        slug: 'terms_and_conditions',
                      }),
                    );
                    setSlug('Terms of Service');
                    setVisible(true);
                  }}
                  style={styles.highlight}
                >
                  {` Terms of Service `}
                </Text>
                and
                <Text
                  onPress={() => {
                    dispatch(
                      cmsDetailsRequest({
                        slug: 'privacy_policy',
                      }),
                    );
                    setSlug('Privacy Policy');
                    setVisible(true);
                  }}
                  style={styles.highlight}
                >
                  {` Privacy Policy`}
                </Text>
                {`, and `}
                <Text
                  onPress={() => {
                    dispatch(
                      cmsDetailsRequest({
                        slug: 'user_agreement',
                      }),
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
              title={
                cooldownSeconds > 0
                  ? `Retry in ${cooldownSeconds}s`
                  : phase === 'awaiting-v2'
                  ? 'Security Verification Required'
                  : phase === 'submitting' || phase === 'checking-v3'
                  ? 'Creating Account...'
                  : 'Create Account'
              }
              disabled={
                phase === 'submitting' ||
                phase === 'checking-v3' ||
                phase === 'cooldown' ||
                phase === 'awaiting-v2' ||
                cooldownSeconds > 0
              }
              onPress={() => handleCreateAccountValidate()}
              marginTop={normalize(32)}
            />

            {cooldownSeconds > 0 && (
              <Text style={styles.cooldownText}>
                Try again in {cooldownSeconds} seconds. Your details are saved.
              </Text>
            )}

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

      {/* Invisible reCAPTCHA v3 execution */}
      {phase === 'checking-v3' && (
        <CaptchaWebView
          siteKey={RECAPTCHA_CONFIG.v3_site_key || RECAPTCHA_SITE_KEY}
          baseUrl={BASE_URL_LIVE}
          onSuccess={handleV3Success}
          onError={handleV3Error}
        />
      )}

      {/* Interactive reCAPTCHA v2 checkbox modal fallback */}
      <CaptchaV2Modal
        visible={
          phase === 'awaiting-v2' ||
          phase === 'cooldown' ||
          (phase === 'submitting' &&
            pendingPayloadRef.current?.recaptchaVersion === 'v2')
        }
        siteKey={RECAPTCHA_CONFIG.v2_site_key}
        pageUrl={RECAPTCHA_CONFIG.v2_page_url}
        isSubmitting={phase === 'submitting'}
        cooldown={cooldownSeconds}
        message={v2Message}
        onSolved={handleV2Solved}
        onClose={handleV2Cancel}
      />
    </>
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
  cooldownText: {
    color: '#DC2626',
    fontFamily: Fonts.Inter_Medium,
    fontSize: normalize(12),
    textAlign: 'center',
    marginTop: normalize(8),
  },
});

import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  TouchableOpacity,
  Platform,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import KeyboardAvoidingTemplate from '@app/components/template/KeyboardAvoidingTemplate';
import { normalize } from '@app/utils/orientation';
import { Colors, Fonts, Icons, Images } from '@app/themes';
import TextInput from '@app/components/common/TextInput';
import Button from '@app/components/common/Button';
import MyStatusBar from '@app/utils/helpers/MyStatusBar';
import { navigate, reset } from '@app/navigation/RootNaivgation';
import {
  isIos,
  validateEmail,
  validatePassword,
} from '@app/utils/helpers/Validation';
import { Checkbox } from '@app/components/common/Checkbox';
import { signInRequest } from '@app/store/slice/auth.slice';
import { useAppDispatch, useAppSelector } from '@app/store';
import { showMessage } from '@app/utils/helpers/Toast';
import Storage from '@app/utils/storage';
import { useIsFocused } from '@react-navigation/native';
import { getFcmToken } from '@app/utils/helpers/NotificationService';

type LoginProps = {
  email: string;
  password: string;
  isRemember: boolean;
};

const Login = () => {
  const isFocused = useIsFocused();
  const { status, isLoading, device_token } = useAppSelector(
    state => state.auth,
  );

  const dispatch = useAppDispatch();
  const [info, setInfo] = useState<LoginProps>({
    email: '',
    password: '',
    isRemember: false,
  });

  const updateValue = (field: keyof LoginProps, value: boolean | string) => {
    setInfo(prevState => ({
      ...prevState,
      [field]: value,
    }));
  };

  const handleLogin = async () => {
    const _token = await getFcmToken();
    console.log('token==>', _token);
    if (!validateEmail(info?.email)) {
      showMessage('Invalid email provided.');
    } else if (!validatePassword(info?.password)) {
      showMessage('Invalid password provided.');
    } else {
      const payload = {
        user_name: info?.email?.trim().toLowerCase(),
        password: info?.password?.trim(),
        deviceToken: device_token || _token,
        isRemember: info?.isRemember,
        deviceType:
          Platform.OS === 'ios'
            ? 'iOS'
            : Platform.OS === 'android'
            ? 'Android'
            : 'Unknown',
      };
      dispatch(signInRequest(payload));
    }
  };

  useEffect(() => {
    const loadRememberedCredentials = async () => {
      const rememberMe = await Storage.getItem('remember_me');
      if (rememberMe === 'true') {
        const savedEmail = await Storage.getItem('remember_email');
        const savedPassword = await Storage.getItem('remember_password');
        setInfo(prevState => ({
          ...prevState,
          email: savedEmail || '',
          password: savedPassword || '',
          isRemember: true,
        }));
      }
    };
    if (isFocused) {
      loadRememberedCredentials();
    }
  }, [isFocused]);
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
            Welcome to
            {
              <Text style={{ fontFamily: Fonts.Manrope_SemiBold }}>
                {' Speakwide!'}
              </Text>
            }
          </Text>
          <Text style={styles.subTitle}>
            Enter your email and password to access your account.
          </Text>
        </ImageBackground>

        <View style={styles.v1}>
          <Image
            source={Images.backgroundHeader}
            style={styles.backgroundHeader}
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
            title={'Password'}
            value={info.password}
            onChangeText={txt => updateValue('password', txt)}
            placeholder="Enter your password"
            secureTextEntry={true}
            autoCapitalize="none"
          />

          <View style={styles.v2}>
            <View style={styles.remember}>
              <Checkbox
                checked={info.isRemember}
                onChange={() => updateValue('isRemember', !info.isRemember)}
              />
              <Text style={styles.rememberText}>Remember Me</Text>
            </View>
            <TouchableOpacity onPress={() => navigate('ForgotPassword')}>
              <Text style={styles.forgot}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          <Button
            title="Login"
            onPress={() => {
              handleLogin();
            }}
            marginTop={normalize(32)}
          />

          <Text style={styles.txt}>
            {"Don't have an account? "}
            <Text
              onPress={() => reset(0, 'CreateAccount')}
              style={styles.forgot}
            >
              Create Account
            </Text>
          </Text>
        </View>
      </View>
    </KeyboardAvoidingTemplate>
  );
};

export default Login;

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
  subTitle: {
    fontSize: normalize(12),
    color: Colors.dark_grey,
    fontFamily: Fonts.Inter_Regular,
    marginTop: normalize(isIos() ? 8 : 5),
    marginHorizontal: normalize(15),
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
  v2: {
    width: '90%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: normalize(10),
  },
  remember: {
    flexDirection: 'row',
    alignSelf: 'center',
    width: '50%',
  },
  rememberText: {
    fontFamily: Fonts.Inter_Regular,
    fontSize: normalize(12),
    color: Colors.gray,
    width: '90%',
    marginLeft: normalize(8),
  },
  forgot: {
    fontFamily: Fonts.Inter_SemiBold,
    color: Colors.night_blue,
    fontSize: normalize(12),
  },
  txt: {
    fontFamily: Fonts.Inter_Regular,
    fontSize: normalize(12),
    color: Colors.dark_grey,
    marginVertical: normalize(15),
  },
});

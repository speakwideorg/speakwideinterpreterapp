/* eslint-disable react-hooks/exhaustive-deps */
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import React, { FC, useEffect, useState } from 'react';
import KeyboardAvoidingTemplate from '@app/components/template/KeyboardAvoidingTemplate';
import { normalize } from '@app/utils/orientation';
import { Colors, Fonts, Icons, Images } from '@app/themes';
import Button from '@app/components/common/Button';
import MyStatusBar from '@app/utils/helpers/MyStatusBar';
import { goBack, navigate } from '@app/navigation/RootNaivgation';
import { isIos, validateEmail } from '@app/utils/helpers/Validation';
import OTPInput from '@app/components/common/OTPInput';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '@app/types';
import { showMessage } from '@app/utils/helpers/Toast';
import { useAppDispatch, useAppSelector } from '@app/store';
import {
  forgotPasswordRequest,
  resetAuthDefaults,
  verifyOtpRequest,
} from '@app/store/slice/auth.slice';
import { useIsFocused } from '@react-navigation/native';

const OtpVerification: FC<
  StackScreenProps<RootStackParamList, 'OtpVerification'>
> = ({ route }) => {
  const { type, phoneOrEmail } = route?.params;
  const dispatch = useAppDispatch();
  const isFocused = useIsFocused();
  const { status, message, isLoading } = useAppSelector(state => state.auth);

  const [otp, setOTP] = useState<string>('');
  const [timer, setTimer] = useState<number>(90);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isShowLoading, setIsShowLoading] = useState<boolean>(false);
  const [isClear, setIsClear] = useState<boolean>(false);

  const isStart = true;

  useEffect(() => {
    // let interval: NodeJS.Timeout;
    let interval: ReturnType<typeof setTimeout>;

    if (isRunning && timer > 0) {
      interval = setInterval(() => {
        setTimer(prevTimer => prevTimer - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsRunning(false);
    }

    return () => {
      clearInterval(interval);
    };
  }, [isRunning, timer]);

  useEffect(() => {
    if (isStart) {
      startTimer();
    } else {
      resetTimer(false);
    }
  }, [isStart]);

  useEffect(() => {
    if (isFocused) {
      switch (status) {
        case 'auth/verifyOtpSuccess': {
          showMessage(message);
          dispatch(resetAuthDefaults());
          navigate('ResetPassword', { phoneOrEmail: phoneOrEmail });
          // navigate('OtpVerification', { type: 'Forgot', phoneOrEmail: value });
          break;
        }
        case 'auth/verifyOtpFailure': {
          showMessage(message);
          dispatch(resetAuthDefaults());
          break;
        }
        case 'auth/forgotPasswordSuccess': {
          showMessage(message);
          dispatch(resetAuthDefaults());
          setTimer(90);
          setIsRunning(false);
          setTimeout(() => {
            startTimer();
          }, 2000);
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

  const startTimer = () => {
    if (!isRunning) {
      setIsRunning(true);
    }
  };

  const resetTimer = (start: boolean) => {
    let payload;
    if (validateEmail(phoneOrEmail)) {
      payload = {
        role: 'interpreter',
        type: 'email',
        email: phoneOrEmail,
      };
    } else {
      payload = {
        role: 'interpreter',
        type: 'phone',
        phone: phoneOrEmail,
      };
    }
    dispatch(forgotPasswordRequest(payload));
  };

  const formatTime = (time: number): string => {
    const minutes = String(Math.floor(time / 60)).padStart(2, '0');
    const seconds = String(time % 60).padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  const handleNext = () => {
    if (otp.trim().length < 4) {
      showMessage(`Please Enter the OTP`);
    } else {
      if (validateEmail(phoneOrEmail)) {
        dispatch(
          verifyOtpRequest({
            type: 'email',
            otp: otp,
            role: 'interpreter',
            email: phoneOrEmail,
          }),
        );
      } else {
        dispatch(
          verifyOtpRequest({
            type: 'phone',
            otp: otp,
            role: 'interpreter',
            phone: phoneOrEmail,
          }),
        );
      }

      //
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
              OTP{' '}
              {
                <Text style={{ fontFamily: Fonts.Manrope_SemiBold }}>
                  Verification
                </Text>
              }
            </Text>
            <Text style={styles.subTitle}>
              {'OTP (one Time Password) has been sent to'}
            </Text>
            <Text style={styles.subTitle2}>{phoneOrEmail}</Text>
            {/* ******123@gmail.com */}
          </View>
        </ImageBackground>

        <View style={styles.v1}>
          <Image
            source={Images.backgroundHeader}
            style={styles.backgroundHeader}
          />

          <OTPInput
            reset={isClear}
            onChangeOTP={(otp: any) => setOTP(otp)}
            width="75%"
            marginTop={normalize(25)}
          />

          <Button
            title="Next" // Submit
            onPress={() => {
              // if (type === 'CreateAccount') {
              //   navigate('ProfileSetup');
              // } else {
              // navigate('ResetPassword');
              // }

              handleNext();
            }}
            marginTop={normalize(45)}
          />

          <Text style={styles.txt}>Did’nt receive code</Text>

          <View style={styles.timerContainer}>
            <TouchableOpacity
              disabled={isRunning}
              onPress={() => {
                setIsClear(true);
                resetTimer(true);
              }}
            >
              {isShowLoading ? (
                <ActivityIndicator color={Colors.night_blue} />
              ) : (
                <Text style={styles.timerText}>Resend - </Text>
              )}
            </TouchableOpacity>
            <Text style={[styles.timer]}>
              {!isRunning ? `00:00` : formatTime(timer)}
            </Text>
          </View>
        </View>
      </View>
    </KeyboardAvoidingTemplate>
  );
};

export default OtpVerification;

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
    marginTop: normalize(25),
  },
  subTitle: {
    fontSize: normalize(12),
    color: Colors.dark_grey,
    fontFamily: Fonts.Inter_Regular,
    marginTop: normalize(isIos() ? 8 : 5),
  },
  subTitle2: {
    fontSize: normalize(12),
    color: Colors.night_blue,
    fontFamily: Fonts.Inter_SemiBold,
    marginTop: normalize(3),
  },
  v1: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: normalize(15),
    borderTopRightRadius: normalize(15),
    marginTop: normalize(isIos() ? 220 : 225),
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
  txt: {
    color: Colors.night_blue,
    fontSize: normalize(13),
    fontFamily: Fonts.Inter_Regular,
    marginTop: normalize(18),
  },
  timerContainer: {
    flexDirection: 'row',
    alignSelf: 'center',
    marginTop: normalize(5),
  },
  timerText: {
    fontFamily: Fonts.Inter_Regular,
    color: Colors.purple,
    fontSize: normalize(12),
  },
  timer: {
    color: Colors.dark_grey,
    fontFamily: Fonts.Inter_Regular,
    textAlign: 'right',
  },
});

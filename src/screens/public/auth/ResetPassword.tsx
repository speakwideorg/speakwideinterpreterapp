/* eslint-disable react-hooks/exhaustive-deps */
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  TouchableOpacity,
} from 'react-native';
import React, { FC, useEffect, useState } from 'react';
import KeyboardAvoidingTemplate from '@app/components/template/KeyboardAvoidingTemplate';
import { normalize } from '@app/utils/orientation';
import { Colors, Fonts, Icons, Images } from '@app/themes';
import Button from '@app/components/common/Button';
import MyStatusBar from '@app/utils/helpers/MyStatusBar';
import { goBack, navigate } from '@app/navigation/RootNaivgation';
import {
  isIos,
  validateEmail,
  validatePassword,
} from '@app/utils/helpers/Validation';
import TextInput from '@app/components/common/TextInput';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '@app/types';
import { useAppDispatch, useAppSelector } from '@app/store';
import { useIsFocused } from '@react-navigation/native';
import { showMessage } from '@app/utils/helpers/Toast';
import {
  forgetChangePasswordRequest,
  resetAuthDefaults,
} from '@app/store/slice/auth.slice';

const ResetPassword: FC<
  StackScreenProps<RootStackParamList, 'ResetPassword'>
> = ({ route }) => {
  const { phoneOrEmail } = route?.params;
  const dispatch = useAppDispatch();
  const isFocused = useIsFocused();
  const { status, message, isLoading } = useAppSelector(state => state.auth);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (isFocused) {
      switch (status) {
        case 'auth/forgetChangePasswordSuccess': {
          showMessage(message);
          dispatch(resetAuthDefaults());
          navigate('Login');
          // navigate('OtpVerification', { type: 'Forgot', phoneOrEmail: value });
          break;
        }
        case 'auth/forgetChangePasswordFailure': {
          showMessage(message);
          dispatch(resetAuthDefaults());
          break;
        }
      }
    }
  }, [status]);

  const handleResetPassword = () => {
    if (!validatePassword(password) || !validatePassword(confirmPassword)) {
      showMessage(`Please enter correct password`);
    } else {
      let payload;
      if (validateEmail(phoneOrEmail)) {
        payload = {
          type: 'email',
          email: phoneOrEmail,
          new_password: password,
          confirm_password: confirmPassword,
        };
      } else {
        payload = {
          type: 'phone',
          phone: phoneOrEmail,
          new_password: password,
          confirm_password: confirmPassword,
        };
      }
      dispatch(forgetChangePasswordRequest(payload));
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
              {'Create '}
              {
                <Text style={{ fontFamily: Fonts.Manrope_SemiBold }}>
                  New Password
                </Text>
              }
            </Text>
            <Text style={styles.subTitle}>
              {'Enter your new password below to complete the reset process'}
            </Text>
          </View>
        </ImageBackground>

        <View style={styles.v1}>
          <Image
            source={Images.backgroundHeader}
            style={styles.backgroundHeader}
          />

          <TextInput
            title={'New Password'}
            value={password}
            onChangeText={txt => setPassword(txt)}
            placeholder="**********"
            placeholderColor={Colors.dark_grey}
            secureTextEntry={true}
            isPlaceholderIncludeStar={true}
          />

          <TextInput
            title={'Confirm Password'}
            value={confirmPassword}
            onChangeText={txt => setConfirmPassword(txt)}
            placeholder="**********"
            placeholderColor={Colors.dark_grey}
            secureTextEntry={true}
            isPlaceholderIncludeStar={true}
          />

          <Button
            title="Submit"
            onPress={() => handleResetPassword()}
            // navigate('Success', {
            //   title: 'Password Reset\nSuccessfully',
            //   type: 'ResetPassword',
            // })
          />
        </View>
      </View>
    </KeyboardAvoidingTemplate>
  );
};

export default ResetPassword;

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
});

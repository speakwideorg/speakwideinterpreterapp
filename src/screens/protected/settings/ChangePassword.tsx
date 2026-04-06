/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ImageBackground,
} from 'react-native';
import { Colors, Fonts, Icons, Images } from '@app/themes';
import { normalize } from '@app/utils/orientation';
import TextInput from '@app/components/common/TextInput';
import Button from '@app/components/common/Button';
import { goBack, navigate } from '@app/navigation/RootNaivgation';
import { useAppDispatch, useAppSelector } from '@app/store';
import { useIsFocused } from '@react-navigation/native';
import { isIos, validatePassword } from '@app/utils/helpers/Validation';
import { showMessage } from '@app/utils/helpers/Toast';
import {
  changePasswordRequest,
  resetUserDefaults,
} from '@app/store/slice/user.slice';
import MyStatusBar from '@app/utils/helpers/MyStatusBar';
import KeyboardAvoidingTemplate from '@app/components/template/KeyboardAvoidingTemplate';

interface Props {
  onCancel: () => void;
  onConfirm: (data: {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => void;
}

const ChangePassword: React.FC<Props> = () => {
  const dispatch = useAppDispatch();
  const isFocused = useIsFocused();
  const { status, isLoading } = useAppSelector(state => state.user);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (isFocused) {
      switch (status) {
        case 'user/changePasswordSuccess': {
          setConfirmPassword('');
          setNewPassword('');
          setOldPassword('');
          navigate('Success', {
            type: 'ChangePassword',
            title: 'Password ',
            title1: 'Reset',
            subTitle: 'Successfully',
            title2: 'Back to Settings',
          });
          dispatch(resetUserDefaults());
          // navigate('OtpVerification', { type: 'Forgot', phoneOrEmail: value });
          break;
        }
        case 'user/changePasswordFailure': {
          dispatch(resetUserDefaults());
          break;
        }
      }
    }
  }, [status]);

  const handleConfirm = () => {
    if (
      !validatePassword(oldPassword) ||
      !validatePassword(newPassword) ||
      !validatePassword(confirmPassword)
    ) {
      showMessage(`Please enter correct password`);
    } else {
      let payload = {
        old_password: oldPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      };
      dispatch(changePasswordRequest(payload));
    }
  };

  // const handleConfirmreal = () => {
  //   onConfirm({ oldPassword, newPassword, confirmPassword });
  //   setTimeout(() => {
  //     navigate('Success', {
  //       type: 'ChangePassword',
  //       title: 'Password ',
  //       title1: 'Reset',
  //       subTitle: 'Successfully',
  //     });
  //   }, 1000);
  // };

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
              {'Change '}
              {
                <Text style={{ fontFamily: Fonts.Manrope_SemiBold }}>
                  Password
                </Text>
              }
            </Text>
            <Text style={styles.subTitle}>
              {
                'Enter your new password below to complete the change password process'
              }
            </Text>
          </View>
        </ImageBackground>

        <View style={styles.v1}>
          <Image
            source={Images.backgroundHeader}
            style={styles.backgroundHeader}
          />

          <TextInput
            title="Old Password"
            value={oldPassword}
            onChangeText={setOldPassword}
            placeholder="Enter old password"
            secureTextEntry
            width={'100%'}
          />

          <TextInput
            title="New Password"
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Enter new password"
            secureTextEntry
            width={'100%'}
          />

          <TextInput
            title="Re-enter Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm new password"
            secureTextEntry
            width={'100%'}
          />

          <Button
            title="Reset Password"
            onPress={handleConfirm}
            marginTop={normalize(15)}
            width={'100%'}
          />
        </View>
      </View>
    </KeyboardAvoidingTemplate>
  );
};

export default ChangePassword;

const styles = StyleSheet.create({
  container: {
    paddingBottom: normalize(45),
  },
  main: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingTop: normalize(10),
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
    paddingTop: normalize(10),
    paddingHorizontal: normalize(10),
  },
  backgroundHeader: {
    width: '100%',
    height: normalize(50),
    resizeMode: 'contain',
    top: normalize(-12),
    position: 'absolute',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '90%',
    marginBottom: normalize(8),
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
});

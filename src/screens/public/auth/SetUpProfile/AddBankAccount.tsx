/* eslint-disable react-hooks/exhaustive-deps */
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  Dimensions,
  TouchableOpacity,
  Linking,
  TouchableWithoutFeedback,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import KeyboardAvoidingTemplate from '@app/components/template/KeyboardAvoidingTemplate';
import { normalize } from '@app/utils/orientation';
import { Colors, Fonts, Icons, Images } from '@app/themes';
import Button from '@app/components/common/Button';
import MyStatusBar from '@app/utils/helpers/MyStatusBar';
import { isIos } from '@app/utils/helpers/Validation';
import { useAppDispatch, useAppSelector } from '@app/store';
import {
  logoutRequest,
  updateOnboardingStatus,
} from '@app/store/slice/auth.slice';
import ExitAppModal from '@app/components/template/ExitPopup';
import {
  addBankAccountRequest,
  bankAccountListRequest,
  resetUserDefaults,
  updateBankStatusRequest,
} from '@app/store/slice/user.slice';
import { useIsFocused } from '@react-navigation/native';
import useIsAppForeground from '@app/utils/hooks/useAppForeground';
import { navigate } from '@app/navigation/RootNaivgation';

const AddBankAccount = () => {
  const dispatch = useAppDispatch();
  const isFocused = useIsFocused();
  const isForeground = useIsAppForeground();
  const { status, isLoading, addBankAccountResponse, bankAccountListResponse } =
    useAppSelector(state => state.user);

  const [isExit, setIsExit] = useState(false);
  const [isInfoVisible, setIsInfoVisible] = useState(false);

  useEffect(() => {
    if (isForeground && isFocused) {
      dispatch(bankAccountListRequest({}));
    }
  }, [isForeground]);

  useEffect(() => {
    switch (status) {
      case 'user/addBankAccountSuccess': {
        dispatch(resetUserDefaults());
        Linking.openURL(addBankAccountResponse.link);
        break;
      }
      case 'user/addBankAccountFailure': {
        dispatch(resetUserDefaults());
        break;
      }
      case 'user/bankAccountListSuccess': {
        dispatch(resetUserDefaults());
        if (bankAccountListResponse?.length) {
          dispatch(updateBankStatusRequest({ isBankAccountAdded: true }));
        }
        break;
      }
      case 'user/bankAccountListFailure': {
        dispatch(resetUserDefaults());
        break;
      }
      case 'user/updateBankStatusSuccess': {
        dispatch(resetUserDefaults());
        break;
      }
      case 'user/updateBankStatusFailure': {
        dispatch(resetUserDefaults());
        break;
      }
    }
  }, [status, isFocused, dispatch]);

  const handleAddBankAccount = () => {
    dispatch(addBankAccountRequest({}));
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
                Add New
                <Text style={{ fontFamily: Fonts.Manrope_SemiBold }}>
                  {' Bank Account.'}
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
                        This bank account is used only to receive your earnings.{' '}
                      </Text>{' '}
                      Speakwide will never charge this account.
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
          <View style={styles.imageContainer}>
            <Image style={styles.imageStyle} source={Images.persona_back} />
          </View>

          <Button
            title="Add Bank Account"
            onPress={() => {
              handleAddBankAccount();
            }}
            marginTop={normalize(20)}
          />
          <TouchableOpacity
            style={styles.skipContainer}
            onPress={() => dispatch(updateOnboardingStatus('completed'))}
          >
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingTemplate>
  );
};

export default AddBankAccount;

const styles = StyleSheet.create({
  container: { paddingBottom: normalize(45) },
  main: { flex: 1, backgroundColor: Colors.white },
  background: { width: '100%', height: normalize(300), position: 'absolute' },
  v: { paddingHorizontal: normalize(15) },
  logoRowContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: normalize(40),
    alignItems: 'center',
    marginTop: normalize(30),
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
  title: {
    fontSize: normalize(18),
    color: Colors.night_blue,
    fontFamily: Fonts.Manrope_Regular,
    marginTop: normalize(10),
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
    marginTop: normalize(160),
    alignItems: 'center',
    paddingTop: normalize(5),
    width: '100%',
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
  imageContainer: {
    width: Dimensions.get('screen').width,
    height: normalize(200),
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderRadius: normalize(20),
    marginTop: normalize(-10),
  },
  imageStyle: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  statusText: {
    width: '100%',
    color: Colors.black,
    fontFamily: Fonts.DMSans_SemiBold,
    fontSize: 20,
    textAlign: 'center',
    marginTop: normalize(20),
    textTransform: 'capitalize',
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
    marginTop: normalize(12),
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
});

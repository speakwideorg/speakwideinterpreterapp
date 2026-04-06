import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import React, { useState } from 'react';
import KeyboardAvoidingTemplate from '@app/components/template/KeyboardAvoidingTemplate';
import { normalize } from '@app/utils/orientation';
import { Colors, Fonts, Icons, Images } from '@app/themes';
import Button from '@app/components/common/Button';
import MyStatusBar from '@app/utils/helpers/MyStatusBar';
import { isIos } from '@app/utils/helpers/Validation';
import { Inquiry, Environment } from 'react-native-persona';
import { useAppDispatch, useAppSelector } from '@app/store';
import { PERSONA_KEY, PERSONA_KEY_LIVE } from '@env';
import {
  logoutRequest,
  profileDetailsRequest,
} from '@app/store/slice/auth.slice';
import ExitAppModal from '@app/components/template/ExitPopup';

const PersonaValidation = () => {
  const dispatch = useAppDispatch();
  const userId = useAppSelector(state => state.auth.userId);
  const personaVerifyStatus = useAppSelector(
    state => state.auth.profileDetailsResponse?.personaVerifyStatus,
  );
  const [isExit, setIsExit] = useState(false);

  return (
    <KeyboardAvoidingTemplate contentContainerStyle={styles.container}>
      <View style={styles.main}>
        <ImageBackground source={Images.background} style={styles.background}>
          <MyStatusBar
            backgroundColor={'transparent'}
            barStyle={'dark-content'}
            translucent
          />
          <View style={styles.v}>
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

            <Text style={styles.title}>
              Verify yourself with
              <Text style={{ fontFamily: Fonts.Manrope_SemiBold }}>
                {' Persona.'}
              </Text>
            </Text>
          </View>
          {/* <Image source={Icons.logo} style={styles.logo} />

          <Text style={styles.title}>
            Verify yourself with
            <Text style={{ fontFamily: Fonts.Manrope_SemiBold }}>
              {' Persona.'}
            </Text>
          </Text>
          <Text style={styles.subTitle}>
            You will need to show your ID proof and take your selfie in this
            step.
          </Text> */}
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
          <Text style={styles.statusText}>
            {'Current status: ' +
              (personaVerifyStatus ? personaVerifyStatus : 'Incomplete')}
          </Text>

          <Button
            title="Verify Your ID"
            onPress={() => {
              // Inquiry.fromTemplate(PERSONA_KEY)
              //   .environment(Environment.SANDBOX)
              Inquiry.fromTemplate(PERSONA_KEY_LIVE)
                .environment(Environment.PRODUCTION)
                .referenceId(userId)
                .onComplete(() => {
                  dispatch(profileDetailsRequest());
                })
                .onCanceled(() => {
                  dispatch(profileDetailsRequest());
                })
                .onError(() => {
                  dispatch(profileDetailsRequest());
                })
                .build()
                .start();
            }}
            marginTop={normalize(20)}
          />
        </View>
      </View>
    </KeyboardAvoidingTemplate>
  );
};

export default PersonaValidation;

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
});

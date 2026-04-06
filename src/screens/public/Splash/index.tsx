import { View, Text, ImageBackground, Image, Platform } from 'react-native';
import React from 'react';
import { Icons, Images } from '@app/themes';
import LottieView from 'lottie-react-native';
import styles from './styles';
import MyStatusBar from '@app/utils/helpers/MyStatusBar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Splash = () => {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.container,
        Platform.OS === 'android' && { paddingBottom: insets.bottom },
      ]}
    >
      <ImageBackground
        source={Images.splash_bg}
        style={styles.imageBackground}
        resizeMode="cover"
      >
        <MyStatusBar
          backgroundColor={'transparent'}
          barStyle={'dark-content'}
          translucent
        />
        <Image source={Images.mapbase} style={styles.map} />
        <View style={styles.main}>
          <Image source={Icons.logo} style={styles.logo} resizeMode="contain" />
          <Image
            source={Icons.speakwide}
            style={styles.title}
            resizeMode="contain"
          />
          <Text style={styles.subTitle}>
            Professional Interpretation on Demand
          </Text>
        </View>
        <View style={styles.v2}>
          <LottieView
            source={require('../../../assets/json/hourglass.json')}
            autoPlay
            loop
            style={styles.progress}
          />
          <Text style={styles.loading}>Loading...</Text>
        </View>
      </ImageBackground>
    </View>
  );
};

export default Splash;

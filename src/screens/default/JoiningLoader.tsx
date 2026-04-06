import { View, Text, ImageBackground, StyleSheet } from 'react-native';
import React, { FC, useEffect } from 'react';
import { Colors, Fonts, Images } from '@app/themes';
import { normalize } from '@app/utils/orientation';
import LottieView from 'lottie-react-native';
import { useIsFocused } from '@react-navigation/native';
import { navigate } from '@app/navigation/RootNaivgation';
import { SessionHistoryParamList } from '@app/types';
import { StackScreenProps } from '@react-navigation/stack';

type Props = StackScreenProps<SessionHistoryParamList, 'JoiningLoader'>;

const JoiningLoader: FC<Props> = ({ route }) => {
  const { title, type } = route.params || {};
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      setTimeout(() => {
        navigate('VideoCall')
        // navigate(type === 'Session' ? 'VideoCall' : 'SupportChat');
      }, 2000);
    }
  }, [isFocused, type]);

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground
        source={Images.joining}
        style={[
          StyleSheet.absoluteFillObject,
          {
            justifyContent: 'center',
            alignItems: 'center',
          },
        ]}
      >
        <LottieView
          source={
            type === 'Session'
              ? require('../../assets/json/hourGlassLoading.json')
              : require('../../assets/json/activityIndicator.json')
          }
          autoPlay
          loop
          style={{
            height: normalize(type === 'Chat' ? 55 : 85),
            width: normalize(type === 'Chat' ? 55 : 85),
          }}
        />
        <Text
          style={{
            fontFamily: Fonts.Inter_SemiBold,
            color: Colors.purple,
            fontSize: normalize(12),
            marginTop: normalize(10),
          }}
        >
          {title}
        </Text>
      </ImageBackground>
    </View>
  );
};

export default JoiningLoader;

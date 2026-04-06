import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Colors, Fonts, Icons, Images } from '@app/themes';
import { hexToRGB } from '@app/utils/helpers';
import { normalize } from '@app/utils/orientation';
import { StackActions, useNavigation } from '@react-navigation/native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

const VideoCall: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView
      style={[
        styles.container,
        Platform.OS === 'android' && { paddingBottom: insets.bottom },
      ]}
    >
      {/* Remote Video (background placeholder for now) */}
      <View style={StyleSheet.absoluteFillObject}>
        <Image source={Images.user2} style={styles.video} />
      </View>

      {/* Top Bar */}
      <View style={styles.topBar}>
        {/* User Info */}
        <View style={styles.userInfo}>
          <Image source={Images.user_profile} style={styles.avatar} />
          <Text style={styles.userName}>John Williams</Text>
        </View>

        {/* Call Status */}
        <View style={styles.callStatus}>
          <View style={styles.dot} />
          <Text style={styles.callTime}>12:30</Text>
          <TouchableOpacity>
            <Image source={Icons.arrows_outward} style={styles.icon} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Local Preview */}
      <View
        style={[
          styles.localPreviewContainer,
          {
            bottom:
              normalize(100) + (Platform.OS === 'android' ? insets.bottom : 0),
          },
        ]}
      >
        <Image source={Images.user1} style={styles.localPreview} />
      </View>

      {/* Bottom Controls */}
      <View
        style={[
          styles.bottomControls,
          {
            bottom:
              normalize(20) + (Platform.OS === 'android' ? insets.bottom : 0),
          },
        ]}
      >
        {[
          { icon: Icons.mic_off },
          { icon: Icons.videocam_off },
          { icon: Icons.volume_off },
          { icon: Icons.forum },
        ].map((item, index) => (
          <TouchableOpacity key={index} style={styles.controlButton}>
            <Image source={item.icon} style={styles.controlIcon} />
          </TouchableOpacity>
        ))}

        {/* End Call */}
        <TouchableOpacity
          onPress={() => {
            navigation.dispatch(StackActions.pop(2));
          }}
          style={[styles.controlButton, styles.endCall]}
        >
          <Image source={Icons.call} style={styles.controlIcon} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default VideoCall;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  video: {
    height: '100%',
    width: '100%',
  },
  topBar: {
    position: 'absolute',
    top: normalize(60),
    width: '90%',
    alignSelf: 'center',
    backgroundColor: Colors.white,
    borderRadius: normalize(60),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: normalize(10),
    paddingVertical: normalize(10),
    justifyContent: 'space-between',
    zIndex: 2,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: normalize(32),
    height: normalize(32),
    borderRadius: normalize(32),
    marginRight: normalize(10),
  },
  userName: {
    fontFamily: Fonts.Inter_SemiBold,
    color: Colors.night_blue,
    fontSize: normalize(12),
  },
  callStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: normalize(6),
    height: normalize(6),
    backgroundColor: Colors.orange,
    borderRadius: normalize(3),
    marginRight: normalize(5),
  },
  callTime: {
    fontFamily: Fonts.Inter_Medium,
    color: Colors.night_blue,
    fontSize: normalize(11),
    marginRight: normalize(8),
  },
  icon: {
    height: normalize(22),
    width: normalize(22),
    resizeMode: 'contain',
  },
  localPreviewContainer: {
    position: 'absolute',
    bottom: normalize(100),
    right: '5%',
    width: normalize(125),
    height: normalize(165),
    borderRadius: normalize(12),
    overflow: 'hidden',
    borderWidth: normalize(1),
    borderColor: Colors.white,
  },
  localPreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  bottomControls: {
    position: 'absolute',
    bottom: normalize(20),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: hexToRGB(Colors.white, 0.3),
    alignSelf: 'center',
    paddingHorizontal: normalize(6),
    paddingVertical: normalize(5),
    borderRadius: normalize(60),
    gap: normalize(8),
  },
  controlButton: {
    width: normalize(40),
    height: normalize(40),
    borderRadius: normalize(40),
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlIcon: {
    height: normalize(18),
    width: normalize(18),
    resizeMode: 'contain',
  },
  endCall: {
    backgroundColor: Colors.red,
  },
});

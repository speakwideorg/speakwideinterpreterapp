import React from 'react';
import {
  Modal,
  StyleSheet,
  View,
  Animated,
  Platform,
  Image,
  Text,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { normalize } from '@app/utils/orientation';
import { Colors, Fonts, Images } from '@app/themes';
import { hexToRGB } from '@app/utils/helpers';
import LinearGradient from 'react-native-linear-gradient';
import Button from '../common/Button';
interface AlertModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const ExitAppModal: React.FC<AlertModalProps> = ({
  visible,
  onCancel,
  onConfirm,
}) => {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
    >
      <View style={[styles.overlay]}>
        <BlurView
          style={StyleSheet.absoluteFill}
          blurType="light"
          blurAmount={4}
          reducedTransparencyFallbackColor={hexToRGB(Colors.dark_lilac, 0.7)}
        />
        <View style={styles.backdrop} />

        <Animated.View style={styles.contentWrapper}>
          <LinearGradient
            useAngle
            angle={90}
            colors={['#F4EDFF', '#B081FF']}
            style={styles.gradient}
          >
            <View style={[styles.innerContent]}>
              <View style={styles.container}>
                <Image source={Images.logout} style={styles.image} />

                <Text style={styles.title}>Are you sure, want to exit?</Text>

                <Button
                  onPress={() => onCancel()}
                  title="Cancel"
                  colors={[Colors.white, Colors.white]}
                  textColor={Colors.purple}
                  elevation={0}
                  shadowOpacity={0}
                  borderColor="#D0B3FF"
                />

                <Button
                  onPress={() => onConfirm()}
                  title="Yes, Exit"
                  marginTop={normalize(10)}
                />
              </View>
            </View>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default ExitAppModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: hexToRGB(Colors.dark_lilac, 0.5),
  },
  contentWrapper: {
    width: '80%',
    borderRadius: normalize(20),
    overflow: 'hidden',
    shadowColor: Colors.black,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
    marginBottom: Platform.OS === 'ios' ? normalize(30) : normalize(240),
  },
  gradient: {
    borderRadius: normalize(20),
    overflow: 'hidden',
  },
  innerContent: {
    backgroundColor: Colors.white,
    borderRadius: normalize(18),
    margin: normalize(2),
    width: '100%',
  },
  container: {
    alignItems: 'center',
    paddingTop: normalize(10),
    paddingBottom: normalize(18),
  },
  image: {
    height: normalize(80),
    width: normalize(80),
    marginVertical: normalize(10),
  },
  title: {
    fontFamily: Fonts.Inter_Medium,
    color: Colors.night_blue,
    fontSize: normalize(14),
    textAlign: 'center',
    marginVertical: normalize(10),
  },
});

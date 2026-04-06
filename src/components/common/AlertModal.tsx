import React, { ReactNode, useEffect, useRef, useState, useMemo } from 'react';
import {
  Modal,
  StyleSheet,
  View,
  Animated,
  Platform,
  Keyboard,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import LinearGradient from 'react-native-linear-gradient';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { normalize } from '@app/utils/orientation';
import { Colors } from '@app/themes';
import { hexToRGB } from '@app/utils/helpers';

interface AlertModalProps {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  padding?: number;
  colors?: string[];
  paddingTop?: number;
}

const AlertModal: React.FC<AlertModalProps> = ({
  visible,
  onClose,
  children,
  padding = normalize(16),
  colors = ['#F4EDFF', '#B081FF'],
  paddingTop = Platform.OS === 'ios' ? normalize(110) : normalize(100),
}) => {
  const scrollRef = useRef<KeyboardAwareScrollView | any>(null);

  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const translateYAnim = useRef(new Animated.Value(40)).current;

  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  // Keyboard listeners
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () =>
      setIsKeyboardVisible(true),
    );

    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setIsKeyboardVisible(false);
      // Reset scroll after keyboard hides
      setTimeout(() => {
        scrollRef.current?.scrollToPosition?.(0, 0, true);
        scrollRef.current?.scrollTo?.({ y: 0, animated: true });
      }, 50);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Show/hide animations
  useEffect(() => {
    const commonConfig = { useNativeDriver: true } as const;

    if (visible) {
      const delay = Platform.OS === 'ios' ? 50 : 0;
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 200,
            ...commonConfig,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1.05,
            friction: 6,
            tension: 80,
            ...commonConfig,
          }),
          Animated.spring(translateYAnim, {
            toValue: 0,
            friction: 6,
            tension: 80,
            ...commonConfig,
          }),
        ]).start();
      }, delay);
    } else {
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 180,
          ...commonConfig,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 180,
          ...commonConfig,
        }),
        Animated.timing(translateYAnim, {
          toValue: 20,
          duration: 180,
          ...commonConfig,
        }),
      ]).start();
    }
  }, [visible, opacityAnim, scaleAnim, translateYAnim]);

  const gradientColors = useMemo(() => colors, [colors]);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Blur background */}
        <BlurView
          style={StyleSheet.absoluteFill}
          blurType="light"
          blurAmount={4}
          reducedTransparencyFallbackColor={hexToRGB(Colors.dark_lilac, 0.7)}
        />
        <View style={styles.backdrop} />

        {/* Scrollable content */}
        <KeyboardAwareScrollView
          ref={scrollRef}
          scrollEnabled={isKeyboardVisible}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingTop }]}
        >
          <Animated.View
            style={[
              styles.contentWrapper,
              {
                opacity: opacityAnim,
                transform: [
                  { scale: scaleAnim },
                  { translateY: translateYAnim },
                ],
              },
            ]}
          >
            <LinearGradient
              useAngle
              angle={90}
              colors={gradientColors}
              style={styles.gradient}
            >
              <View style={[styles.innerContent, { padding }]}>{children}</View>
            </LinearGradient>
          </Animated.View>
        </KeyboardAwareScrollView>
      </View>
    </Modal>
  );
};

export default AlertModal;

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
  scroll: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    paddingHorizontal: normalize(20),
    paddingTop: Platform.OS === 'ios' ? normalize(110) : normalize(100),
    paddingBottom: Platform.OS === 'ios' ? normalize(30) : normalize(90),
  },
  contentWrapper: {
    width: '100%',
    maxWidth: normalize(350),
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
});

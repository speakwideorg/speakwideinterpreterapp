import React, { useRef } from 'react';
import {
  Text,
  ActivityIndicator,
  StyleSheet,
  Pressable,
  StyleProp,
  ViewStyle,
  Animated,
  Easing,
  DimensionValue,
} from 'react-native';
import { normalize } from '@app/utils/orientation';
import { isIos } from '@utils/helpers/Validation';
import { Colors, Fonts } from '@app/themes';
import LinearGradient from 'react-native-linear-gradient';

interface ButtonProps {
  height?: number;
  width?: string | number;
  borderRadius?: number;
  marginHorizontal?: number;
  textColor?: string;
  fontSize?: number;
  title: string;
  onPress: () => void;
  isLoading?: boolean;
  style?: StyleProp<ViewStyle>;
  fontFamily?: string;
  marginTop?: number;
  disabled?: boolean;
  colors?: any;
  angle?: number;
  shadowOpacity?: number;
  elevation?: number;
  borderColor?: string;
}

const Button: React.FC<ButtonProps> = props => {
  const {
    height = normalize(45),
    width = '90%',
    borderRadius = normalize(9),
    textColor = Colors.white,
    fontSize = normalize(isIos() ? 13.5 : 12),
    marginHorizontal = normalize(10),
    colors = ['#8142E9', '#8142E9', '#8142E9', '#6941C6'],
    angle = 150,
    title,
    onPress = () => {},
    isLoading = false,
    style,
    fontFamily = Fonts.Inter_SemiBold,
    marginTop = normalize(14),
    disabled = false,
    shadowOpacity = 0.4,
    elevation = 10,
    borderColor = Colors.purple_heart
  } = props;

  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.timing(scale, {
      toValue: 0.95,
      duration: 150,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(scale, {
      toValue: 1,
      duration: 150,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const animatedScaleStyle = {
    flex: 1,
    transform: [{ scale }],
    borderRadius,
    shadowColor: Colors.purple,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: shadowOpacity,
    shadowRadius: 8,
    elevation: elevation,
  };

  return (
    <Pressable
      disabled={disabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      style={[
        {
          width: (typeof width === 'number'
            ? width
            : `${width}`) as DimensionValue,
          height,
          marginTop,
          borderRadius,
        },
        style,
      ]}
    >
      <Animated.View style={animatedScaleStyle}>
        <LinearGradient
          // start={{ x: 2, y: 0 }}
          // end={{ x: 1, y: 4 }}
          useAngle={true}
          angle={angle}
          colors={colors}
          style={[
            styles.buttonContainer,
            {
              borderRadius,
              borderColor: borderColor,
              borderWidth: isIos() ? 0.5 : 1,
            },
          ]}
        >
          {isLoading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text
              style={[
                {
                  fontFamily,
                  color: textColor,
                  fontSize,
                  marginHorizontal: marginHorizontal,
                },
              ]}
            >
              {title}
            </Text>
          )}
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  iconStyle: {
    height: normalize(18),
    width: normalize(18),
    resizeMode: 'contain',
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
});

export default Button;

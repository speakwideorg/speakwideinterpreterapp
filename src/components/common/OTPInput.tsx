import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
  TextInputProps,
  StyleProp,
  ViewStyle,
  DimensionValue,
  Platform,
} from 'react-native';
import { normalize } from '@app/utils/orientation';
import { moderateScale } from '@utils/orientation';
import { Colors, Fonts } from '@app/themes';
import { hexToRGB } from '@app/utils/helpers';

interface OTPInputProps {
  length?: number;
  onChangeOTP?: (otp: string) => void;
  width?: string | number;
  keyboardType?: TextInputProps['keyboardType'];
  marginTop?: number;
  marginBottom?: number;
  reset?: boolean;
}

const OTPInput: React.FC<OTPInputProps> = ({
  length = 4,
  onChangeOTP,
  width = '100%',
  keyboardType = 'numeric',
  marginBottom = normalize(5),
  marginTop = normalize(15),
  reset = false,
}) => {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(''));
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const inputs = useRef<Array<TextInput | null>>([]);

  const handleChangeText = useCallback(
    (text: string, index: number) => {
      const newOtp = [...otp];
      newOtp[index] = text;
      setOtp(newOtp);

      if (onChangeOTP) {
        onChangeOTP(newOtp.join(''));
      }

      if (text.length === 1 && index < length - 1) {
        inputs.current[index + 1]?.focus();
      }
    },
    [otp, length, onChangeOTP],
  );

  const handleKeyPress = useCallback(
    (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
      if (e.nativeEvent.key === 'Backspace') {
        if (index > 0 && !otp[index]) {
          inputs.current[index - 1]?.focus();
        } else {
          const newOtp = [...otp];
          newOtp[index] = '';
          setOtp(newOtp);
        }
      }
    },
    [otp],
  );

  const handleFocus = (index: number) => {
    setFocusedIndex(index);
  };

  const handleBlur = () => {
    setFocusedIndex(null);
  };

  const resetOTP = useCallback(() => {
    setOtp(new Array(length).fill('')); // Clear all inputs
    inputs.current[0]?.focus(); // Focus the first input box
  }, [length]);

  useEffect(() => {
    if (reset) {
      resetOTP();
    }
  }, [reset, resetOTP]);

  const mainStyle: StyleProp<ViewStyle> = {
    width: typeof width === 'number' ? width : (width as DimensionValue),
    marginBottom,
    marginTop,
  };

  return (
    <View style={[styles.container, mainStyle]}>
      {otp.map((_, index) => (
        <TextInput
          key={index}
          value={otp[index]}
          onChangeText={text => handleChangeText(text, index)}
          onKeyPress={e => handleKeyPress(e, index)}
          onFocus={() => handleFocus(index)}
          onBlur={handleBlur}
          placeholderTextColor={Colors.dark_grey}
          placeholder="__"
          style={[styles.input, focusedIndex === index && styles.inputFocused]}
          keyboardType={keyboardType}
          maxLength={1}
          ref={(ref: any) => (inputs.current[index] = ref)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  input: {
    height: normalize(45),
    width: normalize(48),
    borderRadius: moderateScale(10),
    fontSize: normalize(15),
    backgroundColor: Colors.white,
    borderWidth: normalize(1),
    borderColor: Colors.white_chalk,
    shadowColor:
      Platform.OS === 'ios'
        ? hexToRGB(Colors.night_blue, 0.09)
        : hexToRGB(Colors.night_blue, 0.8),
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 8,
    textAlign: 'center',
    color: Colors.night_blue,
    fontFamily: Fonts.Inter_Regular,
    padding: 0,
    textAlignVertical: 'center',
  },
  inputFocused: {
    borderColor: hexToRGB(Colors.night_blue, 0.5),
    backgroundColor: Colors.white_lilae,
  },
});

export default OTPInput;

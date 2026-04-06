import React, { FC, useState } from 'react';
import {
  View,
  TextInput as Input,
  TouchableOpacity,
  Image,
  StyleProp,
  ViewStyle,
  ImageStyle,
  StyleSheet,
  Text,
  TextStyle,
} from 'react-native';
import { horizontalScale, moderateScale, normalize } from '@utils/orientation';
import { Colors, Fonts, Icons } from '@app/themes';
import { hexToRGB } from '@app/utils/helpers';

const capital_letter_regex = /[A-Z]/;
const small_letter_regex = /[a-z]/;
const number_regex = /[0-9]/;
const special_character_regex = /[!@#$%^&*(),.?":{}|<>]/;
const min_character_regex = /^.{8,}$/;

interface TextInputProps {
  value: string;
  onChangeText?: (text: string) => void;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  secureTextEntry?: boolean;
  placeholder?: string;
  placeholderColor?: string;
  editable?: boolean;
  width?: string | number;
  height?: number;
  backgroundColor?: string;
  textAlign?: 'left' | 'center' | 'right';
  fontSize?: number;
  tintColor?: string;
  maxLength?: number;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters' | undefined;
  marginVertical?: number;
  rightIcon?: number;
  iconStyle?: ImageStyle;
  onRightIconPress?: () => void;
  title?: string;
  hint?: string;
  numberOfLines?: number;
  multiline?: boolean;
  isPlaceholderIncludeStar?: boolean;
  paddingTop?: number;
  bottomText?: string;
  titleStyle?: StyleProp<TextStyle>;
  isOptional?: boolean;
  style?: StyleProp<ViewStyle>;
  onFocus?: Function;
  onBlur?: Function;
}

const TextInput: FC<TextInputProps> = ({
  value,
  onChangeText = () => {},
  keyboardType = 'default',
  secureTextEntry = false,
  placeholder = '',
  placeholderColor = Colors.dust,
  editable = true,
  width = '90%',
  height = normalize(46),
  backgroundColor = Colors.white_lilae, // Colors.mint,
  textAlign = 'left',
  fontSize = normalize(12),
  tintColor = Colors.night_blue,
  maxLength,
  autoCapitalize = 'sentences',
  marginVertical = moderateScale(7),
  rightIcon,
  iconStyle,
  onRightIconPress,
  title,
  numberOfLines = undefined,
  hint,
  multiline = false,
  isPlaceholderIncludeStar = false,
  paddingTop = undefined,
  bottomText = '',
  titleStyle,
  isOptional = false,
  style,
  onFocus = () => {},
  onBlur = () => {},
}) => {
  const [isSecure, setIsSecure] = useState(secureTextEntry);
  const [isFocus, setIsFocus] = useState(false);
  const [isPasswordPopup, setIsPasswordPopup] = useState(false);

  const isOnlyStarsPlaceholder = value.length === 0;

  const containerStyle: StyleProp<ViewStyle | any> = {
    width: typeof width === 'number' ? width : `${width}`,
    height,
    backgroundColor,
    marginVertical,
    borderRadius: moderateScale(12),
    paddingHorizontal: horizontalScale(15),
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: isFocus ? hexToRGB(Colors.purple, 0.5) : Colors.white_chalk,
    borderWidth: normalize(1.5),
  };

  return (
    <View style={style}>
      {title && (
        <Text style={[styles.title, titleStyle]}>
          {title}
          {hint && <Text style={styles.hint}>{hint}</Text>}
          {isOptional && (
            <Text
              style={{ fontFamily: Fonts.Inter_Regular }}
            >{` (Optional)`}</Text>
          )}
        </Text>
      )}
      <View style={containerStyle}>
        <Input
          autoCapitalize={autoCapitalize}
          value={value}
          editable={editable}
          maxLength={maxLength}
          numberOfLines={numberOfLines}
          onChangeText={onChangeText}
          secureTextEntry={isSecure}
          placeholder={placeholder}
          placeholderTextColor={placeholderColor}
          keyboardType={keyboardType}
          multiline={multiline}
          textAlignVertical={multiline ? 'top' : 'auto'}
          style={[
            styles.input,
            {
              textAlign,
              fontSize,
              color: Colors.dark_grey,
              paddingTop: paddingTop,
            },
            isPlaceholderIncludeStar
              ? isOnlyStarsPlaceholder
                ? styles.isOnlyStarsPlaceholderStyle
                : styles.isNotOnlyStarsPlaceholderStyle
              : {},
          ]}
          onFocus={() => {
            setIsFocus(true);
            setIsPasswordPopup(secureTextEntry);
            onFocus();
          }}
          onBlur={() => {
            setIsFocus(false);
            setIsPasswordPopup(false);
            onBlur();
          }}
        />
        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setIsSecure(!isSecure)}
            style={styles.iconWrapper}
          >
            <Image
              source={isSecure ? Icons.hide : Icons.show}
              style={[styles.icon, { tintColor }, iconStyle]}
            />
          </TouchableOpacity>
        )}
        {rightIcon && (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={styles.iconWrapper}
          >
            <Image
              source={rightIcon}
              style={[styles.icon, { tintColor }, iconStyle]}
            />
          </TouchableOpacity>
        )}
      </View>

      {isPasswordPopup ? (
        <View style={styles.passwordConatiner}>
          <Text
            style={[
              styles.passwordContainerText,
              { fontFamily: Fonts.Inter_Medium },
            ]}
          >
            Password must contain:
          </Text>
          <Text
            style={[
              styles.passwordContainerText,
              {
                color: !capital_letter_regex.test(value)
                  ? Colors.red
                  : Colors.teal_blue,
              },
            ]}
          >
            1 Capital Letter
          </Text>
          <Text
            style={[
              styles.passwordContainerText,
              {
                color: !small_letter_regex.test(value)
                  ? Colors.red
                  : Colors.teal_blue,
              },
            ]}
          >
            1 Small Letter
          </Text>
          <Text
            style={[
              styles.passwordContainerText,
              {
                color: !number_regex.test(value)
                  ? Colors.red
                  : Colors.teal_blue,
              },
            ]}
          >
            1 Number
          </Text>
          <Text
            style={[
              styles.passwordContainerText,
              {
                color: !special_character_regex.test(value)
                  ? Colors.red
                  : Colors.teal_blue,
              },
            ]}
          >
            1 Special Character
          </Text>
          <Text
            style={[
              styles.passwordContainerText,
              {
                color: !min_character_regex.test(value)
                  ? Colors.red
                  : Colors.teal_blue,
              },
            ]}
          >
            Min 8 Characters
          </Text>
        </View>
      ) : null}

      {bottomText && <Text style={styles.subTitle}>{bottomText}</Text>}
    </View>
  );
};

export default TextInput;

const styles = StyleSheet.create({
  title: {
    fontFamily: Fonts.Inter_Medium,
    color: Colors.night_blue,
    fontSize: normalize(13),
    marginTop: normalize(6),
  },
  input: {
    flex: 1,
    height: '100%',
    fontFamily: Fonts.Inter_Regular,
  },
  iconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: horizontalScale(10),
  },
  icon: {
    width: normalize(18),
    height: normalize(18),
    resizeMode: 'contain',
  },
  hint: {
    fontFamily: Fonts.Inter_Regular,
    color: Colors.dark_grey,
  },
  subTitle: {
    color: Colors.dust,
    fontFamily: Fonts.Inter_Regular,
    fontSize: normalize(10),
    marginTop: normalize(2),
  },
  passwordConatiner: {
    position: 'absolute',
    bottom: normalize(50),
    right: 0,
    width: normalize(150),
    backgroundColor: Colors.white,
    paddingHorizontal: normalize(10),
    paddingVertical: normalize(5),
    gap: normalize(3),
    borderRadius: normalize(10),
    borderWidth: 2,
    borderColor: hexToRGB(Colors.purple, 0.5),
  },
  passwordContainerText: {
    fontSize: normalize(10),
    fontFamily: Fonts.Inter_Regular,
    color: Colors.night_blue,
  },
  isOnlyStarsPlaceholderStyle: {
    paddingTop: normalize(5),
    paddingBottom: normalize(0),
  },
  isNotOnlyStarsPlaceholderStyle: {
    paddingVertical: normalize(0),
    textAlignVertical: 'center',
  },
  dropDownContainer: {
    position: 'absolute',
    bottom: -200,
    zIndex: 100,
    width: '100%',
    height: 200,
    borderWidth: 2,
    borderRadius: normalize(12),
    backgroundColor: Colors.white,
  },
});

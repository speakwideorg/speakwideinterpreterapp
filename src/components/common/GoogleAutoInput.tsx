import React, { FC, useCallback, useState } from 'react';
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
  FlatList,
} from 'react-native';
import { horizontalScale, moderateScale, normalize } from '@utils/orientation';
import { Colors, Fonts, Icons } from '@app/themes';
import { hexToRGB } from '@app/utils/helpers';
import Css from '@app/themes/Css';
import { AddressSuggestionList } from '@app/dummy';

interface GoogleAutoInputProps {
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
  marginVertical?: number;
  rightIcon?: number;
  iconStyle?: ImageStyle;
  onRightIconPress?: () => void;
  title?: string;
  numberOfLines?: number;
}

const GoogleAutoInput: FC<GoogleAutoInputProps> = ({
  value = '',
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
  marginVertical = moderateScale(7),
  rightIcon,
  iconStyle,
  onRightIconPress,
  title,
  numberOfLines = undefined,
}) => {
  const [isSecure, setIsSecure] = useState(secureTextEntry);
  const [isFocus, setIsFocus] = useState(false);

  const containerStyle: StyleProp<ViewStyle | any> = {
    width: typeof width === 'number' ? width : `${width}`,
    height,
    backgroundColor,
    marginVertical,
    borderRadius: moderateScale(12),
    paddingHorizontal: horizontalScale(18),
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: isFocus ? hexToRGB(Colors.purple, 0.5) : Colors.white_chalk,
    borderWidth: normalize(1.5),
  };

  const renderItem = useCallback(
    ({ item, index }: any) => {
      const query = value?.trim() || '';
      const matchIndex = item.toLowerCase().indexOf(query.toLowerCase());

      if (matchIndex === -1 || !query) {
        // No match found — show normal text
        return (
          <TouchableOpacity
            key={index}
            style={styles.v1}
            onPress={() => onChangeText(item)}
          >
            <Text numberOfLines={2} style={styles.hintText}>
              {item}
            </Text>
          </TouchableOpacity>
        );
      }

      const beforeMatch = item.slice(0, matchIndex);
      const matchText = item.slice(matchIndex, matchIndex + query.length);
      const afterMatch = item.slice(matchIndex + query.length);

      return (
        <TouchableOpacity
          key={index}
          style={styles.v1}
          onPress={() => onChangeText(item)}
        >
          <Text numberOfLines={2} style={{ fontSize: normalize(11) }}>
            <Text style={styles.hintText}>{beforeMatch}</Text>
            <Text style={styles.highlightText}>{matchText}</Text>
            <Text style={styles.hintText}>{afterMatch}</Text>
          </Text>
        </TouchableOpacity>
      );
    },
    [value, onChangeText],
  );

  return (
    <View>
      {title && <Text style={styles.title}>{title}</Text>}
      <View style={containerStyle}>
        <Input
          value={value}
          editable={editable}
          maxLength={maxLength}
          numberOfLines={numberOfLines}
          onChangeText={onChangeText}
          secureTextEntry={isSecure}
          placeholder={placeholder}
          placeholderTextColor={placeholderColor}
          keyboardType={keyboardType}
          style={[styles.input, { textAlign, fontSize, color: Colors.black }]}
          onFocus={() => setIsFocus(true)}
          onBlur={() => setIsFocus(false)}
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
        {rightIcon ? (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={styles.iconWrapper}
          >
            <Image
              source={rightIcon}
              style={[styles.icon, { tintColor }, iconStyle]}
            />
          </TouchableOpacity>
        ) : value ? (
          <TouchableOpacity
            onPress={() => onChangeText('')}
            style={[styles.iconWrapper]}
          >
            <Image
              source={Icons.cross}
              style={[styles.icon, { tintColor }, iconStyle]}
            />
          </TouchableOpacity>
        ) : null}
      </View>

      {isFocus && value && (
        <View style={styles.box}>
          <View style={styles.header}>
            <Text style={styles.suggestion}>SUGGESTIONS</Text>
            <TouchableOpacity style={{ right: normalize(-5) }}>
              <Image source={Icons.close} style={styles.close} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={AddressSuggestionList}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderItem}
            keyboardShouldPersistTaps="always"
            nestedScrollEnabled={true}
            contentContainerStyle={{
              paddingTop: normalize(5),
              paddingBottom: normalize(10),
            }}
            style={Css.f1}
            ListFooterComponent={<Text style={styles.loading}>Loading...</Text>}
          />
        </View>
      )}
    </View>
  );
};

export default GoogleAutoInput;

const styles = StyleSheet.create({
  title: {
    fontFamily: Fonts.Inter_Medium,
    color: Colors.night_blue,
    fontSize: normalize(13),
    marginTop: normalize(6),
  },
  input: {
    flex: 1,
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
  box: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    elevation: 5,
    zIndex: 10,
    height: normalize(150),
    shadowColor: Colors.smoke,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    borderRadius: normalize(8),
    paddingBottom: normalize(12),
    paddingHorizontal: normalize(10),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: normalize(8),
  },
  suggestion: {
    color: Colors.dust,
    fontFamily: Fonts.Inter_Medium,
    fontSize: normalize(10),
  },
  close: {
    height: normalize(22),
    width: normalize(22),
  },
  loading: {
    fontFamily: Fonts.Inter_Regular,
    color: Colors.night_blue,
    fontSize: normalize(10),
    alignSelf: 'center',
    marginVertical: normalize(6),
  },
  hintText: {
    fontFamily: Fonts.DMSans_Regular,
    color: Colors.mountain_mist,
    fontSize: normalize(11),
  },
  highlightText: {
    fontFamily: Fonts.DMSans_SemiBold,
    color: Colors.night_blue,
    fontSize: normalize(11),
  },
  v1: {
    backgroundColor: 'white',
    paddingVertical: normalize(5),
  },
});

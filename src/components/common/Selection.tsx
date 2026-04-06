import React, { FC, useRef, useState } from 'react';
import {
  View,
  TouchableOpacity,
  Image,
  StyleProp,
  ViewStyle,
  ImageStyle,
  StyleSheet,
  Text,
  Modal,
  FlatList,
  Pressable,
  UIManager,
  findNodeHandle,
  LayoutRectangle,
} from 'react-native';
import { horizontalScale, moderateScale, normalize } from '@utils/orientation';
import { Colors, Fonts, Icons } from '@app/themes';
import { isArrayEmpty } from '@app/utils/helpers/Validation';

interface Option {
  label: string;
  value?: string;
}
interface SelectionProps {
  value: string;
  placeholder?: string;
  placeholderColor?: string;
  width?: string | number;
  height?: number;
  backgroundColor?: string;
  fontSize?: number;
  tintColor?: string;
  marginVertical?: number;
  rightIcon?: number;
  iconStyle?: ImageStyle;
  onPress?: () => void;
  title?: string;
  isOptional?: boolean;
  borderColor?: string;
  options?: Option[];
  onChange?: (val: Option) => void;
}

export const SelectionListFormat = <T extends Record<string, any>>(
  list: T[],
  labelKey: keyof T,
  valueKey: keyof T,
): Option[] => {
  return list.map(item => ({
    label: String(item[labelKey]),
    value: String(item[valueKey]),
  }));
};

const Selection: FC<SelectionProps> = ({
  value,
  placeholder = '',
  placeholderColor = Colors.dust,
  width = '90%',
  height = normalize(46),
  backgroundColor = Colors.white_lilae,
  fontSize = normalize(12),
  tintColor = Colors.night_blue,
  marginVertical = moderateScale(7),
  rightIcon = Icons.arrow_drop_down,
  iconStyle,
  onPress,
  title,
  isOptional = false,
  borderColor = Colors.white_chalk,
  options = [],
  onChange,
}) => {
  const [visible, setVisible] = useState(false);
  const [dropdownPos, setDropdownPos] = useState<LayoutRectangle | null>(null);
  const ref = useRef<View>(null);

  const containerStyle: StyleProp<ViewStyle | any> = {
    width: typeof width === 'number' ? width : `${width}`,
    height,
    backgroundColor,
    marginVertical,
    borderRadius: moderateScale(12),
    flexDirection: 'row',
    alignItems: 'center',
    borderColor,
    borderWidth: normalize(1.5),
  };

  const openDropdown = () => {
    if (ref.current) {
      const handle = findNodeHandle(ref.current);
      if (handle) {
        UIManager.measureInWindow(handle, (x, y, w, h) => {
          setDropdownPos({ x, y: y + h, width: w, height: h });
          setVisible(true);
        });
      }
    }
  };

  const handleSelect = (val: any) => {
    onChange?.(val);
    setVisible(false);
  };

  return (
    <View>
      {title && (
        <Text style={styles.title}>
          {title}
          {isOptional && (
            <Text
              style={{ fontFamily: Fonts.Inter_Regular }}
            >{` (Optional)`}</Text>
          )}
        </Text>
      )}
      <View ref={ref} collapsable={false} style={containerStyle}>
        <View style={{ flex: 1, paddingLeft: horizontalScale(18) }}>
          <Text
            numberOfLines={1}
            style={{
              fontSize,
              color: value ? Colors.black : placeholderColor,
              fontFamily: Fonts.Inter_Regular,
            }}
          >
            {value ? value : placeholder}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            if (onPress) onPress();
            if (!isArrayEmpty(options)) {
              openDropdown();
            }
          }}
          style={styles.iconWrapper}
        >
          <Image
            source={rightIcon}
            style={[styles.icon, { tintColor }, iconStyle]}
          />
        </TouchableOpacity>
      </View>

      {/* Dropdown Popup */}
      <Modal
        transparent
        visible={visible}
        animationType="none"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
          {dropdownPos && (
            <View
              style={[
                styles.dropdown,
                {
                  position: 'absolute',
                  top: dropdownPos.y,
                  left: dropdownPos.x,
                  width: dropdownPos.width,
                  maxHeight: normalize(250), // scroll if too long
                },
              ]}
            >
              <FlatList
                data={options}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.option}
                    onPress={() => handleSelect(item)}
                  >
                    <Text style={styles.optionText}>{item.label}</Text>
                    <Text style={styles.optionValue}>{item.value}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}
        </Pressable>
      </Modal>
    </View>
  );
};

export default Selection;

const styles = StyleSheet.create({
  title: {
    fontFamily: Fonts.Inter_Medium,
    color: Colors.night_blue,
    fontSize: normalize(13),
    marginTop: normalize(6),
  },
  iconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: normalize(45),
  },
  icon: {
    width: normalize(13),
    height: normalize(13),
    resizeMode: 'contain',
  },
  overlay: {
    flex: 1,
  },
  dropdown: {
    backgroundColor: Colors.white,
    borderRadius: normalize(8),
    paddingVertical: normalize(8),
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    marginTop: normalize(8),
    elevation: 4,
  },
  option: {
    paddingVertical: normalize(9),
    paddingHorizontal: normalize(15),
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  optionValue: {
    fontFamily: Fonts.Inter_Medium,
    fontSize: normalize(13),
    color: Colors.night_blue,
  },
  optionText: {
    fontFamily: Fonts.Inter_Regular,
    fontSize: normalize(13),
    color: Colors.night_blue,
  },
});

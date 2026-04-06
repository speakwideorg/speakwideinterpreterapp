import {
  findNodeHandle,
  LayoutRectangle,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
  FlatList,
} from 'react-native';
import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { normalize } from '@app/utils/orientation';
import { Colors, Fonts } from '@app/themes';

export type DropDownOption = {
  label: string;
  value: string;
};

export type DropDownRef = {
  openDropdown: () => void;
  closeDropdown: () => void;
};

interface DropDownProps {
  options: DropDownOption[];
  onSelect: (item: DropDownOption) => void;
  isVisible: boolean;
  setIsVisible: (visible: boolean) => void;
  selectedValue?: DropDownOption | null;
  buttonRef: React.RefObject<View> | any;
}

const DropDown = forwardRef<DropDownRef, DropDownProps>(
  (
    { options, onSelect, isVisible, setIsVisible, selectedValue, buttonRef },
    ref,
  ) => {
    const [dropdownPos, setDropdownPos] = useState<LayoutRectangle | null>(
      null,
    );

    const openDropdown = () => {
      if (buttonRef.current) {
        const handle = findNodeHandle(buttonRef.current);
        if (handle) {
          UIManager.measureInWindow(handle, (x, y, w, h) => {
            setDropdownPos({ x, y: y + h, width: w, height: h });
            setIsVisible(true);
          });
        }
      }
    };

    const closeDropdown = () => {
      setIsVisible(false);
    };

    useImperativeHandle(ref, () => ({
      openDropdown,
      closeDropdown,
    }));

    const handleSelect = (item: DropDownOption) => {
      onSelect(item);
      closeDropdown();
    };

    return (
      <Modal
        transparent
        visible={isVisible}
        animationType="none"
        onRequestClose={closeDropdown}
      >
        <Pressable style={styles.overlay} onPress={closeDropdown}>
          {dropdownPos && (
            <View
              style={[
                styles.dropdown,
                {
                  position: 'absolute',
                  top: dropdownPos.y + normalize(15),
                  left: dropdownPos.x - normalize(15),
                },
              ]}
            >
              <FlatList
                data={options}
                keyExtractor={item => item.value}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.option,
                      selectedValue?.value === item.value &&
                        styles.selectedOption,
                    ]}
                    onPress={() => handleSelect(item)}
                  >
                    <Text style={styles.optionText}>{item.label}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}
        </Pressable>
      </Modal>
    );
  },
);

export default DropDown;

const styles = StyleSheet.create({
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
    elevation: 4,
    maxHeight: normalize(150),
  },
  option: {
    paddingVertical: normalize(8),
    paddingHorizontal: normalize(12),
  },
  selectedOption: {
    backgroundColor: Colors.blue_chalk,
  },
  optionText: {
    fontFamily: Fonts.Inter_Regular,
    fontSize: normalize(13),
    color: Colors.night_blue,
  },
});

/* eslint-disable react-hooks/exhaustive-deps */
import { Checkbox } from '@app/components/common/Checkbox';
import { Colors, Fonts, Icons } from '@app/themes';
import { isIos } from '@app/utils/helpers/Validation';
import { normalize } from '@app/utils/orientation';
import React, { useRef, useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Animated,
  LayoutChangeEvent,
  ViewStyle,
  TextStyle,
  Modal,
  TouchableOpacity,
  Keyboard,
  Platform,
  Image,
} from 'react-native';

export interface expertiseInterface {
  _id: string;
  expertise_display_name: string;
  status: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ExpertisePickerProps {
  visible: boolean;
  onClose: () => void;
  data: expertiseInterface[];
  selected: expertiseInterface[];
  onSelect?: (item: expertiseInterface[]) => void;
  placeholder?: string;
  containerStyle?: ViewStyle;
  searchInputStyle?: TextStyle;
  listTextStyle?: TextStyle;
  isSearch?: boolean;
}

const THUMB_HEIGHT = normalize(30);
const THUMB_WIDTH = normalize(10);
const TRACK_WIDTH = normalize(3);

export default function ExpertisePicker({
  visible,
  onClose,
  data,
  onSelect,
  placeholder = 'Search',
  containerStyle,
  searchInputStyle,
  listTextStyle,
  selected,
  isSearch = true,
}: ExpertisePickerProps) {
  const [query, setQuery] = useState('');
  const scrollY = useRef(new Animated.Value(0)).current;
  const translateSheetY = useRef(new Animated.Value(0)).current;
  const viewH = useRef(1);
  const contentH = useRef(1);

  const filtered = useMemo(() => {
    if (!Array.isArray(data)) return [];
    const q = (query || '').trim().toLowerCase();
    return data.filter(d =>
      d?.expertise_display_name?.toLowerCase().includes(q),
    );
  }, [data, query]);

  const onListLayout = (e: LayoutChangeEvent) => {
    viewH.current = e.nativeEvent.layout.height;
  };

  const onContentSizeChange = (_w: number, h: number) => {
    contentH.current = Math.max(h, 1);
  };

  const scrollRange = Math.max(contentH.current - viewH.current, 1);
  const travelRange = Math.max(viewH.current - THUMB_HEIGHT, 0);

  const translateY = scrollY.interpolate({
    inputRange: [0, scrollRange],
    outputRange: [0, travelRange],
    extrapolate: 'clamp',
  });

  const showIndicator = contentH.current > viewH.current;

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      e => {
        const height = e.endCoordinates.height;
        Animated.timing(translateSheetY, {
          toValue: height,
          duration: 250,
          useNativeDriver: false,
        }).start();
      },
    );

    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        Animated.timing(translateSheetY, {
          toValue: 0,
          duration: 250,
          useNativeDriver: false,
        }).start();
      },
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return (
    <Modal visible={visible} transparent animationType="slide">
      {/* Dimmed Background */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        style={styles.backdrop}
      />

      {/* Bottom Sheet */}
      <Animated.View
        style={[
          styles.sheet,
          containerStyle,
          { marginBottom: isIos() ? translateSheetY : normalize(0) },
        ]}
      >
        {/* Drag handle */}
        <View style={styles.handle} />

        {/* Search */}
        {isSearch && (
          <View style={styles.searchBox}>
            <TextInput
              style={[styles.searchInput, searchInputStyle]}
              placeholder={placeholder}
              placeholderTextColor={Colors.dust}
              value={query}
              onChangeText={setQuery}
            />

            <Image
              source={Icons.search}
              style={{
                height: normalize(18),
                width: normalize(18),
                marginHorizontal: normalize(5),
              }}
            />
          </View>
        )}

        {/* List + Scrollbar */}
        <View style={styles.listWrap} onLayout={onListLayout}>
          <Animated.FlatList
            data={filtered}
            keyExtractor={(it, i) => `${it}-${i}`}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={onContentSizeChange}
            contentContainerStyle={styles.listContent}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: true },
            )}
            scrollEventThrottle={16}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => {
              const isChecked = selected.some(sel => sel._id === item._id);

              const toggleSelection = () => {
                let updated: expertiseInterface[];
                if (isChecked) {
                  updated = selected.filter(lang => lang !== item);
                } else {
                  updated = [...selected, item];
                }
                onSelect?.(updated);
              };

              return (
                <TouchableOpacity
                  onPress={() => toggleSelection()}
                  style={styles.touch}
                >
                  <Checkbox
                    checked={isChecked} // check incode selected
                    onChange={() => toggleSelection()}
                  />
                  <Text style={[styles.row, listTextStyle]}>
                    {item?.expertise_display_name}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />

          {showIndicator && (
            <>
              <View pointerEvents="none" style={styles.track} />
              <Animated.View
                pointerEvents="none"
                style={[styles.thumb, { transform: [{ translateY }] }]}
              />
            </>
          )}
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    maxHeight: '75%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: normalize(18),
    borderTopRightRadius: normalize(18),
    padding: normalize(10),
  },
  handle: {
    width: normalize(40),
    height: normalize(4),
    borderRadius: normalize(5),
    backgroundColor: '#CCC',
    alignSelf: 'center',
    marginBottom: normalize(15),
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: normalize(45),
    borderRadius: normalize(8),
    paddingLeft: normalize(12),
    paddingRight: normalize(10),
    backgroundColor: '#fff',
    marginBottom: normalize(10),
    borderWidth: normalize(1),
    borderColor: '#FFD7EB',
  },
  searchInput: {
    flex: 1,
    fontFamily: Fonts.Inter_Regular,
    color: Colors.night_blue,
    fontSize: normalize(13),
  },
  listWrap: {
    flex: 1,
    position: 'relative',
    justifyContent: 'flex-start',
  },
  listContent: {
    paddingBottom: normalize(30),
  },
  touch: {
    paddingVertical: normalize(11),
    paddingHorizontal: normalize(8),
    flexDirection: 'row',
    gap: normalize(10),
  },
  row: {
    fontFamily: Fonts.Inter_Regular,
    color: Colors.night_blue,
    fontSize: normalize(14),
  },
  track: {
    position: 'absolute',
    right: normalize(isIos() ? 5 : 3),
    top: normalize(5),
    bottom: normalize(5),
    width: TRACK_WIDTH,
    backgroundColor: '#E6EAF2',
    borderRadius: TRACK_WIDTH,
  },
  thumb: {
    position: 'absolute',
    right: normalize(isIos() ? 1 : -1),
    width: THUMB_WIDTH,
    height: THUMB_HEIGHT,
    borderRadius: THUMB_WIDTH,
    backgroundColor: '#FFFFFF',
    shadowColor: Colors.black,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#EEF2FF',
  },
});

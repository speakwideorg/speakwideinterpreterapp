import { Colors, Fonts, Icons } from '@app/themes';
import { getImageFromCamera, getImageFromGallery } from '@app/utils/helpers';
import { isIos } from '@app/utils/helpers/Validation';
import { normalize } from '@app/utils/orientation';
import React, { useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Modal,
  TouchableOpacity,
  Image,
  Text,
} from 'react-native';

interface CustomImagePickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect?: Function;
}

export default function CustomImagePicker({
  visible = false,
  onClose = () => {},
  onSelect = () => {},
}: CustomImagePickerProps) {
  const translateSheetY = useRef(new Animated.Value(0)).current;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        style={styles.backdrop}
      />

      <Animated.View
        style={[
          styles.sheet,
          { marginBottom: isIos() ? translateSheetY : normalize(0) },
        ]}
      >
        <View style={styles.handle} />
        <View style={styles.listWrap}>
          <View style={styles.container}>
            <TouchableOpacity
              style={styles.touchContainer}
              onPress={async () => {
                await getImageFromCamera({
                  // isCrop: true,
                  callback: ({ path, uri }) => onSelect(path, uri),
                });
              }}
            >
              <Image source={Icons.icon_camera} style={styles.touchIcon} />
              <Text style={styles.touchText}>Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.touchContainer}
              onPress={async () => {
                await getImageFromGallery({
                  isCrop: true,
                  callback: ({ path, uri }) => onSelect(path, uri),
                });
              }}
            >
              <Image source={Icons.icon_galary} style={styles.touchIcon} />
              <Text style={styles.touchText}>Gallery</Text>
            </TouchableOpacity>
          </View>
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
  listWrap: {
    flex: 1,
    position: 'relative',
    justifyContent: 'flex-start',
    width: '100%',
  },
  container: {
    justifyContent: 'space-evenly',
    width: '100%',
    height: normalize(120),
    flexDirection: 'row',
    overflow: 'hidden',
    paddingBottom: normalize(20),
  },
  touchContainer: {
    width: '45%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.magnolia,
    borderRadius: normalize(10),
  },
  touchIcon: {
    width: 50,
    height: 50,
    objectFit: 'contain',
    tintColor: Colors.night_blue,
  },
  touchText: {
    fontFamily: Fonts.Inter_Medium,
    color: Colors.night_blue,
    fontSize: normalize(12),
  },
});

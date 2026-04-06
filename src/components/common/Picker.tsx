import React, { ReactNode } from 'react';
import {
  Modal,
  TouchableOpacity,
  StyleSheet,
  Image,
  View,
  Pressable,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { normalize } from '@app/utils/orientation';
import { Colors, Icons } from '@app/themes';
import { hexToRGB } from '@app/utils/helpers';
import { isIos } from '@app/utils/helpers/Validation';

export interface PickerModalProps {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  isShowCloseBtn?: boolean;
  isShowLine?: boolean;
  onBackDropPess?: () => void;
}

const Picker: React.FC<PickerModalProps> = ({
  visible,
  onClose,
  children,
  isShowCloseBtn = true,
  isShowLine = false,
  onBackDropPess,
}) => {
  return (
    <Modal visible={visible} transparent animationType="slide">
      {/* Blur Background */}
      <BlurView
        style={StyleSheet.absoluteFill}
        blurType="light"
        blurAmount={4}
      />
      <Pressable
        onPress={() => {
          if (onBackDropPess) {
            onBackDropPess();
          }
        }}
        style={[styles.backdrop, StyleSheet.absoluteFill]}
      />

      <View style={styles.modalContent}>
        {isShowLine && (
          <TouchableOpacity onPress={() => onClose()} style={styles.line} />
        )}
        {isShowCloseBtn && (
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.closeBtn}
            onPress={onClose}
          >
            <Image source={Icons.close} style={styles.close} />
          </TouchableOpacity>
        )}
        {children}
      </View>
    </Modal>
  );
};

export default Picker;

const styles = StyleSheet.create({
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: normalize(20),
    borderTopRightRadius: normalize(20),
    paddingTop: normalize(22),
    paddingBottom: normalize(15),
    paddingHorizontal: normalize(15),
    position: 'absolute',
    bottom: 0,
    width: '100%',
    zIndex: 111,
  },
  closeBtn: {
    position: 'absolute',
    top: normalize(-50),
    left: '50%',
    backgroundColor: Colors.white,
    borderRadius: normalize(40),
    padding: normalize(5),
    elevation: 3,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  backdrop: {
    backgroundColor: hexToRGB('#ACA3CA', isIos() ? 0.8 : 0.9),
    opacity: 0.5,
    position: 'absolute',
  },
  close: {
    height: normalize(22),
    width: normalize(22),
    tintColor: Colors.purple,
  },
  line: {
    backgroundColor: hexToRGB(Colors.dark_grey, 0.2),
    height: normalize(5),
    width: normalize(35),
    borderRadius: normalize(15),
    position: 'absolute',
    alignSelf: 'center',
    top: normalize(10),
  },
});

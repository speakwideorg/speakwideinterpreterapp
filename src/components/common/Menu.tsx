import { View, Text, Modal, Pressable, StyleSheet } from 'react-native';
import React, { FC, ReactNode } from 'react';
import { normalize } from '@app/utils/orientation';
import { Colors } from '@app/themes';
import { hexToRGB } from '@app/utils/helpers';
import { isIos } from '@app/utils/helpers/Validation';

type MenuProps = {
  isVisible: boolean;
  onClose: () => void;
  top?: number;
  right?: number;
  children: ReactNode;
};

const Menu: FC<MenuProps> = ({
  children,
  isVisible,
  onClose,
  right = 0,
  top = 0,
}) => {
  return (
    <Modal transparent animationType="fade" visible={isVisible}>
      <Pressable style={styles.overlay} onPress={() => onClose()}>
        <View
          style={[
            {
              top: top,
              right: right + normalize(14),
            },
            styles.menuContainer,
          ]}
        >
          {!isIos() && (
            <View style={styles.arrow}>
              <View style={styles.arrowInner} />
            </View>
          )}
          <View style={styles.menuViewer}>
            {isIos() && (
              <View style={styles.arrow}>
                <View style={styles.arrowInner} />
              </View>
            )}
            {/* Menu items */}
            {children}
          </View>
        </View>
      </Pressable>
    </Modal>
  );
};

export default Menu;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  menuContainer: {
    position: 'absolute',
    backgroundColor: Colors.white,
    borderRadius: normalize(8),
    shadowColor: hexToRGB(Colors.black,isIos() ? 0.8 : 0.6),
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 10,
    zIndex: 100,
  },
  menuViewer: {
    backgroundColor: Colors.white,
    paddingVertical: normalize(5),
    paddingHorizontal: normalize(10),
    borderRadius: normalize(8),
  },
  arrowInner: {
    width: 0,
    height: 0,
    borderLeftWidth: normalize(8),
    borderRightWidth: normalize(8),
    borderBottomWidth: normalize(8),
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: Colors.white,
    shadowColor: hexToRGB(Colors.black, isIos() ? 1 : 0.4),
    shadowOpacity: 0.1,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: -2 },
    elevation: 3,
  },
  arrow: {
    position: 'absolute',
    top: -normalize(8),
    right: normalize(5),
    width: normalize(20),
    height: normalize(10),
    justifyContent: 'center',
    alignItems: 'center',
  },
});

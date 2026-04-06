import { Colors, Fonts, Icons } from '@app/themes';
import { getImageFromCamera } from '@app/utils/helpers';
import { getFileFromLocal } from '@app/utils/helpers/FileActions';
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

interface PickedFile {
  name: string;
  uri: string;
  type?: string;
}

interface CustomImageFilePickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect?: (path: string, uri: string, file: PickedFile) => void;
}

export default function CustomImageFilePicker({
  visible = false,
  onClose = () => {},
  onSelect = () => {},
}: CustomImageFilePickerProps) {
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
            {/* CAMERA */}
            <TouchableOpacity
              style={styles.touchContainer}
              onPress={async () => {
                await getImageFromCamera({
                  callback: ({ path, uri }) => {
                    const finalUri = uri || path || '';
                    console.log('uri or path===>', uri, path);

                    // extract filename safely
                    const fileName =
                      uri?.split('/').pop() || `camera_${Date.now()}.jpg`;

                    const file = {
                      name: fileName,
                      uri: finalUri,
                      type: 'image/jpeg',
                    };

                    onSelect(path || finalUri, finalUri, file);
                    onClose();
                  },
                });
              }}
            >
              <Image source={Icons.icon_camera} style={styles.touchIcon} />
              <Text style={styles.touchText}>Camera</Text>
            </TouchableOpacity>

            {/* FILE / GALLERY */}
            <TouchableOpacity
              style={styles.touchContainer}
              onPress={async () => {
                await getFileFromLocal({
                  isMultiple: false,
                  callback: files => {
                    const picked = files?.[0]?.path;
                    if (!picked) return;

                    const file = {
                      name: picked.name || '',
                      uri: picked.uri || '',
                      type: picked.type || 'image/jpeg',
                    };

                    onSelect(picked.name || '', picked.uri || '', file);
                    onClose();
                  },
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
    width: '100%',
  },
  container: {
    justifyContent: 'space-evenly',
    width: '100%',
    height: normalize(120),
    flexDirection: 'row',
    paddingBottom: normalize(20),
  },
  touchContainer: {
    width: '45%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.magnolia,
    borderRadius: normalize(10),
  },
  touchIcon: {
    width: 50,
    height: 50,
    tintColor: Colors.night_blue,
  },
  touchText: {
    fontFamily: Fonts.Inter_Medium,
    color: Colors.night_blue,
    fontSize: normalize(12),
  },
});

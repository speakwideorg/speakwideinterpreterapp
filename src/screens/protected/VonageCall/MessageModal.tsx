import React, { useState } from 'react';
import Css from '@app/themes/Css';
import Modal from 'react-native-modal';
import LinearGradient from 'react-native-linear-gradient';
import {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import getVonageStyles from './styles';
import {
  FlatList,
  Image,
  Keyboard,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Linking,
} from 'react-native';
import { Colors, Icons } from '@app/themes';
import { showMessage } from '@app/utils/helpers/Toast';
import { VonageMessageInterface } from '@app/types/vonage';
import useKeyboardVisible from '@app/utils/hooks/useKeyboardVisible';
import { normalize } from '@app/utils/orientation';
import moment from 'moment';
import { URL_LIST } from '@app/utils/constants';
import { downloadFile } from '@app/utils/helpers/FileActions';

const MessageModal = ({
  visible = false,
  setVisible = () => {},
  message = '',
  setMessage = () => {},
  sendMessage = () => {},
  uploadFile = () => {},
  messageList = [],
  userName = '',
  onEndReached = () => {},
  userId = '',
}: {
  oponentUserId: string;
  oponentUserName: string;
  oponentUserProfileImage: string;
  userName: string;
  visible: boolean;
  setVisible: Function;
  message: string;
  setMessage: Function;
  sendMessage: Function;
  messageList: VonageMessageInterface[];
  uploadFile: Function;
  onEndReached: Function;
  userId?: string;
}) => {
  const { isKeyboardVisible } = useKeyboardVisible();
  const insets = useSafeAreaInsets();
  const styles = getVonageStyles(insets);

  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');

  return (
    <>
      <Modal
        isVisible={visible}
        backdropOpacity={0}
        style={styles.modalOuterContainer}
        propagateSwipe
        animationIn="pulse"
        animationOut="fadeOutDown"
        animationInTiming={700}
        animationOutTiming={300}
        useNativeDriver={true}
        onBackButtonPress={() => {
          Keyboard.dismiss();
          setVisible(false);
        }}
      >
        <View
          style={styles.modalMiddleContainer}
          onStartShouldSetResponder={(): any => {
            Keyboard.dismiss();
          }}
        >
          <SafeAreaProvider>
            <SafeAreaView style={[Css.w100, Css.f1]}>
              <View
                style={[
                  Css.w100,
                  Css.f1,
                  Css.aic,
                  isKeyboardVisible ? Css.jcfs : Css.jcc,
                ]}
              >
                <View
                  style={
                    isKeyboardVisible
                      ? styles.modalInnerContainerKeyboard
                      : styles.modalInnerContainer
                  }
                >
                  <View style={[styles.modalVisibleOuterContainer]}>
                    <LinearGradient
                      useAngle
                      angle={135}
                      colors={[Colors.titan, Colors.purple_knit]}
                      style={styles.modalVisibleContainerGradient}
                    />
                    <View style={styles.modalVisibleInnerContainer}>
                      <View style={styles.modalTopContainer}>
                        <View style={styles.modalTopContainerTextContainer}>
                          <Text style={styles.modalTopContainerProfileText}>
                            Chat
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => setVisible(false)}
                          style={styles.modalTopContainerCrossButton}
                        >
                          <Image
                            source={Icons.close}
                            style={styles.modalTopContainerCrossButtonImage}
                          />
                        </TouchableOpacity>
                      </View>

                      <View style={[Css.w100, Css.f1]}>
                        {messageList?.length > 0 ? (
                          <FlatList
                            inverted
                            keyExtractor={(item, index) =>
                              item._id ?? `msg-${index}`
                            }
                            data={messageList}
                            renderItem={({ item }) => {
                              if (!item?.message) return null;

                              let messageDetails;
                              try {
                                messageDetails = JSON.parse(item.message);
                              } catch (error) {
                                console.log('Error parsing message:', error);
                                return null;
                              }

                              const isMe =
                                messageDetails?.id === userId ||
                                item?.senderName === userName;

                              const isImage =
                                messageDetails?.type === 'file' &&
                                messageDetails?.fileData?.fileType?.startsWith(
                                  'image/',
                                );

                              const fileUrl =
                                messageDetails?.type === 'file' &&
                                messageDetails?.fileData?.downloadUrl
                                  ? URL_LIST.bucket_url +
                                    messageDetails.fileData.downloadUrl +
                                    '/' +
                                    messageDetails.fileData.fileName
                                  : null;

                              console.log('fileurl==>', fileUrl);

                              return (
                                <TouchableOpacity
                                  activeOpacity={0.7}
                                  style={[
                                    styles.modalMessageContainer,
                                    isMe ? Css.asfe : Css.asfs,
                                  ]}
                                  disabled={!fileUrl}
                                  onPress={async () => {
                                    if (!fileUrl) return;

                                    if (isImage) {
                                      setSelectedImageUrl(fileUrl);
                                      setSelectedFileName(
                                        messageDetails?.fileData?.fileName ||
                                          '',
                                      );
                                      setImageModalVisible(true);
                                    } else {
                                      try {
                                        await Linking.openURL(fileUrl);
                                      } catch (error) {
                                        showMessage('Unable to open file');
                                      }
                                    }
                                  }}
                                >
                                  <View style={styles.modalMessageTopContainer}>
                                    {isImage && fileUrl ? (
                                      <Image
                                        source={{ uri: fileUrl }}
                                        style={{
                                          width: normalize(150),
                                          height: normalize(150),
                                          borderRadius: normalize(8),
                                        }}
                                        resizeMode="cover"
                                      />
                                    ) : (
                                      <Text style={styles.modalMessageText}>
                                        {messageDetails?.type === 'file'
                                          ? messageDetails?.fileData
                                              ?.fileName || 'File'
                                          : messageDetails?.message || ''}
                                      </Text>
                                    )}
                                  </View>
                                  <View
                                    style={styles.modalMessageBottomContainer}
                                  >
                                    {messageDetails?.type === 'file' && (
                                      <View
                                        style={[
                                          styles.modalMessageIconContainer,
                                          {
                                            width: normalize(16),
                                            height: normalize(16),
                                            backgroundColor: Colors.transparent,
                                          },
                                        ]}
                                      >
                                        <Image
                                          style={styles.modalMessageIcon}
                                          source={Icons.icon_download}
                                        />
                                      </View>
                                    )}
                                    <Text
                                      style={{
                                        fontSize: 11,
                                        color: Colors.dust,
                                        marginLeft:
                                          messageDetails?.type === 'file'
                                            ? 5
                                            : 0,
                                      }}
                                    >
                                      {messageDetails?.timestamp
                                        ? moment().diff(
                                            moment(messageDetails.timestamp),
                                            'days',
                                          ) >= 1
                                          ? moment(
                                              messageDetails.timestamp,
                                            ).format('DD/MM/YY')
                                          : 'Today ' +
                                            moment(
                                              messageDetails.timestamp,
                                            ).format('hh:mm A')
                                        : 'Now'}
                                    </Text>
                                  </View>
                                </TouchableOpacity>
                              );
                            }}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={[Css.g2, Css.p2]}
                            onEndReachedThreshold={0.3}
                            onEndReached={onEndReached}
                          />
                        ) : (
                          <View style={[Css.w100, Css.f1, Css.jcc, Css.aic]}>
                            <Text>No Messages</Text>
                          </View>
                        )}
                      </View>

                      <View style={styles.modalBottomContainer}>
                        <TouchableOpacity
                          style={styles.modalSendButton}
                          onPress={() => {
                            uploadFile();
                          }}
                        >
                          <Image
                            source={Icons.icon_upload}
                            style={styles.modalSendButtonIcon}
                            tintColor={Colors.white}
                          />
                        </TouchableOpacity>
                        <TextInput
                          onChangeText={e => setMessage(e)}
                          value={message}
                          style={styles.modalTextInput}
                          placeholder="enter message . . ."
                          placeholderTextColor={Colors.dust}
                        />
                        <TouchableOpacity
                          style={styles.modalSendButton}
                          onPress={() => {
                            if (message.trim()) {
                              sendMessage(message);
                            } else {
                              showMessage('Empty Message');
                            }
                          }}
                        >
                          <Image
                            source={Icons.icon_send}
                            style={styles.modalSendButtonIcon}
                            tintColor={Colors.white}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </SafeAreaView>
          </SafeAreaProvider>
        </View>
      </Modal>

      {/* Image Viewer Modal */}
      <Modal
        isVisible={imageModalVisible}
        backdropOpacity={0.8}
        style={styles.modalOuterContainer}
        propagateSwipe
        animationIn="fadeIn"
        animationOut="fadeOut"
        animationInTiming={300}
        animationOutTiming={300}
        useNativeDriver={true}
        onBackButtonPress={() => setImageModalVisible(false)}
      >
        <View style={[Css.w90, Css.f1, Css.jcc, Css.aic]}>
          <View style={[styles.modalInnerContainer, { height: '80%' }]}>
            <View style={[styles.modalTopContainer, Css.w100]}>
              <View style={styles.modalTopContainerTextContainer}>
                <Text
                  style={styles.modalTopContainerProfileText}
                  numberOfLines={1}
                >
                  {selectedFileName}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setImageModalVisible(false)}
                style={styles.modalTopContainerCrossButton}
              >
                <Image
                  source={Icons.close}
                  style={styles.modalTopContainerCrossButtonImage}
                />
              </TouchableOpacity>
            </View>
            <View style={[Css.w100, Css.f1]}>
              {selectedImageUrl ? (
                <Image
                  source={{ uri: selectedImageUrl }}
                  style={[Css.w100, Css.f1]}
                  resizeMode="contain"
                />
              ) : (
                <View style={[Css.w100, Css.f1, Css.jcc, Css.aic]}>
                  <Text>Unable to load image</Text>
                </View>
              )}
            </View>
            <View style={styles.modalBottomContainer}>
              <TouchableOpacity
                style={styles.modalSendButton}
                onPress={async () => {
                  try {
                    await downloadFile({
                      fileUrl: selectedImageUrl,
                      fileName: selectedFileName,
                    });
                    showMessage('Download started');
                    setImageModalVisible(false);
                  } catch (error) {
                    showMessage('Download failed');
                  }
                }}
              >
                <Image
                  source={Icons.icon_download}
                  style={styles.modalSendButtonIcon}
                  tintColor={Colors.white}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default MessageModal;

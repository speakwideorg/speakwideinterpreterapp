/* eslint-disable react-hooks/exhaustive-deps */
import React, { memo, useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  TextInput,
} from 'react-native';
import { Colors, Fonts, Icons } from '@app/themes';
import { normalize } from '@app/utils/orientation';
import { useAppDispatch, useAppSelector } from '@app/store';
import { formatDateTime } from '@app/utils/helpers';
import { showMessage } from '@app/utils/helpers/Toast';
import { getSocket } from '@app/utils/socket/socket';
import moment from 'moment';
import {
  downloadFile,
  FileCallback,
  getFileFromLocal,
} from '@app/utils/helpers/FileActions';
import { URL_LIST } from '@app/utils/constants';
import Css from '@app/themes/Css';
import {
  disputeChatListRequest,
  resetDefaults_interpreterSession,
  uploadInterpreterMessageFileRequest,
} from '@app/store/slice/interpreterSession.slice';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const SessionIssueModal = () => {
  const dispatch = useAppDispatch();
  const {
    status,
    disputeDetailsResponse,
    disputeChatListResponse,
    uploadInterpreterMessageFileResponse,
  } = useAppSelector(state => state.interpreterSession);
  const profileDetailsResponse = useAppSelector(
    state => state.auth.profileDetailsResponse,
  );

  const [message, setMessage] = useState('');
  const [messageList, setMessageList] = useState<any[]>([]);
  const flatListRef = useRef<FlatList>(null);

  console.log('disputeDetailsResponse', disputeDetailsResponse);

  // Initial load when dispute changes
  useEffect(() => {
    if (disputeDetailsResponse?.data?._id) {
      setMessageList([]);
      dispatch(
        disputeChatListRequest({
          limit: 10000,
          interpreter_dispute_id: disputeDetailsResponse?.data?._id,
          sender_type: 'interpreter',
        }),
      );
    }
  }, [disputeDetailsResponse?.data?._id]);

  // Handle socket events for real-time messages
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const roomId = messageList?.[0]?.room_id;
    const interpreterId = messageList?.[0]?.interpreter_id;

    console.log('first1 ', roomId, interpreterId, profileDetailsResponse);

    if (!roomId || !interpreterId) return;
    console.log('first');

    const handleNewMessage = (data: any) => {
      console.log('Received new message:', data);

      // Add all messages from socket (including own messages from server confirmation)
      setMessageList(prev => {
        // Check if message already exists to prevent duplicates
        const exists = prev.some(msg => msg._id === data._id);
        if (exists) return prev;

        return [...prev, data];
      });

      // Scroll to bottom after loading
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 50);
    };

    const eventName = `${roomId}_${interpreterId}_support_dispute_new_message`;

    socket.on(eventName, handleNewMessage);

    return () => {
      socket.off(eventName, handleNewMessage);
    };
  }, [messageList?.[0]?.room_id, profileDetailsResponse?._id]);

  // Handle API response for message list
  useEffect(() => {
    if (disputeChatListResponse?.data?.docs) {
      const apiDocs = disputeChatListResponse.data.docs;

      // Set messages (assuming API returns oldest first)
      setMessageList(apiDocs);

      // Scroll to bottom after loading
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [disputeChatListResponse]);

  // Ensure scroll to bottom when messages are loaded
  useEffect(() => {
    if (messageList.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 50);
    }
  }, [messageList.length]);

  // Handle file upload response
  useEffect(() => {
    switch (status) {
      case 'interpreterSession/uploadInterpreterMessageFileSuccess': {
        dispatch(resetDefaults_interpreterSession());
        const socket = getSocket();
        if (!socket) return;

        // Send file message via socket (server will send it back via socket event)
        socket.emit('send_support_dispute_message', {
          sender_type: 'interpreter',
          interpreter_dispute_id: disputeDetailsResponse?.data?._id,
          chat_type: 'file',
          files: [
            {
              file: uploadInterpreterMessageFileResponse?.data?.[0]?.fileName,
              size: uploadInterpreterMessageFileResponse?.data?.[0]?.fileSize,
              type: uploadInterpreterMessageFileResponse?.data?.[0]?.fileType,
            },
          ],
        });
        break;
      }
      case 'interpreterSession/uploadInterpreterMessageFileFailure': {
        dispatch(resetDefaults_interpreterSession());
        showMessage('File upload failed');
        break;
      }
    }
  }, [status]);

  // Handle file upload
  const handleUploadfile = async (data: FileCallback[]) => {
    if (data?.length > 0) {
      const payload = new FormData();
      payload.append('files', data[0]?.path);
      dispatch(uploadInterpreterMessageFileRequest(payload));
    }
  };

  const uploadFile = async () => {
    await getFileFromLocal({
      callback: handleUploadfile,
    });
  };

  // Send text message
  const handleSendMessage = () => {
    if (message.trim()) {
      const messageToSend = message.trim();
      setMessage('');

      const socket = getSocket();
      if (!socket) {
        showMessage('Connection error. Please try again.');
        return;
      }

      // Send message via socket (server will send it back via socket event)
      socket.emit('send_support_dispute_message', {
        sender_type: 'interpreter',
        text: messageToSend,
        chat_type: 'text',
        interpreter_dispute_id: disputeDetailsResponse?.data?._id,
      });
    } else {
      showMessage('Please enter a message');
    }
  };

  console.log('Message details==>', profileDetailsResponse);

  return (
    <KeyboardAwareScrollView
      style={styles.container}
      keyboardShouldPersistTaps="handled"
      // behavior={Platform.OS === 'ios' ? 'position' : 'height'}
      // keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <View style={styles.rowBetween}>
        <View style={styles.rowCenter}>
          <Text style={styles.title}>Session Issues</Text>
          <View style={styles.ticketWrapper}>
            <Text style={styles.ticket}>
              {disputeDetailsResponse?.data?.dispute_id}
            </Text>
          </View>
        </View>
        <Text style={styles.date}>
          {
            formatDateTime(disputeDetailsResponse?.data?.date_initiated)
              .formattedDate
          }
        </Text>
      </View>

      <Text style={styles.desc}>
        {disputeDetailsResponse?.data?.issue_details}
      </Text>

      <TouchableOpacity style={styles.rowCenter}>
        <Text style={styles.responseHeader}>
          Messages ({messageList.length})
        </Text>
        <Image source={Icons.arrow_forward} style={styles.arrowIcon} />
      </TouchableOpacity>

      <FlatList
        ref={flatListRef}
        style={{ maxHeight: normalize(300) }}
        keyExtractor={(item, index) => item._id || index.toString()}
        data={messageList}
        renderItem={({ item }) => {
          const messageDetails = item || {};

          const isInterpreterMessage =
            item?.sender_type === 'interpreter' &&
            ((item?.sender_data &&
              item?.sender_data?._id === item?.interpreter_id) ||
              item?.sender_id === profileDetailsResponse?._id);

          return (
            <TouchableOpacity
              activeOpacity={0.5}
              style={[
                styles.modalMessageContainer,
                isInterpreterMessage
                  ? [Css.asfe, { backgroundColor: Colors.purple }]
                  : [Css.asfs, { backgroundColor: Colors.hawkes_blue }],
              ]}
              disabled={messageDetails?.chat_type !== 'file'}
              onPress={async () => {
                if (messageDetails?.chat_type === 'file') {
                  await downloadFile({
                    fileUrl:
                      URL_LIST.bucket_url +
                      '/uploads/message_files/' +
                      messageDetails?.files?.[0]?.file,
                    fileName: messageDetails?.files?.[0]?.file,
                  });
                }
              }}
            >
              <View
                style={[
                  styles.modalMessageTopContainer,
                  {
                    alignSelf: isInterpreterMessage ? 'flex-end' : 'flex-start',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.modalMessageText,
                    isInterpreterMessage
                      ? { color: Colors.white }
                      : { color: Colors.black },
                  ]}
                >
                  {messageDetails?.chat_type === 'file'
                    ? messageDetails?.files[0]?.file
                    : messageDetails?.text}
                </Text>
              </View>
              <View style={styles.modalMessageBottomContainer}>
                {messageDetails?.chat_type === 'file' ? (
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
                ) : (
                  <View />
                )}
                <Text
                  style={[
                    isInterpreterMessage
                      ? { color: Colors.white }
                      : { color: Colors.black },
                    { fontSize: normalize(10) },
                  ]}
                >
                  {moment(messageDetails?.chat_date).isSame(moment(), 'day')
                    ? `Today ${moment(messageDetails?.chat_date).format(
                        'hh:mm A',
                      )}`
                    : moment(messageDetails?.chat_date).format(
                        'DD/MM/YY hh:mm A',
                      )}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[Css.g2, Css.p2]}
        ListEmptyComponent={() => (
          <View style={[Css.w100, Css.f1, Css.jcc, Css.aic]}>
            <Text>No Messages</Text>
          </View>
        )}
      />

      <View style={styles.modalBottomContainer}>
        <TouchableOpacity style={styles.modalSendButton} onPress={uploadFile}>
          <Image
            source={Icons.icon_upload}
            style={styles.modalSendButtonIcon}
            tintColor={Colors.white}
          />
        </TouchableOpacity>
        <TextInput
          onChangeText={(e: string) => setMessage(e)}
          value={message}
          style={styles.modalTextInput}
          placeholder="enter message . . ."
          placeholderTextColor={Colors.dust}
          onSubmitEditing={handleSendMessage}
          returnKeyType="send"
        />
        <TouchableOpacity
          style={styles.modalSendButton}
          onPress={handleSendMessage}
        >
          <Image
            source={Icons.icon_send}
            style={styles.modalSendButtonIcon}
            tintColor={Colors.white}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAwareScrollView>
  );
};

export default memo(SessionIssueModal);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: normalize(10),
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontFamily: Fonts.Manrope_Medium,
    color: Colors.night_blue,
    fontSize: normalize(13),
  },
  ticketWrapper: {
    backgroundColor: '#F4EEFF',
    paddingHorizontal: normalize(10),
    paddingVertical: normalize(4),
    borderRadius: normalize(15),
    marginLeft: normalize(8),
  },
  ticket: {
    fontFamily: Fonts.Inter_Medium,
    color: Colors.purple,
    fontSize: normalize(9),
  },
  date: {
    fontFamily: Fonts.Manrope_Medium,
    color: Colors.night_blue,
    fontSize: normalize(10),
  },
  desc: {
    fontFamily: Fonts.Inter_Regular,
    color: Colors.dark_grey,
    fontSize: normalize(11),
    marginVertical: normalize(10),
  },
  responseHeader: {
    fontFamily: Fonts.Manrope_Medium,
    color: Colors.night_blue,
    fontSize: normalize(12),
  },
  arrowIcon: {
    height: normalize(10),
    width: normalize(10),
    tintColor: Colors.night_blue,
    transform: [{ rotate: '90deg' }],
    marginLeft: normalize(3),
  },
  responseContainer: {
    paddingBottom: normalize(20),
    backgroundColor: '#FFFDFA',
    paddingHorizontal: normalize(8),
    borderRadius: normalize(10),
    paddingTop: normalize(10),
  },
  responseCard: {
    flexDirection: 'row',
    paddingVertical: normalize(10),
  },
  responseDivider: {
    borderBottomWidth: normalize(1),
    borderColor: '#F3F3F3',
  },
  avatar: {
    width: normalize(40),
    height: normalize(40),
    borderRadius: normalize(40),
    marginRight: normalize(10),
  },
  name: {
    fontFamily: Fonts.Inter_Medium,
    color: Colors.night_blue,
    fontSize: normalize(12),
  },
  time: {
    fontFamily: Fonts.Inter_Medium,
    color: Colors.dark_grey,
    fontSize: normalize(10),
  },
  message: {
    fontFamily: Fonts.Inter_Regular,
    color: Colors.night_blue,
    fontSize: normalize(10),
    marginTop: normalize(6),
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: normalize(12),
  },
  status: {
    fontFamily: Fonts.Inter_Medium,
    color: Colors.night_blue,
    fontSize: normalize(10),
  },
  statusWrapper: {
    backgroundColor: '#FFF8F1',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: normalize(6),
    paddingHorizontal: normalize(8),
    borderRadius: normalize(15),
    marginLeft: normalize(10),
  },
  statusDot: {
    width: normalize(6),
    height: normalize(6),
    borderRadius: normalize(6),
    backgroundColor: Colors.purple,
    marginRight: normalize(6),
  },
  statusText: {
    fontFamily: Fonts.Inter_Medium,
    color: Colors.purple,
    fontSize: normalize(10),
  },

  modalBottomContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: normalize(5),
    gap: normalize(5),
    marginVertical: normalize(5),
  },
  modalTextInput: {
    flex: 1,
    backgroundColor: Colors.white_lilae,
    height: normalize(35),
    borderWidth: normalize(1.5),
    borderColor: Colors.white_chalk,
    borderRadius: normalize(8),
    fontSize: normalize(11),
    color: Colors.black,
    paddingHorizontal: normalize(5),
    paddingVertical: 0,
  },
  modalSendButton: {
    width: normalize(35),
    height: normalize(35),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.purple,
    borderWidth: normalize(1.5),
    borderColor: Colors.white_chalk,
    borderRadius: normalize(8),
  },
  modalSendButtonIcon: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  modalMessageContainer: {
    width: '80%',
    backgroundColor: Colors.hawkes_blue,
    paddingVertical: normalize(0),
    paddingHorizontal: normalize(10),
    borderRadius: normalize(10),
  },
  modalMessageTopContainer: {
    flexDirection: 'row',
    width: '100%',
  },
  modalMessageBottomContainer: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: normalize(20),
  },
  modalMessageIconContainer: {
    width: normalize(24),
    height: normalize(24),
    borderRadius: normalize(24),
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: Colors.white,
  },
  modalMessageIcon: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  modalMessageText: {
    marginVertical: normalize(5),
    flex: 1,
    fontSize: normalize(11),
    color: Colors.black,
    fontFamily: Fonts.DMSans_Regular,
    // lineHeight: normalize(20),
  },
});

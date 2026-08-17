/* eslint-disable react-hooks/exhaustive-deps */
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import React, { useRef, useState, useEffect, useCallback } from 'react';
import MyStatusBar from '@app/utils/helpers/MyStatusBar';
import { Colors, Fonts, Icons, Images } from '@app/themes';
import { normalize } from '@app/utils/orientation';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import Header from '@app/components/common/Header';
import { showMessage } from '@app/utils/helpers/Toast';
import { useAppDispatch, useAppSelector } from '@app/store';
import {
  disputeChatListRequest,
  resetDefaults_interpreterSession,
  uploadInterpreterMessageFileRequest,
} from '@app/store/slice/interpreterSession.slice';
import { getSocket } from '@app/utils/socket/socket';
import {
  downloadFile,
  FileCallback,
  getFileFromLocal,
} from '@app/utils/helpers/FileActions';
import moment from 'moment';
import { URL_LIST } from '@app/utils/constants';

const { width } = Dimensions.get('screen');

// Enable LayoutAnimation on Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface Message {
  _id: string;
  chat_type?: string;
  chat_date?: string;
  interpreter_id?: string;
  reciever_data?: {
    _id: string;
    name: string;
    email: string;
    profile_image: string;
  };
  sender_data?: {
    _id: string;
    name: string;
    email: string;
    profile_image: string;
  };
  text?: string;
  files?: Array<{ file: string; size: number; type: string }>;
  sender_type?: string;
  sender_id?: string;
  receiver_type?: string;
  receiver_id?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

const SupportChat = () => {
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  const [message, setMessage] = useState('');
  const dispatch = useAppDispatch();
  const isFocused = useIsFocused();
  const [messageList, setMessageList] = useState<any[]>([]);

  const disputeChatListResponse = useAppSelector(
    state => state.interpreterSession.disputeChatListResponse,
  );

  const { status, uploadInterpreterMessageFileResponse } = useAppSelector(
    state => state.interpreterSession,
  );
  const profileDetailsResponse = useAppSelector(
    state => state.auth.profileDetailsResponse,
  );

  // Auto-scroll when keyboard opens
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => {
      LayoutAnimation.easeInEaseOut();
      setTimeout(
        () => flatListRef.current?.scrollToEnd({ animated: true }),
        100,
      );
    });
    return () => showSub.remove();
  }, []);

  // Auto-fetch and poll chat messages every 3s while focused
  useEffect(() => {
    if (!isFocused) return;

    const fetchChatMessages = () => {
      dispatch(
        disputeChatListRequest({
          limit: 10000,
          sender_type: 'interpreter',
        }),
      );
    };

    fetchChatMessages();

    const intervalId = setInterval(fetchChatMessages, 3000);
    return () => clearInterval(intervalId);
  }, [isFocused]);

  // Join room on mount/socket connect
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const interpreterId =
      profileDetailsResponse?._id || messageList?.[0]?.interpreter_id;
    const roomId = messageList?.[0]?.room_id;

    if (interpreterId) {
      socket.emit('join_support_chat', { interpreter_id: interpreterId });
      socket.emit('join_room', { room_id: interpreterId });
    }
    if (roomId) {
      socket.emit('join_support_room', { room_id: roomId });
      socket.emit('join_room', { room_id: roomId });
    }
  }, [profileDetailsResponse?._id, messageList?.[0]?.room_id]);

  const renderMessage = useCallback(({ item }: { item: Message }) => {
    const isInterpreterMessage =
      item?.sender_type === 'interpreter' &&
      (item?.sender_data?._id === profileDetailsResponse?._id ||
        item?.sender_id === profileDetailsResponse?._id);
    console.log('isInterpreterMessage', item, profileDetailsResponse);

    const isFile = item?.chat_type === 'file';

    const bubbleWrapperStyle = isInterpreterMessage
      ? styles.sentWrapper
      : styles.receivedWrapper;

    const bubbleStyle = isInterpreterMessage
      ? styles.sentBubble
      : styles.receivedBubble;

    const messageTextStyle = isInterpreterMessage
      ? styles.sentMessageText
      : styles.receivedMessageText;

    const timeTextStyle = isInterpreterMessage
      ? styles.sentTimeText
      : styles.receivedTimeText;

    const messageText =
      item.status === 'uploading'
        ? 'Uploading...'
        : item?.text || item?.files?.[0]?.file;

    const rawDate = item?.chat_date || item?.createdAt || new Date();
    const formattedTime =
      moment().diff(moment(rawDate), 'days') >= 1
        ? moment(rawDate).format('DD/MM/YY hh:mm A')
        : `Today ${moment(rawDate).format('hh:mm A')}`;

    const handleFileDownload = async () => {
      if (!isFile || item.status === 'uploading') return;

      await downloadFile({
        fileUrl:
          URL_LIST.bucket_url +
          '/uploads/message_files/' +
          item?.files?.[0]?.file,
        fileName: item?.files?.[0]?.file || 'downloaded_file',
      });
    };

    return (
      <View style={styles.messageContainer}>
        <TouchableOpacity
          disabled={!isFile}
          onPress={handleFileDownload}
          style={bubbleWrapperStyle}
        >
          <View style={bubbleStyle}>
            <Text style={messageTextStyle}>{messageText}</Text>

            {isFile && (
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
          </View>
        </TouchableOpacity>

        <Text style={timeTextStyle}>{formattedTime}</Text>
      </View>
    );
  }, []);

  // Socket listener for real-time support chat messages (both sender & receiver)
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const interpreterId =
      profileDetailsResponse?._id || messageList?.[0]?.interpreter_id;
    const roomId = messageList?.[0]?.room_id;

    const handleRoomMessage = (data: Message) => {
      console.log('Received real-time support message:', data);
      if (!data) return;

      setMessageList(prev => {
        // If message with same _id already exists, don't duplicate
        const exists = prev.some(
          msg => msg._id === data._id || (data._id && msg._id === data._id),
        );

        if (exists) {
          return prev.map(msg => (msg._id === data._id ? { ...msg, ...data } : msg));
        }

        // If replacing optimistic temp sending message
        const hasTempMatch = prev.some(
          msg =>
            msg.status === 'sending' &&
            msg.text === data.text &&
            data.sender_type === 'interpreter',
        );

        if (hasTempMatch) {
          return prev.map(msg =>
            msg.status === 'sending' && msg.text === data.text
              ? { ...data, status: 'sent' }
              : msg,
          );
        }

        return [...prev, data];
      });

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    };

    // List of possible socket event names emitted by backend for support chat
    const eventNames: string[] = [
      'send_support_message',
      'receive_support_message',
      'support_new_message',
      'new_support_message',
      'support_message',
      'message',
      'new_message',
    ];

    if (interpreterId) {
      eventNames.push(`${interpreterId}_support_new_message`);
      eventNames.push(`support_new_message_${interpreterId}`);
      eventNames.push(`${interpreterId}_support_message`);
    }
    if (roomId && interpreterId) {
      eventNames.push(`${roomId}_${interpreterId}_support_new_message`);
    }
    if (roomId) {
      eventNames.push(`${roomId}_support_new_message`);
      eventNames.push(`support_new_message_${roomId}`);
      eventNames.push(`${roomId}_support_message`);
    }

    eventNames.forEach(evt => socket.on(evt, handleRoomMessage));

    return () => {
      eventNames.forEach(evt => socket.off(evt, handleRoomMessage));
    };
  }, [
    profileDetailsResponse?._id,
    messageList?.[0]?.room_id,
    messageList?.[0]?.interpreter_id,
  ]);

  useEffect(() => {
    if (disputeChatListResponse?.data?.docs) {
      const newDocs = disputeChatListResponse.data.docs;

      setMessageList(prev => {
        // Only trigger update if doc IDs changed or if new docs came
        const prevIds = prev.map(m => m._id).join(',');
        const newIds = newDocs.map((m: any) => m._id).join(',');

        if (prevIds !== newIds) {
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 150);
          return newDocs;
        }
        return prev;
      });
    }
  }, [disputeChatListResponse]);

  useEffect(() => {
    switch (status) {
      case 'interpreterSession/uploadInterpreterMessageFileSuccess': {
        dispatch(resetDefaults_interpreterSession());

        // Update the optimistic message with real data
        setMessageList(prev =>
          prev.map(msg =>
            msg.status === 'uploading' &&
            msg.sender_id === profileDetailsResponse?._id
              ? {
                  ...msg,
                  status: 'uploaded',
                  files: [
                    {
                      file: uploadInterpreterMessageFileResponse?.data?.[0]
                        ?.fileName,
                      size: uploadInterpreterMessageFileResponse?.data?.[0]
                        ?.fileSize,
                      type: uploadInterpreterMessageFileResponse?.data?.[0]
                        ?.fileType,
                    },
                  ],
                }
              : msg,
          ),
        );

        const socket = getSocket();

        if (!socket) return;
        socket.emit('send_support_message', {
          sender_type: 'interpreter',
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
        break;
      }
    }
  }, [status]);

  const uploadFile = async () => {
    await getFileFromLocal({
      callback: handleUploadfile,
    });
  };

  // Update handleSendMessage to optimistically add sent messages
  const handleSendMessage = () => {
    if (message.trim()) {
      const messageToSend = message;
      setMessage('');
      Keyboard.dismiss();

      // Create optimistic message
      const optimisticMessage: Message = {
        _id: `temp-${Date.now()}`, // Temporary ID
        text: messageToSend,
        chat_type: 'text',
        chat_date: new Date().toISOString(),
        interpreter_id: messageList?.[0]?.interpreter_id,
        sender_type: 'interpreter',
        sender_id: profileDetailsResponse?._id,
        status: 'sending', // Add a sending status
      };

      // Optimistically add to list
      setMessageList(prev => [...prev, optimisticMessage]);

      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);

      const socket = getSocket();
      if (!socket) return;

      socket.emit('send_support_message', {
        sender_type: 'interpreter',
        text: messageToSend,
        chat_type: 'text',
      });

      // Don't refresh immediately - let socket update handle it
    } else {
      showMessage('Empty Message');
    }
  };

  // Update handleUploadfile similarly
  const handleUploadfile = async (data: FileCallback[]) => {
    if (data?.length > 0) {
      const fileInfo = data[0]?.path;
      // Create optimistic file message
      const optimisticMessage: Message = {
        _id: `temp-${Date.now()}`,
        chat_type: 'file',
        files: [
          {
            file: fileInfo?.name || 'file',
            size: (fileInfo as any)?.size || 0,
            type: fileInfo?.type || 'file',
          },
        ],
        chat_date: new Date().toISOString(),
        interpreter_id: messageList?.[0]?.interpreter_id,
        sender_type: 'interpreter',
        sender_id: profileDetailsResponse?._id,
        status: 'uploading',
      };

      setMessageList(prev => [...prev, optimisticMessage]);

      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);

      const payload = new FormData();
      payload.append('files', fileInfo as any);

      dispatch(uploadInterpreterMessageFileRequest(payload));
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={Images.top_shape}
        resizeMode="contain"
        style={styles.topShape}
      />
      <MyStatusBar
        backgroundColor="transparent"
        barStyle="dark-content"
        translucent
      />

      <View style={styles.contentWrapper}>
        {/* Header */}
        <Header isBack isShowProfile={false} />

        {/* Chat Container */}
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + 44 : 0}
        >
          <LinearGradient
            colors={['#FFFFFF', '#F8F6F4']}
            style={styles.gradientContainer}
          >
            <View style={styles.chatBox}>
              <FlatList
                ref={flatListRef}
                data={messageList}
                keyExtractor={item => item._id}
                renderItem={renderMessage}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.flatListContent}
                onContentSizeChange={() =>
                  flatListRef.current?.scrollToEnd({ animated: true })
                }
                keyboardShouldPersistTaps="handled"
                ListEmptyComponent={() => (
                  <View style={{ alignItems: 'center', marginTop: 20 }}>
                    <Text style={styles.noMessagesText}>No Messages Yet.</Text>
                  </View>
                )}
              />
            </View>

            {/* Input Container */}
            <View
              style={[
                styles.inputContainer,
                {
                  paddingBottom:
                    Platform.OS === 'ios'
                      ? Math.max(insets.bottom, 10)
                      : insets.bottom + 30,
                },
              ]}
            >
              <TouchableOpacity
                style={styles.actionButton}
                onPress={uploadFile}
                activeOpacity={0.7}
              >
                <Image
                  source={Icons.icon_upload}
                  style={styles.actionButtonIcon}
                />
              </TouchableOpacity>

              <View style={styles.textInputWrapper}>
                <TextInput
                  onChangeText={setMessage}
                  value={message}
                  style={styles.textInput}
                  placeholder="Type a message..."
                  placeholderTextColor={Colors.dust}
                  multiline
                  maxLength={500}
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.actionButton,
                  message.trim() && styles.sendButtonActive,
                ]}
                onPress={handleSendMessage}
                activeOpacity={0.7}
                disabled={!message.trim()}
              >
                <Image
                  source={Icons.icon_send}
                  style={styles.actionButtonIcon}
                />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
};

export default SupportChat;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.ceramic,
  },
  topShape: {
    height: normalize(340),
    width,
    position: 'absolute',
    top: 0,
  },
  contentWrapper: {
    flex: 1,
    backgroundColor: Colors.white,
    marginTop: normalize(25),
    borderTopLeftRadius: normalize(20),
    borderTopRightRadius: normalize(20),
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  gradientContainer: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  chatBox: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  flatListContent: {
    padding: normalize(16),
    paddingBottom: normalize(20),
  },
  messageContainer: {
    marginBottom: normalize(16),
  },
  dateWrapper: {
    alignSelf: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(6),
    borderRadius: normalize(16),
    marginVertical: normalize(12),
    borderWidth: 1,
    borderColor: '#E8E8E8',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  dateText: {
    fontFamily: Fonts.Inter_Medium,
    fontSize: normalize(11),
    color: '#6B6B6B',
  },
  sentWrapper: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
    marginBottom: normalize(4),
  },
  receivedWrapper: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'flex-end',
    marginBottom: normalize(4),
  },
  sentBubble: {
    backgroundColor: '#F2EAFF',
    paddingHorizontal: normalize(14),
    paddingVertical: normalize(10),
    borderRadius: normalize(16),
    borderBottomRightRadius: normalize(4),
    maxWidth: '75%',
    marginRight: normalize(8),
    shadowColor: '#9C27B0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  receivedBubble: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: normalize(14),
    paddingVertical: normalize(10),
    borderRadius: normalize(16),
    borderBottomLeftRadius: normalize(4),
    maxWidth: '75%',
    marginLeft: normalize(8),
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  avatarSmall: {
    width: normalize(28),
    height: normalize(28),
    borderRadius: normalize(14),
    borderWidth: 2,
    borderColor: Colors.white,
  },
  sentMessageText: {
    fontFamily: Fonts.Inter_Regular,
    fontSize: normalize(13),
    color: '#2D2D2D',
    lineHeight: normalize(18),
  },
  receivedMessageText: {
    fontFamily: Fonts.Inter_Regular,
    fontSize: normalize(13),
    color: '#2D2D2D',
    lineHeight: normalize(18),
  },
  sentTimeText: {
    fontFamily: Fonts.Inter_Regular,
    fontSize: normalize(10),
    color: '#9B9B9B',
    textAlign: 'right',
    marginRight: normalize(8),
  },
  receivedTimeText: {
    fontFamily: Fonts.Inter_Regular,
    fontSize: normalize(10),
    color: '#9B9B9B',
    textAlign: 'left',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: normalize(12),
    paddingTop: normalize(12),
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    gap: normalize(8),
  },
  textInputWrapper: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    borderRadius: normalize(24),
    borderWidth: 1,
    borderColor: '#E8E8E8',
    minHeight: normalize(44),
    maxHeight: normalize(100),
    justifyContent: 'center',
  },
  textInput: {
    flex: 1,
    fontSize: normalize(14),
    color: Colors.black,
    fontFamily: Fonts.Inter_Regular,
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(10),
    paddingTop: Platform.OS === 'ios' ? normalize(12) : normalize(10),
  },
  actionButton: {
    width: normalize(44),
    height: normalize(44),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.purple,
    borderRadius: normalize(22),
    shadowColor: Colors.purple,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  sendButtonActive: {
    backgroundColor: Colors.purple,
    transform: [{ scale: 1 }],
  },
  actionButtonIcon: {
    width: normalize(32),
    height: normalize(32),
    tintColor: Colors.white,
    resizeMode: 'contain',
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
  noMessagesText: {
    fontFamily: Fonts.Inter_SemiBold,
    fontSize: normalize(14),
    color: '#9B9B9B',
  },
});

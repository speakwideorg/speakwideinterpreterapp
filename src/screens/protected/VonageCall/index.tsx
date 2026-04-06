/* eslint-disable react-hooks/exhaustive-deps */
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RouteProp, useIsFocused, useRoute } from '@react-navigation/native';
import { Colors, Icons, Images } from '@app/themes';
import { useAppDispatch, useAppSelector } from '@app/store';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getInterpreterMsgHistoryRequest,
  resetInterpreterSessionToken,
  resetDefaults_interpreterSession,
  sendInterpreterMsgRequest,
  uploadInterpreterMessageFileRequest,
} from '@app/store/slice/interpreterSession.slice';
import getVonageStyles from './styles';
import { VonageMessageInterface } from '@app/types/vonage';
import { OTPublisher, OTSession, OTSubscriber } from 'opentok-react-native';
import MessageModal from './MessageModal';
import { goBack } from '@app/navigation/RootNaivgation';
import { showMessage } from '@app/utils/helpers/Toast';
import { RootStackParamList, VonageCallProps } from '@app/types';
import { FileCallback, getFileFromLocal } from '@app/utils/helpers/FileActions';
import { normalize } from '@app/utils/orientation';

const VonageCall = () => {
  const { status } = useAppSelector(state => state.interpreterSession);
  const route = useRoute<RouteProp<RootStackParamList, 'VonageCall'>>();
  const { oponentUserName, oponentUserId, oponentUserProfileImage } =
    route?.params as VonageCallProps;
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();
  const styles = getVonageStyles(insets);

  const dispatch = useAppDispatch();

  const getInterpreterSessionTokenResponse = useAppSelector(
    state => state?.interpreterSession?.getInterpreterSessionTokenResponse,
  );

  const msgHistory: VonageMessageInterface[] = useAppSelector(
    state =>
      state.interpreterSession.getInterpreterMsgHistoryResponse?.data?.docs ||
      [],
  );

  const userId = useAppSelector(
    state => state.auth.profileDetailsResponse?._id,
  );
  const userName = useAppSelector(
    state => state.auth.profileDetailsResponse?.full_name,
  );
  const fileDetails = useAppSelector(
    state =>
      state.interpreterSession.uploadInterpreterMessageFileResponse?.data,
  );

  const sessionRef = useRef<any>(null);
  const subscriberRef = useRef<any>(null);
  const publisherRef = useRef<any>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isDisconnectingRef = useRef(false);
  const processedSignalIds = useRef<Set<string>>(new Set());

  const [streamId, setStreamId] = useState('');
  const [publishVideo, setPublishVideo] = useState(true);
  const [publishAudio, setPublishAudio] = useState(true);
  const [publishSound, setPublishSound] = useState(true);
  const [message, setMessage] = useState('');
  const [visibleChat, setVisibleChat] = useState(false);
  const [signal, setSignal] = useState<any>(undefined);
  const [msgList, setMsgList] = useState<VonageMessageInterface[]>([]);
  const [stopCallingApi, setStopCallingApi] = useState(false);
  const [isApiCalling, setIsApiCalling] = useState(false);
  const [page, setPage] = useState(1);
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const [camera, setCamera] = useState<'front' | 'back'>('front');
  // const [unreadCount, setUnreadCount] = useState(0);

  const isAudioOnly =
    getInterpreterSessionTokenResponse?.data?.session_format === 'Audio';

  // Cleanup function
  const cleanup = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, []);

  // Disconnect call function
  const disconnectCall = useCallback(
    async (isGoBack: boolean = true) => {
      if (isDisconnectingRef.current) return;
      isDisconnectingRef.current = true;

      cleanup();
      setRemainingTime(0);

      try {
        if (sessionRef?.current) {
          await sessionRef.current.disconnectSession();
        }
      } catch (error) {
        console.log('Session--- DisconnectCall error:', error);
      } finally {
        if (isGoBack) {
          goBack();
          showMessage('Call Ended');
        }
        isDisconnectingRef.current = false;
      }
    },
    [cleanup],
  );

  // Initialize component
  useEffect(() => {
    if (isFocused) {
      isDisconnectingRef.current = false;
      processedSignalIds.current.clear();
      setStreamId('');
      setPublishVideo(!isAudioOnly);
      setPublishAudio(true);
      setPublishSound(true);
      setVisibleChat(false);
      setMessage('');
      setMsgList([]);
      setPage(1);
      setStopCallingApi(false);
      setIsApiCalling(false);
      // setUnreadCount(0);
    }

    return () => {
      cleanup();
      disconnectCall(false);
      dispatch(resetInterpreterSessionToken());
      processedSignalIds.current.clear();
    };
  }, [isFocused, isAudioOnly]);

  // Timer countdown
  useEffect(() => {
    if (remainingTime > 0) {
      cleanup();

      timerIntervalRef.current = setInterval(() => {
        setRemainingTime(prev => {
          if (prev <= 1) {
            cleanup();
            disconnectCall(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => cleanup();
    }
  }, [remainingTime, disconnectCall, cleanup]);

  // Handle status changes
  useEffect(() => {
    if (!isFocused) return;

    switch (status) {
      case 'interpreterSession/uploadInterpreterMessageFileSuccess': {
        if (fileDetails?.[0]) {
          sendMessage({ type: 'file', fileData: fileDetails[0] });
        }
        dispatch(resetDefaults_interpreterSession());
        break;
      }
      case 'interpreterSession/uploadInterpreterMessageFileFailure': {
        dispatch(resetDefaults_interpreterSession());
        break;
      }
      case 'interpreterSession/getInterpreterMsgHistorySuccess': {
        if (page === 1) {
          setStopCallingApi(false);
          setMsgList(msgHistory || []);
        } else {
          if (msgHistory?.length) {
            setMsgList(prev => {
              // Prevent duplicates
              const existingIds = new Set(prev.map(msg => msg._id));
              const newMessages = msgHistory.filter(
                msg => !existingIds.has(msg._id),
              );
              return [...prev, ...newMessages];
            });
            setStopCallingApi(false);
          } else {
            setStopCallingApi(true);
          }
        }
        setIsApiCalling(false);
        dispatch(resetDefaults_interpreterSession());
        break;
      }
      case 'interpreterSession/getInterpreterMsgHistoryFailure': {
        setIsApiCalling(false);
        dispatch(resetDefaults_interpreterSession());
        break;
      }
    }
  }, [status, isFocused, page, msgHistory, fileDetails, dispatch]);

  // Set remaining time from end_date_time
  useEffect(() => {
    const endDateTime = getInterpreterSessionTokenResponse?.data?.end_date_time;

    if (!endDateTime) {
      console.log('VonageCall - No end_date_time available');
      return;
    }

    const endTime = new Date(endDateTime);
    const now = new Date();
    const timeDiff = endTime.getTime() - now.getTime();

    console.log('VonageCall - End time:', endTime);
    console.log('VonageCall - Current time:', now);
    console.log('VonageCall - Time diff (ms):', timeDiff);
    console.log(
      'VonageCall - Time diff (seconds):',
      Math.floor(timeDiff / 1000),
    );

    if (timeDiff > 0) {
      setRemainingTime(Math.floor(timeDiff / 1000));
    } else {
      console.log('VonageCall - Time already expired, disconnecting');
      disconnectCall(true);
    }

    return () => {
      setRemainingTime(0);
    };
  }, [getInterpreterSessionTokenResponse, disconnectCall]);

  // Load initial message history when chat opens
  useEffect(() => {
    if (visibleChat && msgList.length === 0 && !isApiCalling) {
      getMsgHistory(1);
    }
  }, [visibleChat]);

  const sendMessage = useCallback(
    ({
      msg,
      type,
      fileData,
    }: {
      msg?: string;
      type: 'user' | 'system' | 'file';
      fileData?: {
        fileName: string;
        fileSize: number;
        fileType: string;
        downloadUrl: string;
      };
    }) => {
      try {
        let message_temp = '';
        const timestamp = new Date().toISOString();
        const sessionId = getInterpreterSessionTokenResponse?.data?.sessionId;

        if (!sessionId || !userId || !userName) {
          console.log('Missing required data for sending message');
          return;
        }

        switch (type) {
          case 'user': {
            message_temp = JSON.stringify({
              id: userId,
              connectionId: sessionId,
              username: userName,
              message: msg || '',
              timestamp,
              type: 'user',
            });
            break;
          }
          case 'file': {
            message_temp = JSON.stringify({
              id: userId,
              connectionId: sessionId,
              username: userName,
              message: '',
              timestamp,
              type: 'file',
              fileData: fileData,
            });
            break;
          }
          default:
            return;
        }

        // Send signal
        setSignal({
          type: 'chat',
          data: message_temp,
        });

        // Send to backend
        dispatch(
          sendInterpreterMsgRequest({
            sessionId,
            senderName: userName,
            message: message_temp,
          }),
        );

        // Add to local message list immediately
        const newMessage: VonageMessageInterface = {
          _id: `temp-${Date.now()}`,
          message: message_temp,
          senderName: userName,
          createdAt: timestamp,
          updatedAt: timestamp,
        };

        setMsgList(prev => [newMessage, ...prev]);
        setMessage('');
      } catch (error) {
        console.log('Session--- sendMessage error:', error);
        showMessage('Failed to send message');
      }
    },
    [getInterpreterSessionTokenResponse, userId, userName, dispatch],
  );

  const handleUploadfile = useCallback(
    async (data: FileCallback[]) => {
      if (data?.length > 0 && data[0]?.path) {
        const payload = new FormData();
        payload.append('files', data[0].path);
        dispatch(uploadInterpreterMessageFileRequest(payload));
      }
    },
    [dispatch],
  );

  const getMsgHistory = useCallback(
    (pageNumber: number) => {
      const sessionId = getInterpreterSessionTokenResponse?.data?.sessionId;

      if (!sessionId) {
        console.log('No session ID available for message history');
        return;
      }

      if (isApiCalling) {
        console.log('API call already in progress');
        return;
      }

      setPage(pageNumber);
      setIsApiCalling(true);

      dispatch(
        getInterpreterMsgHistoryRequest({
          sessionId,
          page: pageNumber,
          limit: 20,
        }),
      );
    },
    [getInterpreterSessionTokenResponse, dispatch, isApiCalling],
  );

  const sessionEventHandlers = {
    streamCreated: (event: any) => {
      console.log('Stream created:', event.streamId);
      setStreamId(event.streamId);
    },
    streamDestroyed: (event: any) => {
      console.log('Stream destroyed:', event.streamId);
      setStreamId('');
    },
    sessionDisconnected: () => {
      console.log('Session disconnected');
      setStreamId('');
      setPublishAudio(false);
      setPublishVideo(false);
      setPublishSound(false);
      setVisibleChat(false);
      setMessage('');
    },
    signal: (event: any) => {
      // Handle both 'signal:chat' and 'chat' event types
      const eventType = event?.type || '';
      if (!eventType.includes('chat') || !event?.data) {
        return;
      }

      try {
        const parsed = JSON.parse(event.data);

        // Ignore self-sent messages
        if (parsed?.id === userId) return;

        // Create unique ID for the signal message
        const signalId = `signal-${parsed.timestamp}-${parsed.id}`;

        // Check if already processed
        if (processedSignalIds.current.has(signalId)) {
          console.log('Signal already processed:', signalId);
          return;
        }

        // Mark as processed
        processedSignalIds.current.add(signalId);

        // Increase unread only if chat is closed
        // if (!visibleChat) {
        //   setUnreadCount(prev => prev + 1);
        // }

        // Add message to the list
        const newMessage: VonageMessageInterface = {
          _id: signalId,
          message: event.data,
          senderName: parsed.username,
          createdAt: parsed.timestamp,
          updatedAt: parsed.timestamp,
        };

        setMsgList(prev => {
          // Double check if message exists
          if (prev.some(msg => msg._id === signalId)) {
            return prev;
          }
          return [newMessage, ...prev];
        });

        console.log('New message received from:', parsed.username);
      } catch (error) {
        console.log('Session--- signal parsing error:', error);
      }
    },
    error: (error: any) => {
      console.log('Session--- Session error:', error);
      showMessage('Session error occurred');
    },
  };

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  }, []);

  const handleEndReached = useCallback(() => {
    if (!stopCallingApi && !isApiCalling) {
      getMsgHistory(page + 1);
    }
  }, [stopCallingApi, isApiCalling, page, getMsgHistory]);

  const handleSendMessage = useCallback(
    (e: string) => {
      if (e.trim()) {
        sendMessage({ msg: e, type: 'user' });
      }
    },
    [sendMessage],
  );

  const toggleCamera = useCallback(() => {
    setCamera(prev => (prev === 'front' ? 'back' : 'front'));
  }, []);

  const handleUploadFilePress = useCallback(async () => {
    try {
      await getFileFromLocal({
        callback: handleUploadfile,
      });
    } catch (error) {
      console.log('Error selecting file:', error);
      showMessage('Failed to select file');
    }
  }, [handleUploadfile]);

  return (
    <View style={[styles.screenMainContainer, { marginBottom: insets.bottom }]}>
      <Image style={styles.backgroundImage} source={Images.vonage_back} />
      <Text style={styles.remainingTimetext}>
        {remainingTime > 0
          ? `${formatTime(remainingTime)} Remaining`
          : 'Time Expired'}
      </Text>
      <View style={styles.sessionMainContainer}>
        <OTSession
          ref={sessionRef}
          apiKey={getInterpreterSessionTokenResponse?.data?.apiKey ?? ''}
          sessionId={getInterpreterSessionTokenResponse?.data?.sessionId ?? ''}
          token={getInterpreterSessionTokenResponse?.data?.token ?? ''}
          style={styles.sessionContainer}
          eventHandlers={sessionEventHandlers}
          focusable={isFocused}
          signal={signal}
          options={{
            useTextureViews: true,
            androidZOrder: 'mediaOverlay',
          }}
        >
          <View style={styles.visibleContainer}>
            <View style={styles.topContainer}>
              {isAudioOnly ? (
                <View
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Image
                    source={
                      oponentUserProfileImage
                        ? { uri: oponentUserProfileImage }
                        : Icons.icon_user
                    }
                    style={{
                      width: normalize(100),
                      height: normalize(100),
                      borderRadius: normalize(50),
                      tintColor: oponentUserProfileImage
                        ? undefined
                        : Colors.white,
                    }}
                  />
                  <Text
                    style={{
                      color: Colors.white,
                      fontSize: normalize(18),
                      marginTop: normalize(10),
                    }}
                  >
                    {oponentUserName}
                  </Text>
                </View>
              ) : (
                <OTSubscriber
                  ref={subscriberRef}
                  streamId={streamId}
                  style={styles.OT_BigScreen}
                  properties={{
                    audioVolume: publishSound ? 100 : 0,
                    preferredFrameRate: 15,
                    preferredResolution: '640x480',
                  }}
                />
              )}
              {!isAudioOnly && (
                <View style={styles.switchSmallScreenContainer}>
                  <TouchableOpacity
                    style={styles.switchCameraContainer}
                    onPress={toggleCamera}
                  >
                    <Image source={Icons.camera} style={styles.cameraIcon} />
                  </TouchableOpacity>
                  <OTPublisher
                    style={styles.OT_SmallScreen}
                    properties={{
                      publishAudio: publishAudio,
                      publishVideo: publishVideo,
                      cameraPosition: camera,
                      frameRate: 30,
                      resolution: '640x480',
                    }}
                  />
                </View>
              )}
            </View>

            <View style={styles.bottomContainer}>
              <TouchableOpacity
                style={styles.bottomIconContainer}
                onPress={() => setPublishAudio(!publishAudio)}
              >
                <Image
                  source={publishAudio ? Icons.icon_mic : Icons.icon_mic_no}
                  style={styles.bottomIcon}
                />
              </TouchableOpacity>

              {!isAudioOnly && (
                <TouchableOpacity
                  style={styles.bottomIconContainer}
                  onPress={() => setPublishVideo(!publishVideo)}
                >
                  <Image
                    source={
                      publishVideo ? Icons.icon_video : Icons.icon_video_no
                    }
                    style={styles.bottomIcon}
                  />
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.bottomIconContainer}
                onPress={() => setPublishSound(!publishSound)}
              >
                <Image
                  source={publishSound ? Icons.icon_sound : Icons.icon_sound_no}
                  style={styles.bottomIcon}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.bottomIconContainer}
                onPress={() => {
                  setVisibleChat(true);
                  // setUnreadCount(0);
                }}
              >
                <Image source={Icons.icon_chat} style={styles.bottomIcon} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.bottomIconContainer,
                  { backgroundColor: Colors.red_dark },
                ]}
                onPress={() => disconnectCall(true)}
              >
                <Image
                  source={Icons.icon_call}
                  style={styles.bottomIcon}
                  tintColor={Colors.white}
                />
              </TouchableOpacity>
            </View>
          </View>

          <MessageModal
            oponentUserId={oponentUserId}
            oponentUserName={oponentUserName}
            oponentUserProfileImage={oponentUserProfileImage}
            userName={userName ?? ''}
            message={message}
            setMessage={setMessage}
            sendMessage={handleSendMessage}
            setVisible={setVisibleChat}
            visible={visibleChat}
            messageList={msgList}
            uploadFile={handleUploadFilePress}
            onEndReached={handleEndReached}
            userId={userId}
          />
        </OTSession>
      </View>
    </View>
  );
};

export default VonageCall;

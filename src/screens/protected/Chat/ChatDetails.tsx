/* eslint-disable react-hooks/exhaustive-deps */
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import React, { FC, useCallback, useEffect, useState, useRef } from 'react';
import MyStatusBar from '@app/utils/helpers/MyStatusBar';
import { Colors, Fonts, Icons, Images } from '@app/themes';
import { normalize } from '@app/utils/orientation';
import LinearGradient from 'react-native-linear-gradient';
import { StackScreenProps } from '@react-navigation/stack';
import { AllRoutes, goBack } from '@app/navigation/RootNaivgation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { addDateSeparators, hexToRGB } from '@app/utils/helpers';
import { isIos } from '@app/utils/helpers/Validation';
import { FlatList } from 'react-native-gesture-handler';
import { useAppDispatch, useAppSelector } from '@app/store';
import { useIsFocused } from '@react-navigation/native';
import FooterLoader from '@app/utils/helpers/FooterLoader';
import { URL_LIST } from '@app/utils/constants';
import { downloadFile } from '@app/utils/helpers/FileActions';
import {
  getInterpreterMsgHistoryRequest,
  resetDefaults_interpreterSession,
} from '@app/store/slice/interpreterSession.slice';

const { width } = Dimensions.get('screen');

interface Message {
  id: string;
  text?: string;
  time?: string;
  type: 'sent' | 'received' | 'date';
  avatar?: any;
  dateLabel?: string;
}

interface ChatDetailsParams {
  sessionId: string;
  name: string;
}

const ChatDetails: FC<StackScreenProps<AllRoutes, 'ChatDetails'>> = ({
  route,
}) => {
  const dispatch = useAppDispatch();
  const { sessionId, name } = (route?.params as ChatDetailsParams) || {
    sessionId: '',
    name: '',
  };
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();

  const { status, getInterpreterMsgHistoryResponse } = useAppSelector(
    state => state.interpreterSession,
  );

  // State management
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [footerLoading, setFooterLoading] = useState(false);
  const [allMessages, setAllMessages] = useState<any[]>([]);

  // Ref to prevent multiple simultaneous fetches
  const isFetchingRef = useRef(false);

  // Reset and fetch initial messages when screen is focused
  useEffect(() => {
    if (isFocused) {
      resetAndFetch();
    }
  }, [isFocused, sessionId]);

  const resetAndFetch = () => {
    setPage(1);
    setHasMore(true);
    setAllMessages([]);
    isFetchingRef.current = false;
    fetchMessages(1, true);
  };

  useEffect(() => {
    if (isFocused) {
      switch (status) {
        case 'interpreterSession/getInterpreterMsgHistorySuccess': {
          const docs = getInterpreterMsgHistoryResponse?.data?.docs || [];
          const totalPages =
            getInterpreterMsgHistoryResponse?.data?.totalPages || 1;
          const hasNextPage =
            getInterpreterMsgHistoryResponse?.data?.hasNextPage || false;

          // Update messages
          if (page === 1) {
            setAllMessages(docs);
          } else {
            setAllMessages(prev => [...prev, ...docs]);
          }

          // Check if there are more pages
          if (!hasNextPage || page >= totalPages || docs.length < limit) {
            setHasMore(false);
          }

          // Reset loading states
          setIsLoading(false);
          setFooterLoading(false);
          isFetchingRef.current = false;
          dispatch(resetDefaults_interpreterSession());
          break;
        }
        case 'interpreterSession/getInterpreterMsgHistoryFailure': {
          page === 1 ? setIsLoading(false) : setFooterLoading(false);
          isFetchingRef.current = false;
          dispatch(resetDefaults_interpreterSession());
          break;
        }
        default:
          break;
      }
    }
  }, [status, isFocused]);

  const fetchMessages = useCallback(
    (pageNum: number, isInitial = false) => {
      // Prevent duplicate requests
      if (isFetchingRef.current) return;
      if (!isInitial && !hasMore) return;

      isFetchingRef.current = true;

      // Show appropriate loader
      if (pageNum === 1) {
        setIsLoading(true);
      } else {
        setFooterLoading(true);
      }

      dispatch(
        getInterpreterMsgHistoryRequest({
          sessionId: sessionId,
          page: pageNum,
          limit: limit,
        }),
      );
    },
    [dispatch, sessionId, limit, hasMore],
  );

  const loadMore = useCallback(() => {
    if (!hasMore || isFetchingRef.current || isLoading || footerLoading) {
      return;
    }
    const nextPage = page + 1;
    setPage(nextPage);
    fetchMessages(nextPage);
  }, [hasMore, isLoading, footerLoading, page, fetchMessages]);

  const transformMessages = useCallback((docs: any[], currentUser: string) => {
    return docs
      .map(m => {
        try {
          const msg = JSON.parse(m.message);
          const isSent = msg.username === currentUser;

          return {
            _id: m._id,
            type: isSent ? 'sent' : 'received',
            text: msg.type === 'file' ? '' : msg.message,
            time: new Date(msg.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
            file: msg.type === 'file' ? msg.fileData : null,
            avatar: null,
            createdAt: m.createdAt,
          };
        } catch (error) {
          console.error('Error parsing message:', error);
          return null;
        }
      })
      .filter(Boolean); // Remove any null values from parsing errors
  }, []);

  const renderMessage = useCallback(({ item }: { item: any }) => {
    // Date separator
    if (item.type === 'date') {
      return (
        <View style={styles.dateWrapper}>
          <Text style={styles.dateText}>{item.dateLabel}</Text>
        </View>
      );
    }

    // File message
    if (item.file) {
      return (
        <View>
          <View
            style={
              item.type === 'sent' ? styles.sentWrapper : styles.receivedWrapper
            }
          >
            {item.type === 'received' && item.avatar && (
              <Image source={item.avatar} style={styles.avatarSmall} />
            )}

            <View
              style={
                item.type === 'sent' ? styles.sentBubble : styles.receivedBubble
              }
            >
              <Text style={styles.fileName}>{item.file.fileName}</Text>
              <Text style={styles.fileSize}>{item.file.fileSize} KB</Text>
            </View>
            <TouchableOpacity
              onPress={async () => {
                await downloadFile({
                  fileName: item?.file?.fileName,
                  fileUrl:
                    URL_LIST.bucket_url +
                    item?.file?.downloadUrl +
                    '/' +
                    item?.file?.fileName,
                });
              }}
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
            </TouchableOpacity>

            {item.type === 'sent' && item.avatar && (
              <Image source={item.avatar} style={styles.avatarSmall} />
            )}
          </View>

          <Text
            style={[
              styles.timeText,
              { textAlign: item.type === 'sent' ? 'right' : 'left' },
            ]}
          >
            {item.time}
          </Text>
        </View>
      );
    }

    // Text message
    return (
      <View>
        <View
          style={
            item.type === 'sent' ? styles.sentWrapper : styles.receivedWrapper
          }
        >
          {item.type === 'received' && item.avatar && (
            <Image source={item.avatar} style={styles.avatarSmall} />
          )}

          <View
            style={
              item.type === 'sent' ? styles.sentBubble : styles.receivedBubble
            }
          >
            <Text style={styles.messageText}>{item.text}</Text>
          </View>

          {item.type === 'sent' && item.avatar && (
            <Image source={item.avatar} style={styles.avatarSmall} />
          )}
        </View>

        <Text
          style={[
            styles.timeText,
            { textAlign: item.type === 'sent' ? 'right' : 'left' },
          ]}
        >
          {item.time}
        </Text>
      </View>
    );
  }, []);

  const processedMessages = addDateSeparators(
    transformMessages(allMessages, 'Sourav mahanty'),
  );

  const ListEmpty = useCallback(
    () =>
      !isLoading ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.noDataLabel}>No Chats Found</Text>
        </View>
      ) : null,
    [isLoading],
  );

  const LoadingFooter = useCallback(
    () => (footerLoading ? <FooterLoader visible /> : null),
    [footerLoading],
  );

  const keyExtractor = useCallback(
    (item: any, index: number) =>
      item._id ? String(item._id) : `message-${index}`,
    [],
  );

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
        <LinearGradient colors={['#FFFFFF', '#f2ededfd']} style={{ flex: 1 }}>
          <View
            style={{
              flex: 1,
              backgroundColor: Colors.white,
              borderColor: '#E8E8E8',
              borderWidth: normalize(1),
              borderRadius: normalize(12),
              margin: normalize(12),
              marginTop: normalize(20),
              marginBottom: normalize(insets.bottom ? insets.bottom + 2 : 15),
            }}
          >
            {/* Header */}
            <View style={styles.headerCard}>
              <TouchableOpacity
                onPress={() => goBack()}
                style={styles.backButton}
              >
                <Image source={Icons.right_arrow} style={styles.backIcon} />
              </TouchableOpacity>
              <View>
                <Text style={styles.title}>{name}</Text>
              </View>
            </View>

            {/* Messages List */}
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.night_blue} />
              </View>
            ) : (
              <FlatList
                data={processedMessages}
                keyExtractor={keyExtractor}
                renderItem={renderMessage}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={ListEmpty}
                onEndReached={loadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={LoadingFooter}
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={10}
              />
            )}
          </View>
        </LinearGradient>
      </View>
    </View>
  );
};

export default ChatDetails;

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
    marginTop: normalize(25),
    borderTopLeftRadius: normalize(20),
    borderTopRightRadius: normalize(20),
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 2,
    overflow: 'hidden',
  },
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: normalize(15),
    borderColor: '#E8E8E8',
    borderBottomWidth: normalize(1),
  },
  backButton: {
    padding: normalize(15),
  },
  backIcon: {
    height: normalize(12),
    width: normalize(12),
    transform: [{ rotate: '180deg' }],
    tintColor: Colors.night_blue,
  },
  title: {
    fontFamily: Fonts.Manrope_Regular,
    color: Colors.night_blue,
    fontSize: normalize(18),
  },
  titleBold: {
    fontFamily: Fonts.Manrope_SemiBold,
  },
  avatarLarge: {
    width: normalize(45),
    height: normalize(45),
    borderRadius: normalize(22.5),
    marginRight: normalize(12),
  },
  userName: {
    fontFamily: Fonts.Inter_Medium,
    fontSize: normalize(14),
    color: Colors.night_blue,
  },
  phone: {
    fontFamily: Fonts.Inter_Regular,
    fontSize: normalize(12),
    color: Colors.dark_grey,
  },
  listContent: {
    padding: normalize(15),
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: normalize(40),
  },
  dateWrapper: {
    alignSelf: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: normalize(15),
    paddingVertical: normalize(4),
    borderRadius: normalize(12),
    marginVertical: normalize(10),
    borderWidth: normalize(1),
    borderColor: '#F8F6F3',
  },
  dateText: {
    fontFamily: Fonts.Inter_Regular,
    fontSize: normalize(11),
    color: '#4B4D5F',
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
    backgroundColor: Colors.white,
    padding: normalize(12),
    borderRadius: normalize(12),
    maxWidth: '70%',
    // marginRight: normalize(8),
    shadowColor: hexToRGB('#3A3A3A', isIos() ? 1 : 0.3),
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  receivedBubble: {
    backgroundColor: Colors.white,
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(10),
    borderRadius: normalize(12),
    maxWidth: '70%',
    // marginLeft: normalize(8),
    shadowColor: hexToRGB('#3A3A3A', isIos() ? 1 : 0.3),
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  avatarSmall: {
    width: normalize(28),
    height: normalize(28),
    borderRadius: normalize(28),
  },
  messageText: {
    fontFamily: Fonts.Inter_Regular,
    fontSize: normalize(13),
    color: '#4B4D5F',
  },
  timeText: {
    fontFamily: Fonts.Inter_Regular,
    fontSize: normalize(11),
    color: Colors.purple,
    marginBottom: normalize(12),
    marginHorizontal: normalize(8),
  },
  fileName: {
    fontFamily: Fonts.Inter_Medium,
    fontSize: normalize(12),
    color: Colors.night_blue,
    marginBottom: normalize(2),
  },
  fileSize: {
    fontFamily: Fonts.Inter_Regular,
    fontSize: normalize(10),
    color: Colors.dark_grey,
  },
  noDataLabel: {
    fontFamily: Fonts.Inter_Medium,
    color: Colors.dark_grey,
    fontSize: normalize(14),
    textAlign: 'center',
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
});

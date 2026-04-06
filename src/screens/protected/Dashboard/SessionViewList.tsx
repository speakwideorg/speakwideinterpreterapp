/* eslint-disable react-hooks/exhaustive-deps */
import React, {
  useState,
  useCallback,
  memo,
  useMemo,
  FC,
  useEffect,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  FlatList,
} from 'react-native';
import { Colors, Fonts, Icons, Images } from '@app/themes';
import { normalize } from '@app/utils/orientation';
import MyStatusBar from '@app/utils/helpers/MyStatusBar';
import Header from '@app/components/common/Header';
import {
  Session,
  RequestSessions,
  ScheduledSessions,
  CompletedSessions,
} from '@app/utils/constants';
import SessionItem from '../../../components/template/SessionItem';
import Menu from '@app/components/common/Menu';
import MenuOptions from './components/MenuOptions';
import FooterLoader from '@app/utils/helpers/FooterLoader';
import TextInput from '@app/components/common/TextInput';
import { StackScreenProps } from '@react-navigation/stack';
import { DashboardStackParamList, VonageCallProps } from '@app/types';
import { navigate } from '@app/navigation/RootNaivgation';
import AlertModal from '@app/components/common/AlertModal';
import CancelSessionContent from './components/CancelSessionContent';
import { useIsFocused } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '@app/store';
import {
  acceptSessionRequest,
  declineRequestedSessionRequest,
  declineSessionRequest,
  getInterpreterListRequest,
  getInterpreterSessionTokenRequest,
  resetDefaults_interpreterSession,
} from '@app/store/slice/interpreterSession.slice';
import { debounce } from '@app/utils/helpers/debounce';

const { width } = Dimensions.get('screen');

type Props = StackScreenProps<DashboardStackParamList, 'SessionViewList'>;

const SessionViewList: FC<Props> = ({ route }) => {
  const { type } = route?.params;
  const isFocused = useIsFocused();
  const dispatch = useAppDispatch();

  const { status } = useAppSelector(state => state.interpreterSession);
  const sessionList = useAppSelector(
    state => state.interpreterSession.getInterpreterListResponse?.data,
  );

  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const [selectedItem, setSelectedItem] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [allItemsLoaded, setAllItemsLoaded] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  /** Get data by type */
  // const sessionData = useMemo(() => {
  //   switch (type) {
  //     case 'Requests':
  //       return RequestSessions;
  //     case 'Scheduled':
  //       return ScheduledSessions;
  //     default:
  //       return CompletedSessions;
  //   }
  // }, [type]);

  const [page, setPage] = useState(1);
  const sessionSlice = useAppSelector(
    state => state.interpreterSession.getInterpreterListResponse,
  );
  const [sessionData, setSessionData] = useState<any[]>([]);

  useEffect(() => {
    if (isFocused) {
      switch (status) {
        case 'interpreterSession/getInterpreterListRequest': {
          setIsLoading(true);
          break;
        }
        case 'interpreterSession/getInterpreterListSuccess': {
          setIsLoading(false);
          if (page === 1) {
            setSessionData(sessionSlice?.data?.docs);
          } else {
            setSessionData([...sessionData, ...sessionSlice?.data?.docs]);
          }
          setAllItemsLoaded(
            sessionSlice?.data?.meta?.totalPages == page ||
              sessionSlice?.data?.meta?.totalPages == 0 ||
              !sessionSlice.data.meta.hasNextPage,
          );

          break;
        }
        case 'interpreterSession/getInterpreterListFailure': {
          setIsLoading(false);
          break;
        }
        case 'interpreterSession/getInterpreterSessionTokenSuccess': {
          dispatch(resetDefaults_interpreterSession());
          navigate('VonageCall', vonageOpponent);
          break;
        }
        case 'interpreterSession/getInterpreterSessionTokenFailure': {
          dispatch(resetDefaults_interpreterSession());
          break;
        }
      }
    }
  }, [status, isFocused]);

  useEffect(() => {
    if (isFocused) {
      dispatch(
        getInterpreterListRequest({
          list_type:
            type === 'Requests'
              ? 'request'
              : type === 'Scheduled'
              ? 'schedule'
              : 'completed',
          length: 10,
          search: searchVal,
          sortOrder: 'desc',
          sortField: 'createdAt',
        }),
      );
    }
  }, [isFocused]);

  useEffect(() => {
    switch (status) {
      case 'interpreterSession/declineSessionSuccess': {
        navigate('Success', {
          type: 'SessionDeclined',
          title: 'Session',
          title1: ' Successfully',
          subTitle: 'Declined',
        });
        break;
      }
      case 'interpreterSession/acceptSessionSuccess': {
        navigate('Success', {
          type: 'SessionAccepted',
          title: 'Session',
          title1: ' Successfully',
          subTitle: 'Accepted',
        });
        break;
      }
    }
  }, [status]);

  /** Handle menu open */
  const handleMenuPress = useCallback(
    (coordinates: { x: number; y: number; width: number; height: number }) => {
      setMenuPosition({
        top: coordinates.y + coordinates.height + 5,
        right: 10,
      });
      setMenuVisible(true);
    },
    [],
  );

  /** Render each session */
  const renderItem = useCallback(
    ({ item, index }: { item: any; index: number }) => (
      <SessionItem
        index={index}
        item={item}
        onMenuPress={coordinates => {
          handleMenuPress(coordinates);
          setSelectedItem(item);
        }}
        onPress={() => {
          if (type === 'Requests') {
            // navigate('SessionDetails', {
            //   details: item,
            //   type: 'RequestDetails',
            // });
            navigate('DrawerNavigation', {
              screen: 'Dashboard',
              params: {
                screen: 'SessionDetails',
                params: {
                  details: item,
                  type: 'RequestDetails',
                },
              },
            });
          }
        }}
        type={type}
        onPressDecline={() =>
          dispatch(declineRequestedSessionRequest({ id: item?._id }))
        }
        onPressAccept={() => dispatch(acceptSessionRequest({ id: item?._id }))}
      />
    ),
    [handleMenuPress, type],
  );

  /** Footer loader */
  const LoadingFooter = useCallback(
    () => (isLoading && !allItemsLoaded ? <FooterLoader visible /> : null),
    [isLoading, allItemsLoaded],
  );

  /** Load more */
  const handleLoadMore = useCallback(() => {
    if (!isLoading && !allItemsLoaded) {
      dispatch(
        getInterpreterListRequest({
          list_type:
            type === 'Requests'
              ? 'request'
              : type === 'Scheduled'
              ? 'schedule'
              : 'completed',
          page: page,
          length: 10,
          search: searchVal,
          sortOrder: 'desc',
          sortField: 'createdAt',
        }),
      );
      setPage(page + 1);
    }
  }, [isLoading, allItemsLoaded]);

  /** Close menu */
  const handleMenuClose = useCallback((callback?: () => void) => {
    setMenuVisible(false);
    callback?.();
  }, []);

  /** Menu options */
  const renderMenuOptions = useMemo(
    () => [
      <MenuOptions
        key="details"
        icon={Icons.clarify}
        title="Details"
        onPress={() => {
          navigate('SessionDetails', {
            details: selectedItem,
            type: 'ScheduledDetails',
          });
          handleMenuClose(() => setIsCancelled(false));
        }}
      />,
      <MenuOptions
        key="cancel"
        icon={Icons.phone_disabled}
        title="Request Cancellation"
        onPress={() => handleMenuClose(() => setIsCancelled(true))}
      />,
    ],
    [handleMenuClose],
  );

  const fetchSearchResults = async (query: string) => {
    try {
      setPage(1);
      setSessionData([]);
      dispatch(
        getInterpreterListRequest({
          list_type:
            type === 'Requests'
              ? 'request'
              : type === 'Scheduled'
              ? 'schedule'
              : 'completed',
          page: 1,
          length: 5,
          search: query,
          sortOrder: 'desc',
          sortField: 'createdAt',
        }),
      );
    } catch (error) {
      console.error('API Error:', error);
    }
  };
  const debouncedSearch = useMemo(() => debounce(fetchSearchResults, 500), []);

  const handleSearchChange = (text: string) => {
    setAllItemsLoaded(false);
    setSearchVal(text);
    debouncedSearch(text);
  };
  return (
    <View style={styles.container}>
      {/* Background Shape */}
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
      <Header isBack isShowProfile={false} />

      {/* Title */}
      <View style={styles.headerRowStyle}>
        <Text style={styles.dashboardTitle}>
          {type === 'Requests' ? 'Requested' : type}{' '}
          <Text style={styles.boldText}>Sessions</Text>
        </Text>
      </View>

      {/* Search */}
      <TextInput
        value={searchVal}
        onChangeText={text => handleSearchChange(text)}
        placeholder="Search Sessions.."
        backgroundColor={Colors.white}
        style={styles.searchBoxStyle}
      />

      <View style={styles.contentWrapper}>
        {/* List */}
        <FlatList
          contentContainerStyle={styles.listContent}
          data={sessionData}
          keyExtractor={(item, idx) => `${item.id}-${idx}`}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={LoadingFooter}
          ListEmptyComponent={() =>
            !isLoading && (
              <Text style={styles.emptyText}>No sessions available</Text>
            )
          }
        />

        {/* Context Menu */}
        {menuVisible && (
          <Menu
            top={menuPosition.top}
            right={menuPosition.right}
            isVisible={menuVisible}
            onClose={() => setMenuVisible(false)}
          >
            {renderMenuOptions}
          </Menu>
        )}
        {isCancelled && (
          <AlertModal
            visible={isCancelled}
            onClose={() => setIsCancelled(false)}
            padding={0}
          >
            <CancelSessionContent
              onCancel={() => setIsCancelled(false)}
              onConfirm={() => {
                setIsCancelled(false);
                dispatch(declineSessionRequest({ id: selectedItem?._id }));
                // setTimeout(() => {
                //   navigate('Success', {
                //     type: 'Cancelled',
                //     title: 'Session ',
                //     title1: 'Successfully',
                //     subTitle: 'Cancelled',
                //   });
                // }, 500);
              }}
            />
          </AlertModal>
        )}
      </View>
    </View>
  );
};

export default memo(SessionViewList);

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
  dashboardTitle: {
    fontFamily: Fonts.Manrope_Regular,
    color: Colors.night_blue,
    fontSize: normalize(20),
  },
  boldText: {
    fontFamily: Fonts.Manrope_Bold,
  },
  contentWrapper: {
    flex: 1,
    backgroundColor: Colors.white,
    marginTop: normalize(15),
    borderTopLeftRadius: normalize(30),
    borderTopRightRadius: normalize(30),
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 2,
    paddingTop: normalize(10),
  },
  listContent: {
    paddingHorizontal: normalize(15),
    paddingBottom: normalize(30),
    paddingTop: normalize(10),
  },
  emptyText: {
    textAlign: 'center',
    fontFamily: Fonts.Inter_Regular,
    color: Colors.dark_grey,
    fontSize: normalize(13),
    marginTop: normalize(20),
  },
  headerRowStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: normalize(15),
    marginTop: normalize(10),
  },
  searchBoxStyle: {
    alignSelf: 'center',
    marginTop: normalize(10),
  },
});

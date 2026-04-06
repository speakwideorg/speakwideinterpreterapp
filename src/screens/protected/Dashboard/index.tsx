/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useCallback, memo, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Colors, Fonts, Icons, Images } from '@app/themes';
import { normalize } from '@app/utils/orientation';
import MyStatusBar from '@app/utils/helpers/MyStatusBar';
import Header from '@app/components/common/Header';
import { canJoinNow, hexToRGB } from '@app/utils/helpers';
import { isIos } from '@app/utils/helpers/Validation';
import SessionItem from '../../../components/template/SessionItem';
import Menu from '@app/components/common/Menu';
import MenuOptions from './components/MenuOptions';
import FooterLoader from '@app/utils/helpers/FooterLoader';
import TextInput from '@app/components/common/TextInput';
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
import Loader from '@app/utils/helpers/Loader';
import { VonageCallProps } from '@app/types';
import { debounce } from '@app/utils/helpers/debounce';
import Button from '@app/components/common/Button';
import { profileDetailsRequest } from '@app/store/slice/auth.slice';
import { showMessage } from '@app/utils/helpers/Toast';

const { width } = Dimensions.get('screen');

const TAB_TITLE_LIST = [
  { title: 'Requests', value: 'request' },
  { title: 'Scheduled', value: 'schedule' },
  { title: 'Completed', value: 'completed' },
];

const Dashboard = () => {
  const { status, loading } = useAppSelector(state => state.interpreterSession);
  const isFocused = useIsFocused();
  const dispatch = useAppDispatch();
  const sessionSlice = useAppSelector(
    state => state.interpreterSession.getInterpreterListResponse,
  );
  const { profileDetailsResponse } = useAppSelector(state => state.auth);
  const [selectedTab, setSelectedTab] = useState(0);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [allItemsLoaded, setAllItemsLoaded] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [searchData, setSearchData] = useState('');
  const [selectedItem, setSelectedItem] = useState({});

  const [sessionData, setSessionData] = useState<any[]>([]);

  const [isApprovalModal, setIsApprovalModal] = useState(
    profileDetailsResponse?.isApprove === 'Pending',
  );

  const [vonageOpponent, setVonageOpponent] = useState<VonageCallProps>({
    oponentUserId: '',
    oponentUserName: '',
    oponentUserProfileImage: '',
  });

  useEffect(() => {
    if (isFocused) {
      switch (status) {
        case 'interpreterSession/getInterpreterListRequest': {
          setIsLoading(true);
          break;
        }
        case 'interpreterSession/getInterpreterListSuccess': {
          setIsLoading(false);
          dispatch(resetDefaults_interpreterSession());
          if (page === 1) {
            setSessionData(sessionSlice?.data?.docs);
          } else {
            setSessionData([...sessionData, ...sessionSlice?.data?.docs]);
          }
          setAllItemsLoaded(
            sessionSlice?.data?.meta?.totalPages === page ||
              sessionSlice?.data?.meta?.totalPages === 0 ||
              !sessionSlice.data.meta.hasNextPage,
          );
          break;
        }
        case 'interpreterSession/getInterpreterListFailure': {
          setIsLoading(false);
          break;
        }
        case 'interpreterSession/getInterpreterListFailure': {
          dispatch(resetDefaults_interpreterSession());
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
    switch (status) {
      case 'interpreterSession/declineSessionSuccess': {
        dispatch(
          getInterpreterListRequest({
            list_type: TAB_TITLE_LIST[selectedTab].value,
            page: 1,
            limit: 10,
            sortOrder: 'desc',
            sortField: 'createdAt',
          }),
        );
        navigate('Success', {
          type: 'SessionDeclined',
          title: 'Session',
          title1: ' Successfully',
          subTitle: 'Declined',
        });
        break;
      }
      case 'interpreterSession/acceptSessionSuccess': {
        dispatch(
          getInterpreterListRequest({
            list_type: TAB_TITLE_LIST[selectedTab].value,
            page: 1,
            limit: 10,
            sortOrder: 'desc',
            sortField: 'createdAt',
          }),
        );
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

  useEffect(() => {
    if (isFocused) {
      setPage(1);
      dispatch(
        getInterpreterListRequest({
          list_type: TAB_TITLE_LIST[selectedTab].value,
          page: 1,
          limit: 10,
          sortOrder: 'desc',
          sortField: 'createdAt',
        }),
      );
    }
  }, [selectedTab]);

  // 'request'

  /** Sessions Data Based on Tab */
  // const sessionData = useMemo(() => {
  //   switch (selectedTab) {
  //     case 0:
  //       return RequestSessions;
  //     case 1:
  //       return ScheduledSessions;
  //     default:
  //       return CompletedSessions;
  //   }
  // }, [selectedTab]);

  /** Current Tab Label */
  const currentTabLabel = useMemo(
    () =>
      selectedTab === 0
        ? 'Requests'
        : selectedTab === 1
        ? 'Scheduled'
        : 'Completed',
    [selectedTab],
  );

  /** Handle Context Menu */
  const handleMenuPress = useCallback(
    (
      coordinates: { x: number; y: number; width: number; height: number },
      item: any,
    ) => {
      setMenuPosition({
        top: coordinates.y + coordinates.height + 5,
        right: 10,
      });
      setMenuVisible(true);
    },
    [],
  );

  /** Render Each Session Item */
  const renderItem = ({ item, index }: { item: any; index: number }) => (
    <SessionItem
      index={index}
      item={item}
      onMenuPress={(e: any, x: any) => {
        handleMenuPress(e, x);
        setSelectedItem(item);
      }}
      type={currentTabLabel}
      onPress={() => {
        if (currentTabLabel === 'Requests') {
          navigate('SessionDetails', {
            details: item,
            type: 'RequestDetails',
          });
        }
      }}
      onPressDecline={() =>
        dispatch(declineRequestedSessionRequest({ id: item._id }))
      }
      onPressAccept={() => dispatch(acceptSessionRequest({ id: item._id }))}
      onPressJoin={() => {
        console.log('item is==>', item);
        if (!canJoinNow(item?.start_date_time)) {
          showMessage('You can join only at the scheduled time');
          return;
        }
        if (item?.format === 'On-site (2 hour minimum)') {
          showMessage('Onsite session cannot be joined via app');
          return;
        }
        setVonageOpponent({
          oponentUserId: '',
          oponentUserName: item?.client,
          oponentUserProfileImage: '',
        });
        dispatch(getInterpreterSessionTokenRequest({ _id: item?._id }));
      }}
    />
  );

  /** Footer Loader */
  const LoadingFooter = useCallback(
    () => (isLoading && !allItemsLoaded ? <FooterLoader visible /> : null),
    [isLoading, allItemsLoaded],
  );

  /** Infinite Scroll Handler */
  const handleLoadMore = useCallback(() => {
    if (!isLoading && !allItemsLoaded) {
      dispatch(
        getInterpreterListRequest({
          list_type: TAB_TITLE_LIST[selectedTab].value,
          page: page,
          length: 10,
          search: searchData,
          sortOrder: 'desc',
          sortField: 'createdAt',
        }),
      );
      setPage(page + 1);
    }
  }, [isLoading, allItemsLoaded]);

  console.log('selectedItem', selectedItem);

  /** Close Menu */
  const handleMenuClose = useCallback((callback?: () => void) => {
    setMenuVisible(false);
    callback?.();
  }, []);

  /** Menu Options */
  const RenderMenuOptions = () => {
    const menusByTab: Record<
      number,
      { icon: any; title: string; onPress?: () => void }[]
    > = {
      1: [
        {
          icon: Icons.clarify,
          title: 'Details',
          onPress: () => {
            navigate('SessionDetails', {
              details: selectedItem,
              type: 'ScheduledDetails',
            });
          },
        },
        {
          icon: Icons.phone_disabled,
          title: 'Request Cancellation',
          onPress: () => setIsCancelled(true),
        },
      ],
      2: [
        {
          icon: Icons.feedback,
          title: 'Raise a Dispute',
          onPress: () => navigate('RaiseDispute', { item: selectedItem }),
        },
      ],
    };
    return menusByTab[selectedTab]?.map((menu, idx) => (
      <MenuOptions
        key={`${menu.title}-${idx}`}
        icon={menu.icon}
        title={menu.title}
        onPress={() => handleMenuClose(menu.onPress)}
      />
    ));
  };

  const fetchSearchResults = async (query: string) => {
    try {
      setPage(1);
      setSessionData([]);
      dispatch(
        getInterpreterListRequest({
          list_type: TAB_TITLE_LIST[selectedTab].value,
          page: 1,
          length: 10,
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
    setSearchData(text);
    debouncedSearch(text);
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
      <Header />
      <Loader visible={page === 1 ? loading : false} />

      {/* Search */}
      <TextInput
        value={searchData}
        onChangeText={text => handleSearchChange(text)}
        placeholder="Search Sessions.."
        rightIcon={Icons.search}
        backgroundColor={Colors.white}
        style={styles.searchInput}
      />

      {/* Header Row */}
      <View style={styles.headerRow}>
        <Text style={styles.dashboardTitle}>
          Session <Text style={styles.boldText}>List</Text>
        </Text>
        <TouchableOpacity
          onPress={() => navigate('SessionViewList', { type: currentTabLabel })}
          style={styles.seeAllButton}
        >
          <Text style={styles.seeAllText}>See All</Text>
          <Image source={Icons.double_arrow_right} style={styles.seeAllIcon} />
        </TouchableOpacity>
      </View>

      <View style={styles.contentWrapper}>
        {/* Tab Selector */}
        <View style={styles.selectionContainer}>
          {TAB_TITLE_LIST.map((tab_title, idx) => {
            const isActive = idx === selectedTab;
            return (
              <TouchableOpacity
                key={idx.toString()}
                onPress={() => setSelectedTab(idx)}
                style={isActive ? styles.selectionItem : styles.deSelectionItem}
              >
                <Text
                  style={
                    isActive ? styles.selectionTitle : styles.deSelectionTitle
                  }
                >
                  {tab_title.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Sessions List */}
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
            !isLoading && <Text style={styles.noDataLabel}>No Data Found</Text>
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
            <RenderMenuOptions />
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
      <AlertModal visible={isApprovalModal} onClose={() => null}>
        <View style={styles.pendingApprovalContainer}>
          <Text style={styles.pendingLabelHeader}>
            Account pending approval. Additional verification may be required.
            Review takes 24-48 hours.
          </Text>

          <Button title="Ok" onPress={() => setIsApprovalModal(false)} />
        </View>
      </AlertModal>
    </View>
  );
};

export default memo(Dashboard);

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
  searchInput: {
    alignSelf: 'center',
    marginTop: normalize(10),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: normalize(15),
    marginTop: normalize(10),
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontFamily: Fonts.Manrope_Regular,
    color: Colors.night_blue,
    fontSize: normalize(12),
  },
  seeAllIcon: {
    height: normalize(14),
    width: normalize(14),
    marginLeft: normalize(2),
  },
  contentWrapper: {
    flex: 1,
    backgroundColor: Colors.white,
    marginTop: normalize(30),
    borderTopLeftRadius: normalize(30),
    borderTopRightRadius: normalize(30),
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 2,
  },
  selectionContainer: {
    backgroundColor: Colors.alabaster,
    height: normalize(45),
    width: '82%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: normalize(15),
    alignSelf: 'center',
    borderColor: Colors.blue_chalk,
    borderWidth: normalize(1.5),
    padding: normalize(3),
    bottom: normalize(18),
    shadowColor: hexToRGB(Colors.black, isIos() ? 0.4 : 0.3),
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: normalize(10),
    elevation: 5,
  },
  selectionItem: {
    backgroundColor: Colors.white,
    width: '33.3%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: normalize(12),
    shadowColor: hexToRGB(Colors.melrose, isIos() ? 0.4 : 1),
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: normalize(10),
    elevation: 10,
  },
  deSelectionItem: {
    width: '33.3%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectionTitle: {
    fontFamily: Fonts.Inter_Medium,
    color: Colors.purple,
    fontSize: normalize(11),
  },
  deSelectionTitle: {
    fontFamily: Fonts.Inter_Regular,
    color: Colors.dark_grey,
    fontSize: normalize(11),
  },
  listContent: {
    paddingHorizontal: normalize(15),
    paddingBottom: normalize(30),
    paddingTop: normalize(5),
  },
  noDataLabel: {
    fontFamily: Fonts.Inter_Medium,
    color: Colors.dark_grey,
    fontSize: normalize(11),
    textAlign: 'center',
  },
  pendingApprovalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pendingLabelHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
    color: '#222',
  },
  pendingLabelSubHeader: {
    fontSize: 15,
    textAlign: 'center',
    color: '#666',
  },
});

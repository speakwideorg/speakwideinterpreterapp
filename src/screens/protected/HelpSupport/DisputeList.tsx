/* eslint-disable react-hooks/exhaustive-deps */
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  View,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import React, {
  FC,
  memo,
  useCallback,
  useEffect,
  useState,
  useRef,
} from 'react';
import { Colors, Fonts, Icons, Images } from '@app/themes';
import MyStatusBar from '@app/utils/helpers/MyStatusBar';
import Header from '@app/components/common/Header';
import Loader from '@app/utils/helpers/Loader';
import { normalize } from '@app/utils/orientation';
import { useAppDispatch, useAppSelector } from '@app/store';
import { useIsFocused } from '@react-navigation/native';

import { StackScreenProps } from '@react-navigation/stack';
import { AllRoutes } from '@app/navigation/RootNaivgation';
import HelpCard from './model/HelpCard';
import { hexToRGB } from '@app/utils/helpers';
import { isIos } from '@app/utils/helpers/Validation';
import FooterLoader from '@app/utils/helpers/FooterLoader';
import {
  disputeDetailsRequest,
  disputeListRequest,
} from '@app/store/slice/interpreterSession.slice';
import SessionIssueModal from './model/SessionIssueModal';
import Picker from '@app/components/common/Picker';

const { width } = Dimensions.get('screen');

type Ticket = {
  _id: string;
  dispute_id: string;
  title: string;
  subtitle: string;
  dispute_status: string;
  ticketId: string;
  date: string;
  issue_details: string;
  categories: Array<{
    title: string;
  }>;
};

const TicketItem = memo(
  ({
    item,
    index,
    background,
    badge,
    text,
    onPress,
  }: {
    item: Ticket;
    index: number;
    background: string;
    badge: string;
    text: string;
    onPress: () => void;
  }) => {
    return (
      <HelpCard
        item={item}
        index={index}
        cardBackgrounds={background}
        badgeBackgrounds={badge}
        textColor={text}
        onPress={onPress}
        width="100%"
      />
    );
  },
);

const ListFooter = memo(({ isLoading }: { isLoading: boolean }) => {
  if (!isLoading) return null;
  return <FooterLoader visible />;
});

const ListEmptyContainer = ({ isLoading }: { isLoading: boolean }) => {
  if (isLoading) return null;
  return (
    <View style={styles.noDataContainer}>
      <Text style={styles.noDataLabel}>No Data Found</Text>
    </View>
  );
};

type BackendStatus = 'Pending' | 'Resolved' | 'Declined';
type DisplayTab = 'In Progress' | 'Completed' | 'Rejected';

const DISPLAY_TABS: DisplayTab[] = ['In Progress', 'Completed', 'Rejected'];

const displayForBackend: Record<BackendStatus, DisplayTab> = {
  Pending: 'In Progress',
  Resolved: 'Completed',
  Declined: 'Rejected',
};

const backendForDisplay: Record<DisplayTab, BackendStatus> = {
  'In Progress': 'Pending',
  Completed: 'Resolved',
  Rejected: 'Declined',
};

const DisputeList: FC<StackScreenProps<AllRoutes, 'DisputeList'>> = ({
  route,
}) => {
  const { list_type } = (route && route.params) || ({} as any);

  const initialDisplayTab =
    (list_type &&
      displayForBackend[(list_type as BackendStatus) || 'Pending']) ||
    'In Progress';

  const dispatch = useAppDispatch();
  const isFocused = useIsFocused();

  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [selectedTab, setSelectedTab] = useState<DisplayTab>(
    initialDisplayTab as DisplayTab,
  );
  const [allDisputes, setAllDisputes] = useState<Ticket[]>([]);
  const [hasNextPage, setHasNextPage] = useState(false);

  const searchTimeoutRef = useRef<NodeJS.Timeout>(null);
  const isLoadingRef = useRef(false);
  const lastRequestRef = useRef<string>('');
  const [isVisible, setIsVisible] = useState(false);

  const { status, loading, disputeListResponse } = useAppSelector(
    state => state.interpreterSession,
  );

  // Debounce search input
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(searchText);
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchText]);

  // Handle API response
  useEffect(() => {
    if (!isFocused) return;

    const backendKey = backendForDisplay[selectedTab];
    const responseData = disputeListResponse?.[backendKey]?.data;

    switch (status) {
      case 'interpreterSession/disputeListSuccess': {
        if (responseData) {
          const newDocs = responseData.docs || [];
          const currentPageNum = responseData.page || 1;
          const totalPages = responseData.pages || 1;

          // Update data based on page
          setAllDisputes(prev => {
            if (currentPageNum === 1) {
              return newDocs;
            } else {
              // Append and remove duplicates
              const existingIds = new Set(prev.map(item => item._id));
              const uniqueNewDocs = newDocs.filter(
                doc => !existingIds.has(doc._id),
              );
              return [...prev, ...uniqueNewDocs];
            }
          });

          // Update pagination state
          setHasNextPage(currentPageNum < totalPages);
        }

        // Reset loading flags
        setIsLoadingMore(false);
        isLoadingRef.current = false;
        break;
      }

      case 'interpreterSession/disputeListFailure': {
        setIsLoadingMore(false);
        isLoadingRef.current = false;
        break;
      }
    }
  }, [status, isFocused, selectedTab, disputeListResponse]);

  // Load disputes function
  const loadDisputes = useCallback(
    (page: number, search: string) => {
      const backendKey = backendForDisplay[selectedTab];
      const requestKey = `${backendKey}-${page}-${search}`;

      // Prevent duplicate requests
      if (isLoadingRef.current && lastRequestRef.current === requestKey) {
        return;
      }

      isLoadingRef.current = true;
      lastRequestRef.current = requestKey;

      dispatch(
        disputeListRequest({
          list_type: backendKey,
          page,
          limit: 5,
          search,
        }),
      );
    },
    [selectedTab, dispatch],
  );

  // Reset and load when tab or search changes
  useEffect(() => {
    if (!isFocused) return;

    // Reset state
    setCurrentPage(1);
    setAllDisputes([]);
    setHasNextPage(false);
    setIsLoadingMore(false);
    isLoadingRef.current = false;

    // Load first page
    loadDisputes(1, debouncedSearch);
  }, [isFocused, selectedTab, debouncedSearch]);

  // Handle search input change
  const handleSearch = (text: string) => {
    setSearchText(text);
  };

  // Handle tab change
  const handleTabChange = (tab: DisplayTab) => {
    if (tab === selectedTab) return;
    setSelectedTab(tab);
    setSearchText('');
    setDebouncedSearch('');
  };

  // Handle load more
  const handleLoadMore = () => {
    if (!hasNextPage || isLoadingMore || isLoadingRef.current) {
      return;
    }

    setIsLoadingMore(true);
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    loadDisputes(nextPage, debouncedSearch);
  };

  // Render list
  const renderItem = useCallback(
    ({ item, index }: { item: Ticket; index: number }) => {
      const statusStyles = {
        Pending: {
          background: '#FFF8F1',
          badge: '#FFF1E2',
          text: '#FFBE79',
        },
        Resolved: {
          background: '#E9FCFF',
          badge: '#C2FFFC',
          text: '#00879B',
        },
        Declined: {
          background: '#FFF1E1',
          badge: '#FFE0E0',
          text: '#FF6B6B',
        },
      };

      const backendKey = backendForDisplay[selectedTab];
      const style = statusStyles[backendKey] || statusStyles.Pending;

      return (
        <TicketItem
          item={item}
          index={index}
          background={style.background}
          badge={style.badge}
          text={style.text}
          onPress={() => {
            setIsVisible(true);
            dispatch(disputeDetailsRequest({ id: item._id }));
          }}
        />
      );
    },
    [selectedTab, dispatch],
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

      <Header isBack isShowProfile={false} />
      <Loader visible={loading && currentPage === 1} />

      <Text style={styles.title}>
        Help <Text style={styles.titleBold}>& Support</Text>
      </Text>

      <View style={styles.contentWrapper}>
        <View style={styles.selectionContainer}>
          {DISPLAY_TABS.map(tab => (
            <TouchableOpacity
              key={tab}
              onPress={() => handleTabChange(tab)}
              style={
                selectedTab === tab
                  ? styles.selectionItem
                  : styles.deSelectionItem
              }
            >
              <Text
                style={
                  selectedTab === tab
                    ? styles.selectionTitle
                    : styles.deSelectionTitle
                }
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.searchBox}>
          <Image source={Icons.search} style={styles.searchIcon} />
          <TextInput
            placeholder="Search here.."
            placeholderTextColor={Colors.dust}
            style={styles.searchInput}
            value={searchText}
            onChangeText={handleSearch}
          />
        </View>

        <View style={styles.sectionWrapper}>
          <FlatList
            data={allDisputes}
            keyExtractor={(item, index) => item?._id || `dispute-${index}`}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <ListEmptyContainer isLoading={loading && currentPage === 1} />
            }
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.3}
            ListFooterComponent={<ListFooter isLoading={isLoadingMore} />}
          />
        </View>
        <Picker
          visible={isVisible}
          isShowLine
          onClose={() => setIsVisible(false)}
          onBackDropPess={() => setIsVisible(false)}
          isShowCloseBtn={false}
        >
          <SessionIssueModal />
        </Picker>
      </View>
    </View>
  );
};

export default DisputeList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.ceramic,
  },
  loaderContainer: {
    padding: normalize(20),
    alignItems: 'center',
  },
  selectionContainer: {
    backgroundColor: Colors.alabaster,
    height: normalize(45),
    width: '92%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: normalize(15),
    alignSelf: 'center',
    borderColor: Colors.blue_chalk,
    borderWidth: normalize(1.5),
    padding: normalize(3),
    bottom: normalize(30),
    shadowColor: hexToRGB(Colors.black, isIos() ? 0.4 : 0.3),
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: normalize(10),
    elevation: 5,
  },
  tabItem: {
    flex: 1,
    paddingVertical: normalize(10),
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: Colors.blue_chalk,
  },
  selectedTabItem: {
    borderBottomColor: Colors.purple,
  },
  tabText: {
    fontFamily: Fonts.DMSans_Regular,
    fontSize: normalize(12),
    color: Colors.night_blue,
  },
  selectedTabText: {
    fontFamily: Fonts.DMSans_Bold,
    color: Colors.purple,
  },
  topShape: {
    height: normalize(340),
    width,
    position: 'absolute',
    top: 0,
  },
  title: {
    fontFamily: Fonts.Manrope_Regular,
    color: Colors.night_blue,
    fontSize: normalize(20),
    marginLeft: normalize(15),
    marginTop: normalize(10),
  },
  selectionItem: {
    backgroundColor: Colors.white,
    width: '33.3%',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: hexToRGB(Colors.melrose, isIos() ? 0.4 : 1),
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: normalize(10),
    elevation: 10,
    borderRadius: normalize(12),
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
  titleBold: {
    fontFamily: Fonts.Manrope_SemiBold,
  },
  contentWrapper: {
    flex: 1,
    backgroundColor: Colors.white,
    marginTop: normalize(40),
    borderTopLeftRadius: normalize(30),
    borderTopRightRadius: normalize(30),
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 2,
    paddingHorizontal: normalize(15),
    paddingTop: normalize(15),
  },
  scrollContent: {
    paddingBottom: normalize(30),
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headingTitle: {
    fontFamily: Fonts.DMSans_Regular,
    fontSize: normalize(13.5),
    color: Colors.night_blue,
  },
  headingCount: {
    fontFamily: Fonts.DMSans_Medium,
  },
  searchBox: {
    backgroundColor: Colors.alabaster,
    borderRadius: normalize(10),
    borderColor: Colors.blue_chalk,
    borderWidth: normalize(1),
    paddingHorizontal: normalize(15),
    height: normalize(42),
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: Colors.gray,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    height: normalize(14),
    width: normalize(14),
    marginRight: normalize(10),
    tintColor: Colors.purple,
  },
  searchInput: {
    flex: 1,
    fontFamily: Fonts.Inter_Regular,
    fontSize: normalize(9.5),
    color: Colors.night_blue,
  },
  sectionWrapper: {
    marginTop: normalize(20),
  },
  progressText: {
    fontFamily: Fonts.Inter_Medium,
    fontSize: normalize(15),
    color: Colors.night_blue,
    marginBottom: normalize(10),
  },
  listContent: {
    gap: normalize(12),
    paddingBottom: normalize(120),
  },
  noDataContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: normalize(80), // or give it a fixed height if FlatList is horizontal
    width: width - normalize(40), // optional, helps when horizontal list
    alignSelf: 'center',
  },

  noDataLabel: {
    fontFamily: Fonts.Inter_Medium,
    fontSize: normalize(11),
    color: Colors.gray,
    marginBottom: normalize(10),
    textAlign: 'center',
    alignSelf: 'center',
  },
});

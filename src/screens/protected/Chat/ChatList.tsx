/* eslint-disable react-hooks/exhaustive-deps */
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  FlatList,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import React, { useCallback, useEffect, useState, useRef } from 'react';
import Header from '@app/components/common/Header';
import MyStatusBar from '@app/utils/helpers/MyStatusBar';
import { Colors, Fonts, Icons, Images } from '@app/themes';
import { normalize } from '@app/utils/orientation';
import { navigate } from '@app/navigation/RootNaivgation';
import { ChatItem } from '@app/types';
import { useAppDispatch, useAppSelector } from '@app/store';
import { useIsFocused } from '@react-navigation/native';

import FooterLoader from '@app/utils/helpers/FooterLoader';
import { formatDateTime } from '@app/utils/helpers';
import Loader from '@app/utils/helpers/Loader';
import {
  getInterpreterListRequest,
  resetDefaults_interpreterSession,
} from '@app/store/slice/interpreterSession.slice';
import { IMAGES_BUCKET_URL } from '@app/utils/constants';

const { width } = Dimensions.get('screen');

const ChatList: React.FC = () => {
  const isFocused = useIsFocused();
  const dispatch = useAppDispatch();

  const chatListing = useAppSelector(
    state => state.interpreterSession.getInterpreterListResponse.data,
  );
  const { status, loading } = useAppSelector(state => state.interpreterSession);

  // State management
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [footerLoading, setFooterLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [allSessionList, setAllSessionList] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  console.log('allSessionList', allSessionList);

  // Refs
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isFetchingRef = useRef(false);

  // Debounce search input
  useEffect(() => {
    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500); // 500ms debounce delay

    // Cleanup
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [search]);

  // Handle API response
  useEffect(() => {
    if (isFocused) {
      switch (status) {
        case 'interpreterSession/getInterpreterListSuccess': {
          page === 1 ? setIsLoading(false) : setFooterLoading(false);
          isFetchingRef.current = false;

          // Store hasNextPage in local state
          setHasNextPage(chatListing?.meta?.hasNextPage || false);

          // Merge new data with existing data
          if (page === 1) {
            // First page: replace all data
            setAllSessionList(chatListing?.docs || []);
          } else {
            // Subsequent pages: append new data
            setAllSessionList(prev => [...prev, ...(chatListing?.docs || [])]);
          }

          dispatch(resetDefaults_interpreterSession());
          break;
        }
        case 'interpreterSession/getInterpreterListFailure': {
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

  // Initial fetch when screen is focused
  useEffect(() => {
    if (isFocused) {
      resetAndFetch();
    }
  }, [isFocused]);

  // Fetch data when debounced search changes
  useEffect(() => {
    if (isFocused) {
      resetAndFetch();
    }
  }, [debouncedSearch]);

  // Reset and fetch from page 1
  const resetAndFetch = useCallback(() => {
    setPage(1);
    setAllSessionList([]);
    setHasNextPage(false);
    isFetchingRef.current = false;
    fetchData(1, debouncedSearch);
  }, [debouncedSearch]);

  // Fetch data function
  const fetchData = useCallback(
    (pageNum: number, searchQuery: string) => {
      if (isFetchingRef.current) return;

      isFetchingRef.current = true;
      pageNum === 1 ? setIsLoading(true) : setFooterLoading(true);

      dispatch(
        getInterpreterListRequest({
          list_type: 'completed',
          page: pageNum,
          length: 10,
          search: searchQuery,
          sortOrder: 'desc',
          sortField: 'createdAt',
        }),
      );
    },
    [dispatch],
  );

  // Load next page when user scrolls to end
  const handleLoadMore = useCallback(() => {
    if (!footerLoading && hasNextPage && !isFetchingRef.current) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchData(nextPage, debouncedSearch);
    }
  }, [footerLoading, hasNextPage, page, debouncedSearch, fetchData]);

  // Handle search input change
  const handleSearchChange = useCallback((text: string) => {
    setSearch(text);
  }, []);

  // Render footer loader
  const LoadingFooter = useCallback(
    () => (footerLoading ? <FooterLoader visible /> : null),
    [footerLoading],
  );

  // Render empty list
  const ListEmpty = useCallback(
    () =>
      !isLoading ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.noDataLabel}>
            {search ? 'No results found' : 'No Data Found'}
          </Text>
        </View>
      ) : null,
    [isLoading, search],
  );

  // Render chat item
  const renderItem = useCallback(
    ({ item }: { item: ChatItem }) => (
      <TouchableOpacity
        style={styles.chatRow}
        onPress={() =>
          navigate('ChatDetails', {
            sessionId: item?.vonage_session_id,
            name: item?.client,
          })
        }
      >
        <Image
          source={
            item?.client_profile_image
              ? {
                  uri:
                    IMAGES_BUCKET_URL.profile_user + item?.client_profile_image,
                }
              : Icons.profile
          }
          style={styles.avatar}
          tintColor={item?.client_profile_image ? undefined : Colors.black}
        />
        <View style={styles.contentContainer}>
          <View style={styles.row}>
            <Text style={styles.name} numberOfLines={1}>
              {item?.client ?? 'N/A'}
            </Text>
            <Text style={styles.time}>
              {formatDateTime(item.start_date_time).formattedDate}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.message} numberOfLines={1}>
              {item.session_ref_number}
            </Text>
            <Text style={styles.time}>
              {formatDateTime(item.start_date_time).formattedTime}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    ),
    [],
  );

  // Key extractor
  const keyExtractor = useCallback(
    (item: ChatItem, index: number) => `${item?._id || 'no-id'}-${index}`,
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
      <Header />
      <Loader visible={page === 1 ? loading : false} />

      <Text style={styles.title}>
        Chat <Text style={styles.titleBold}>History</Text>
      </Text>

      <View style={styles.contentWrapper}>
        {/* Search Bar */}
        <View style={styles.searchBox}>
          <Image source={Icons.search} style={styles.searchIcon} />
          <TextInput
            placeholder="Search people"
            placeholderTextColor={Colors.dust}
            style={styles.searchInput}
            value={search}
            onChangeText={handleSearchChange}
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
          />
          {search.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearch('')}
              style={styles.clearButton}
            >
              <Image source={Icons.close} style={styles.clearIcon} />
            </TouchableOpacity>
          )}
        </View>

        {/* Section Title */}
        <Text style={styles.sectionTitle}>
          {search ? `Results for "${search}"` : 'Chat History'}
        </Text>

        {/* Chat List */}
        <FlatList
          data={allSessionList}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={LoadingFooter}
          ListEmptyComponent={ListEmpty}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={10}
        />
      </View>
    </View>
  );
};

export default ChatList;

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
  title: {
    fontFamily: Fonts.Manrope_Regular,
    color: Colors.night_blue,
    fontSize: normalize(20),
    marginLeft: normalize(15),
    marginTop: normalize(10),
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
  searchBox: {
    backgroundColor: Colors.white,
    borderRadius: normalize(10),
    borderColor: Colors.blue_chalk,
    borderWidth: normalize(1),
    paddingHorizontal: normalize(15),
    height: normalize(42),
    position: 'absolute',
    width: '90%',
    alignSelf: 'center',
    top: normalize(-21),
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: Colors.gray,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
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
    fontSize: normalize(11),
    color: Colors.night_blue,
  },
  clearButton: {
    padding: normalize(1),
    borderRadius: normalize(14),
    borderColor: Colors.black,
    borderWidth: 1,
  },
  clearIcon: {
    height: normalize(15),
    width: normalize(15),
    tintColor: Colors.dark_grey,
  },
  sectionTitle: {
    fontFamily: Fonts.Inter_Medium,
    fontSize: normalize(14),
    color: Colors.night_blue,
    marginBottom: normalize(15),
    marginTop: normalize(25),
  },
  listContent: {
    paddingBottom: normalize(40),
    paddingTop: normalize(8),
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: normalize(40),
  },
  chatRow: {
    flexDirection: 'row',
    marginBottom: normalize(22),
    alignItems: 'center',
  },
  avatar: {
    width: normalize(35),
    height: normalize(35),
    borderRadius: normalize(20),
    marginRight: normalize(12),
  },
  contentContainer: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontFamily: Fonts.Inter_Medium,
    fontSize: normalize(13),
    color: Colors.night_blue,
    maxWidth: '70%',
  },
  message: {
    fontFamily: Fonts.Inter_Regular,
    fontSize: normalize(11),
    color: Colors.dark_grey,
    marginTop: normalize(2),
  },
  time: {
    fontFamily: Fonts.Inter_Regular,
    fontSize: normalize(11),
    color: Colors.purple,
  },
  noDataLabel: {
    fontFamily: Fonts.Inter_Medium,
    color: Colors.dark_grey,
    fontSize: normalize(14),
    textAlign: 'center',
  },
});

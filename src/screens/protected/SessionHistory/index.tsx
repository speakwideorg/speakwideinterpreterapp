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
import { Colors, Fonts, Images } from '@app/themes';
import { normalize } from '@app/utils/orientation';
import MyStatusBar from '@app/utils/helpers/MyStatusBar';
import Header from '@app/components/common/Header';
import { hexToRGB } from '@app/utils/helpers';
import { isIos } from '@app/utils/helpers/Validation';
import { Session } from '@app/utils/constants';
import FooterLoader from '@app/utils/helpers/FooterLoader';
import { navigate } from '@app/navigation/RootNaivgation';
import SessionItem from '@app/components/template/SessionItem';
import Picker from '@app/components/common/Picker';
import ClientDetails from './ClientDetails';
import {
  getInterpreterListRequest,
  getInterpreterSessionTokenRequest,
  resetDefaults_interpreterSession,
} from '@app/store/slice/interpreterSession.slice';
import { useAppDispatch, useAppSelector } from '@app/store';
import { useIsFocused } from '@react-navigation/native';
import { VonageCallProps } from '@app/types';
const { width } = Dimensions.get('screen');

const TAB_TITLES = ['Active', 'Rejected', 'Completed'];

const SessionHistory = () => {
  const { status, loading } = useAppSelector(state => state.interpreterSession);
  const isFocused = useIsFocused();

  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedItem, setSelectedItem] = useState(null);
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [allItemsLoaded, setAllItemsLoaded] = useState(false);
  const [visible, setVisible] = useState(false);
  const [page, setPage] = useState(1);
  const sessionSlice = useAppSelector(
    state => state.interpreterSession.getInterpreterListResponse,
  );
  const [sessionData, setSessionData] = useState<any[]>([]);

  const [vonageOpponent, setVonageOpponent] = useState<VonageCallProps>({
    oponentUserId: '',
    oponentUserName: '',
    oponentUserProfileImage: '',
  });

  const [initialLoadDone, setInitialLoadDone] = useState(false);

  const currentTabLabel = useMemo(
    () =>
      selectedTab === 0
        ? 'Active'
        : selectedTab === 1
        ? 'Rejected'
        : 'Completed',
    [selectedTab],
  );

  console.log('selected tab===>', selectedTab);

  useEffect(() => {
    setPage(1);
    setSessionData([]);
    setAllItemsLoaded(false);
    setInitialLoadDone(false); // prevents the status effect from firing too early

    dispatch(
      getInterpreterListRequest({
        list_type:
          selectedTab === 0
            ? 'active'
            : selectedTab === 1
            ? 'declined'
            : 'completed',
        page: 1,
        length: 10,
      }),
    );
  }, [selectedTab]);

  const renderItem = useCallback(
    ({ item, index }: { item: Session; index: number }) => (
      <SessionItem
        index={index}
        item={item}
        onMenuPress={() => {}}
        type={currentTabLabel}
        onPressJoin={() => {
          setVonageOpponent({
            oponentUserId: '',
            oponentUserName: item?.client,
            oponentUserProfileImage: '',
          });
          dispatch(getInterpreterSessionTokenRequest({ _id: item?._id }));
        }}
        from={'sessionList'}
        onPress={() => {
          if (currentTabLabel === 'Completed') {
            setVisible(true);
            setSelectedItem(item);
          }
        }}
      />
    ),
    [currentTabLabel],
  );

  const LoadingFooter = useCallback(
    () => (isLoading && !allItemsLoaded ? <FooterLoader visible /> : null),
    [isLoading, allItemsLoaded],
  );

  const handleLoadMore = useCallback(() => {
    if (isLoading || allItemsLoaded || !initialLoadDone) return;

    dispatch(
      getInterpreterListRequest({
        list_type:
          selectedTab === 0
            ? 'active'
            : selectedTab === 1
            ? 'declined'
            : 'completed',
        page: page + 1,
        length: 10,
      }),
    );

    setPage(prev => prev + 1);
  }, [isLoading, allItemsLoaded, initialLoadDone, page, selectedTab]);

  useEffect(() => {
    if (!isFocused) return;

    switch (status) {
      case 'interpreterSession/getInterpreterListRequest':
        setIsLoading(true);
        break;

      case 'interpreterSession/getInterpreterListSuccess':
        setIsLoading(false);

        setSessionData(prev =>
          page === 1
            ? sessionSlice?.data?.docs
            : [...prev, ...sessionSlice?.data?.docs],
        );

        setAllItemsLoaded(
          !sessionSlice?.data?.meta?.hasNextPage ||
            sessionSlice?.data?.meta?.totalPages === page,
        );

        setInitialLoadDone(true);
        break;

      case 'interpreterSession/getInterpreterListFailure':
        setIsLoading(false);
        setInitialLoadDone(true);
        break;

      case 'interpreterSession/getInterpreterSessionTokenSuccess':
        dispatch(resetDefaults_interpreterSession());
        navigate('VonageCall', vonageOpponent);
        break;

      case 'interpreterSession/getInterpreterSessionTokenFailure':
        dispatch(resetDefaults_interpreterSession());
        break;
    }
  }, [status]);

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

      {/* Header Row */}
      <View style={styles.headerRow}>
        <Text style={styles.dashboardTitle}>
          Session <Text style={styles.boldText}>List</Text>
        </Text>
      </View>

      <View style={styles.contentWrapper}>
        {/* Tab Selector */}
        <View style={styles.selectionContainer}>
          {TAB_TITLES.map((title, idx) => {
            const isActive = idx === selectedTab;
            return (
              <TouchableOpacity
                key={title}
                onPress={() => setSelectedTab(idx)}
                style={isActive ? styles.selectionItem : styles.deSelectionItem}
              >
                <Text
                  style={
                    isActive ? styles.selectionTitle : styles.deSelectionTitle
                  }
                >
                  {title}
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
          onEndReached={() => {
            handleLoadMore();
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={LoadingFooter}
          ListEmptyComponent={() =>
            !isLoading && <Text style={styles.noDataLabel}>No Data Found</Text>
          }
        />
      </View>

      <Picker
        visible={visible}
        onClose={() => setVisible(false)}
        isShowCloseBtn={false}
      >
        <ClientDetails onClose={() => setVisible(false)} item={selectedItem} />
      </Picker>
    </View>
  );
};

export default memo(SessionHistory);

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
});

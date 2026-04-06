/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ImageBackground,
  Platform,
  Animated,
  LayoutAnimation,
  UIManager,
  Modal,
  ActivityIndicator,
  Pressable,
  Linking,
} from 'react-native';
import Header from '@app/components/common/Header';
import MyStatusBar from '@app/utils/helpers/MyStatusBar';
import { Colors, Fonts, Icons, Images } from '@app/themes';
import { normalize } from '@app/utils/orientation';
import LinearGradient from 'react-native-linear-gradient';
import FooterLoader from '@app/utils/helpers/FooterLoader';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { hexToRGB } from '@app/utils/helpers';
import { navigate } from '@app/navigation/RootNaivgation';
import { isIos } from '@app/utils/helpers/Validation';
import { Calendar } from 'react-native-calendars';
import { useIsFocused } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '@app/store';
import {
  payoutListRequest,
  taxDetailsRequest,
  transactionListRequest,
} from '@app/store/slice/payment.slice';
import { IMAGES_BUCKET_URL } from '@app/utils/constants';
import { showMessage } from '@app/utils/helpers/Toast';

const { width } = Dimensions.get('screen');

const TAB_TITLE_LIST = [
  { title: 'Transaction', value: 'Transaction' },
  { title: 'Payout', value: 'Payout' },
];

type SelectedDates = {
  startDate: any;
  endDate: any;
};

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const TransactionRow = ({ item, isLast }: { item: any; isLast: boolean }) => {
  return (
    <View>
      <TouchableOpacity style={styles.transactionRow} activeOpacity={0.7}>
        <Image
          source={
            item?.client?.profile_image
              ? {
                  uri:
                    IMAGES_BUCKET_URL.profile_user + item.client.profile_image,
                }
              : Icons.profile
          }
          style={styles.profileImage}
        />
        <View style={styles.transactionTextBox}>
          <Text style={styles.profileName}>
            {item?.client?.full_name || 'N/A'}
          </Text>
          <Text style={styles.timing}>
            {item?.session?.session_ref_number || 'N/A'}
          </Text>
        </View>
        <Text style={styles.amount}>${item?.amount?.toFixed(2) || '0.00'}</Text>
      </TouchableOpacity>
      {!isLast && <View style={styles.divider} />}
    </View>
  );
};

const PayoutRow = ({ item, isLast }: { item: any; isLast: boolean }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'succeeded':
        return Colors.green || '#10B981';
      case 'pending':
        return Colors.orange || '#F59E0B';
      case 'failed':
        return Colors.red || '#EF4444';
      default:
        return Colors.gray || '#6B7280';
    }
  };

  return (
    <View>
      <TouchableOpacity
        style={styles.transactionRow}
        onPress={() => navigate('TransactionHistory', { payoutId: item._id })}
        activeOpacity={0.7}
      >
        <View style={[styles.profileImage, styles.payoutIconContainer]}>
          <Image
            source={Icons.wallet || Icons.profile}
            style={styles.payoutIcon}
          />
        </View>
        <View style={styles.transactionTextBox}>
          <Text style={styles.profileName}>Payout</Text>
          <Text style={styles.timing}>
            {item?.lastPayoutDate ? formatDate(item.lastPayoutDate) : 'N/A'}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.amount}>
            ${item?.last_payout_amount?.toFixed(2) || '0.00'}
          </Text>
          <Text
            style={[
              styles.statusBadge,
              { color: getStatusColor(item?.status) },
            ]}
          >
            {item?.status || 'N/A'}
          </Text>
        </View>
      </TouchableOpacity>
      {!isLast && <View style={styles.divider} />}
    </View>
  );
};

const TransactionSection = ({
  title,
  data,
  isPayoutTab,
}: {
  title: string;
  data: any[];
  isPayoutTab?: boolean;
}) => {
  const [visible, setVisible] = useState(true);
  const animatedHeight = useRef(new Animated.Value(1)).current;

  const toggleSection = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setVisible(prev => !prev);

    Animated.timing(animatedHeight, {
      toValue: visible ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const renderItem = useCallback(
    ({ item, index }: any) => {
      if (isPayoutTab) {
        return <PayoutRow item={item} isLast={index === data.length - 1} />;
      }
      return <TransactionRow item={item} isLast={index === data.length - 1} />;
    },
    [data, isPayoutTab],
  );

  if (data.length === 0) return null;

  return (
    <View style={styles.boxDetails}>
      <TouchableOpacity
        onPress={toggleSection}
        style={styles.moreOption}
        activeOpacity={0.7}
      >
        <Text style={styles.todayDay}>{title}</Text>
        <Animated.Image
          source={Icons.arrow_drop_down}
          style={[
            styles.arrowRotate,
            {
              transform: [
                {
                  rotate: animatedHeight.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '180deg'],
                  }),
                },
              ],
            },
          ]}
        />
      </TouchableOpacity>

      {visible && (
        <Animated.View
          style={{
            overflow: 'hidden',
            opacity: animatedHeight,
          }}
        >
          <FlatList
            data={data}
            keyExtractor={(item, index) => `${item._id}-${index}`}
            renderItem={renderItem}
            scrollEnabled={false}
          />
        </Animated.View>
      )}
    </View>
  );
};

const TransactionList: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    isLoading,
    status,
    transactionListResponse,
    payoutListResponse,
    payoutDetailResponse,
    taxDetailsResponse,
  } = useAppSelector(state => state.payment);
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();

  console.log('payoutDetailResponse', payoutDetailResponse, taxDetailsResponse);

  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const [selectedDates, setSelectedDates] = useState<SelectedDates>({
    startDate: null,
    endDate: null,
  });
  const [tempStartDate, setTempStartDate] = useState(null);
  const [tempEndDate, setTempEndDate] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [footerLoading, setFooterLoading] = useState(false);
  const [allTransactions, setAllTransactions] = useState<any[]>([]);
  const [allPayouts, setAllPayouts] = useState<any[]>([]);
  const [selectedTab, setSelectedTab] = useState(0);

  const isFetchingRef = useRef(false);

  // Group items by date
  const groupItemsByDate = (items: any[], dateField: string = 'createdAt') => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const grouped: { [key: string]: any[] } = {
      Today: [],
      Yesterday: [],
    };

    items.forEach(item => {
      const itemDate = new Date(item[dateField]);
      itemDate.setHours(0, 0, 0, 0);

      if (itemDate.getTime() === today.getTime()) {
        grouped.Today.push(item);
      } else if (itemDate.getTime() === yesterday.getTime()) {
        grouped.Yesterday.push(item);
      } else {
        const dateKey = itemDate.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
        });
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(item);
      }
    });

    return grouped;
  };

  const groupedTransactions = groupItemsByDate(allTransactions, 'createdAt');
  const groupedPayouts = groupItemsByDate(allPayouts, 'lastPayoutDate');

  const openCalendar = () => {
    setIsCalendarVisible(true);
    setTempStartDate(selectedDates.startDate);
    setTempEndDate(selectedDates.endDate);
  };

  const closeCalendar = () => {
    setIsCalendarVisible(false);
    setTempStartDate(null);
    setTempEndDate(null);
  };

  const handleDayPress = (day: any) => {
    if (!tempStartDate || (tempStartDate && tempEndDate)) {
      setTempStartDate(day.dateString);
      setTempEndDate(null);
    } else {
      const start = new Date(tempStartDate);
      const end = new Date(day.dateString);

      if (end < start) {
        setTempStartDate(day.dateString);
        setTempEndDate(tempStartDate);
      } else {
        setTempEndDate(day.dateString);
      }
    }
  };

  const applySelection = () => {
    if (tempStartDate && tempEndDate) {
      setSelectedDates({
        startDate: tempStartDate,
        endDate: tempEndDate,
      });
      // Reset and fetch with new dates
      setPage(1);
      setAllTransactions([]);
      setAllPayouts([]);
      setHasMore(true);
      fetchData(1, tempStartDate, tempEndDate);
    }
    closeCalendar();
  };

  const clearDateFilter = () => {
    setSelectedDates({
      startDate: null,
      endDate: null,
    });
    setPage(1);
    setAllTransactions([]);
    setAllPayouts([]);
    setHasMore(true);
    fetchData(1, null, null);
  };

  const formatDateRange = () => {
    if (selectedDates.startDate && selectedDates.endDate) {
      const start = new Date(selectedDates.startDate);
      const end = new Date(selectedDates.endDate);

      const startFormatted = start.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
      });

      const endFormatted = end.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
      });

      return `${startFormatted} - ${endFormatted}`;
    }
    return 'Select dates';
  };

  const getMarkedDates = () => {
    let markedDates: any = {};

    if (tempStartDate) {
      markedDates[tempStartDate] = {
        selected: true,
        startingDay: true,
        color: Colors.purple,
      };
    }

    if (tempEndDate) {
      markedDates[tempEndDate] = {
        selected: true,
        endingDay: true,
        color: Colors.purple,
      };

      if (tempStartDate && tempEndDate) {
        const start = new Date(tempStartDate);
        const end = new Date(tempEndDate);
        const current = new Date(start);

        while (current <= end) {
          const dateString = current.toISOString().split('T')[0];
          if (dateString !== tempStartDate && dateString !== tempEndDate) {
            markedDates[dateString] = {
              selected: true,
              color: Colors.hawkes_blue,
            };
          }
          current.setDate(current.getDate() + 1);
        }
      }
    } else if (tempStartDate) {
      markedDates[tempStartDate] = {
        selected: true,
        color: Colors.purple,
      };
    }

    return markedDates;
  };

  const fetchData = useCallback(
    (pageNum: number, fromDate: any = null, toDate: any = null) => {
      if (isFetchingRef.current) return;

      isFetchingRef.current = true;
      pageNum === 1 ? null : setFooterLoading(true);

      const params: any = {
        page: pageNum,
        limit: 10,
        sortField: 'createdAt',
        sortOrder: 'desc',
      };

      if (fromDate && toDate) {
        params.from = fromDate;
        params.to = toDate;
      }

      dispatch(transactionListRequest(params));
      dispatch(payoutListRequest(params));
    },
    [dispatch],
  );

  useEffect(() => {
    if (isFocused) {
      setPage(1);
      setAllTransactions([]);
      setAllPayouts([]);
      setHasMore(true);
      isFetchingRef.current = false;
      fetchData(1, selectedDates.startDate, selectedDates.endDate);
      dispatch(taxDetailsRequest({}));
    }
  }, [isFocused]);

  // Handle transaction list response
  useEffect(() => {
    if (transactionListResponse) {
      const docs = transactionListResponse?.docs?.earnings || [];
      const totalPages = transactionListResponse?.pages || 1;

      if (page === 1) {
        setAllTransactions(docs);
      } else {
        setAllTransactions(prev => [...prev, ...docs]);
      }

      if (page >= totalPages || docs.length < 10) {
        setHasMore(false);
      }

      setFooterLoading(false);
      isFetchingRef.current = false;
    }
  }, [transactionListResponse]);

  // Handle payout list response
  useEffect(() => {
    if (payoutListResponse) {
      const docs = Array.isArray(payoutListResponse)
        ? payoutListResponse
        : payoutListResponse?.docs || [];
      const totalPages = payoutListResponse?.pages || 1;

      if (page === 1) {
        setAllPayouts(docs);
      } else {
        setAllPayouts(prev => [...prev, ...docs]);
      }

      if (Array.isArray(payoutListResponse)) {
        // If it's a simple array, we might not have pagination
        if (docs.length < 10) {
          setHasMore(false);
        }
      } else if (page >= totalPages || docs.length < 10) {
        setHasMore(false);
      }

      setFooterLoading(false);
      isFetchingRef.current = false;
    }
  }, [payoutListResponse]);

  const handleLoadMore = useCallback(() => {
    if (!footerLoading && hasMore && !isFetchingRef.current && !isLoading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchData(nextPage, selectedDates.startDate, selectedDates.endDate);
    }
  }, [footerLoading, hasMore, page, isLoading, fetchData, selectedDates]);

  const handleTabChange = (index: number) => {
    setSelectedTab(index);
    // Reset pagination when switching tabs
    setPage(1);
    setHasMore(true);
    setFooterLoading(false);
  };

  const totalEarning =
    transactionListResponse?.docs?.totalEarning?.toFixed(2) || '0.00';

  const totalPayout = allPayouts
    .reduce((sum, payout) => {
      return sum + (payout?.last_payout_amount || 0);
    }, 0)
    .toFixed(2);

  const currentData = selectedTab === 0 ? allTransactions : allPayouts;
  const groupedData = selectedTab === 0 ? groupedTransactions : groupedPayouts;
  const displayTotal = selectedTab === 0 ? totalEarning : totalPayout;
  const displayLabel =
    selectedTab === 0 ? 'Total Earnings YTD' : 'Total Payouts YTD';

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
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
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: normalize(30),
        }}
        onScrollEndDrag={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const isCloseToBottom =
            layoutMeasurement.height + contentOffset.y >=
            contentSize.height - 20;
          if (isCloseToBottom) {
            handleLoadMore();
          }
        }}
      >
        <Header />

        <Text style={styles.title}>
          Earnings & <Text style={styles.boldText}>Payouts</Text>
        </Text>
        <View style={styles.contentWrapper}>
          <View style={styles.selectionContainer}>
            {TAB_TITLE_LIST.map((tab_title, idx) => {
              const isActive = idx === selectedTab;
              return (
                <TouchableOpacity
                  key={idx.toString()}
                  onPress={() => handleTabChange(idx)}
                  style={
                    isActive ? styles.selectionItem : styles.deSelectionItem
                  }
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
          {selectedTab === 1 && (
            <Pressable
              onPress={() =>
                taxDetailsResponse?.link
                  ? Linking.openURL(taxDetailsResponse?.link || '')
                  : showMessage('No tax details available')
              }
              style={styles.taxDetailsBox}
            >
              <Text>Tax Details</Text>
            </Pressable>
          )}

          {/* Earnings/Payout Card */}
          <View style={styles.paymentBox}>
            <ImageBackground
              source={Images.maskview}
              style={styles.earningsCard}
              imageStyle={{ borderRadius: 15 }}
            >
              <View style={styles.earningsHeader}>
                <Text style={styles.totalExpand}>
                  {selectedTab === 0 ? 'Total Earned' : 'Total Payout'}
                </Text>
                <TouchableOpacity style={styles.usdBox}>
                  <Text style={styles.usdText}>USD</Text>
                  <Image
                    source={Icons.arrow_drop_down}
                    style={styles.arrowTwo}
                  />
                </TouchableOpacity>
              </View>
              <Text style={styles.totalAmount}>$ {displayTotal}</Text>
              <View style={styles.earningsFooter}>
                <Text style={styles.totalTag}>{displayLabel}</Text>
                <Text style={styles.priceTag}>$ {displayTotal}</Text>
              </View>
            </ImageBackground>
          </View>

          {/* Recent Items Header */}
          <View style={styles.transactionHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.innerText}>
                {selectedTab === 0 ? 'Recent Transactions' : 'Recent Payouts'}
              </Text>
              <Image source={Icons.transactionstars} style={styles.starIcon} />
            </View>
            <TouchableOpacity activeOpacity={0.7} onPress={openCalendar}>
              <LinearGradient
                colors={['#F6F0FF', '#F0E6FF']}
                style={styles.calenderBox}
              >
                <View style={styles.row}>
                  <View style={styles.circleBox}>
                    <Image
                      source={Icons.calendar}
                      style={styles.calendarIcon}
                    />
                  </View>
                  <Text style={styles.dateTitle}>{formatDateRange()}</Text>
                  <Image source={Icons.arrow_drop_down} style={styles.arrow} />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Clear Filter Button */}
          {selectedDates.startDate && selectedDates.endDate && (
            <TouchableOpacity
              style={styles.clearFilterButton}
              onPress={clearDateFilter}
              activeOpacity={0.7}
            >
              <Text style={styles.clearFilterText}>Clear Date Filter</Text>
            </TouchableOpacity>
          )}

          {/* Loading Indicator */}
          {isLoading && page === 1 ? (
            <View style={styles.loaderBox}>
              <ActivityIndicator size="large" color={Colors.purple} />
            </View>
          ) : currentData.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {selectedTab === 0
                  ? 'No transactions found'
                  : 'No payouts found'}
              </Text>
            </View>
          ) : (
            <>
              {/* Sections with grouped data */}
              {Object.keys(groupedData).map(dateKey => (
                <TransactionSection
                  key={dateKey}
                  title={dateKey}
                  data={groupedData[dateKey]}
                  isPayoutTab={selectedTab === 1}
                />
              ))}

              {/* Footer Loader */}
              {footerLoading && (
                <View style={styles.loaderBox}>
                  <FooterLoader visible />
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>

      {/* Calendar Modal */}
      <Modal
        visible={isCalendarVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={closeCalendar}
      >
        <View style={styles.modalContainer}>
          <View style={styles.calendarContainer}>
            <Text style={styles.modalTitle}>Select Date Range</Text>
            <Calendar
              onDayPress={handleDayPress}
              markedDates={getMarkedDates()}
              markingType="period"
              theme={{
                backgroundColor: Colors.white,
                calendarBackground: Colors.white,
                selectedDayBackgroundColor: Colors.purple,
                selectedDayTextColor: Colors.white,
                todayTextColor: Colors.purple,
                dayTextColor: Colors.day_dark,
                textDisabledColor: Colors.disable_dark,
                arrowColor: Colors.purple,
                monthTextColor: Colors.purple,
                textDayFontWeight: '300',
                textMonthFontWeight: 'bold',
                textDayHeaderFontWeight: '300',
                textDayFontSize: normalize(15),
                textMonthFontSize: normalize(15),
                textDayHeaderFontSize: normalize(15),
              }}
            />
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={closeCalendar}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.applyButton,
                  (!tempStartDate || !tempEndDate) && styles.disabledButton,
                ]}
                onPress={applySelection}
                disabled={!tempStartDate || !tempEndDate}
              >
                <Text style={styles.applyButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default TransactionList;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.ceramic },
  topShape: { height: normalize(340), width, position: 'absolute', top: 0 },
  title: {
    fontFamily: Fonts.Manrope_Regular,
    color: Colors.night_blue,
    fontSize: normalize(20),
    marginLeft: '5%',
    marginTop: normalize(10),
  },
  boldText: { fontFamily: Fonts.Manrope_SemiBold },
  paymentBox: {
    borderRadius: normalize(10),
    alignSelf: 'center',
    width: '90%',
    // marginTop: normalize(5),
  },
  earningsCard: { width: '100%', height: normalize(140) },
  earningsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: normalize(15),
    marginTop: normalize(15),
    marginBottom: normalize(5),
  },
  earningsFooter: {
    marginLeft: normalize(20),
    marginTop: Platform.select({ ios: 10, android: 8 }),
  },
  totalExpand: {
    fontFamily: Fonts.Inter_Regular,
    fontSize: normalize(10),
    color: '#FFF',
  },
  totalAmount: {
    fontFamily: Fonts.Manrope_Bold,
    fontSize: normalize(28),
    fontWeight: '600',
    color: '#FFF',
    marginLeft: normalize(15),
    marginBottom: normalize(15),
  },
  totalTag: {
    fontFamily: Fonts.Inter_Regular,
    fontSize: normalize(9),
    color: '#FFF',
  },
  priceTag: {
    fontFamily: Fonts.Inter_SemiBold,
    fontSize: normalize(10),
    color: '#FFF',
    fontWeight: '600',
    marginTop: Platform.select({ ios: 2, android: 0 }),
  },
  usdBox: {
    width: normalize(40),
    height: normalize(17),
    borderRadius: 100,
    backgroundColor: '#AEA3FF',
    borderWidth: 1,
    borderColor: '#BBB2FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: normalize(8),
  },
  usdText: {
    fontSize: normalize(9),
    color: '#FFF',
    marginRight: 2,
    fontFamily: Fonts.Inter_Regular,
  },
  arrowTwo: { width: normalize(6), height: normalize(3), tintColor: '#FFF' },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'center',
    width: '90%',
    marginTop: normalize(15),
  },
  innerText: {
    fontFamily: Fonts.Inter_Medium,
    fontSize: normalize(12),
    color: Colors.night_blue,
  },
  starIcon: {
    width: normalize(12),
    height: normalize(12),
    top: normalize(-5),
    right: normalize(-5),
  },
  calenderBox: {
    width: normalize(140),
    height: normalize(40),
    borderRadius: 100,
    justifyContent: 'center',
  },
  row: { flexDirection: 'row', alignItems: 'center', marginLeft: normalize(4) },
  circleBox: {
    width: normalize(30),
    height: normalize(30),
    backgroundColor: Colors.purple,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarIcon: {
    width: normalize(18),
    height: normalize(18),
    tintColor: '#FFF',
  },
  dateTitle: {
    fontFamily: Fonts.Inter_Medium,
    fontSize: normalize(10),
    color: Colors.night_blue,
    marginHorizontal: 4,
  },
  arrow: {
    width: normalize(9),
    height: normalize(9),
    resizeMode: 'contain',
    tintColor: Colors.night_blue,
  },
  clearFilterButton: {
    alignSelf: 'center',
    backgroundColor: Colors.purple,
    paddingHorizontal: normalize(20),
    paddingVertical: normalize(8),
    borderRadius: normalize(20),
    marginTop: normalize(10),
  },
  clearFilterText: {
    color: Colors.white,
    fontFamily: Fonts.Inter_Medium,
    fontSize: normalize(11),
  },
  boxDetails: {
    marginTop: normalize(15),
    alignSelf: 'center',
    width: '90%',
    borderRadius: normalize(10),
    backgroundColor: '#FFF',
    shadowColor: hexToRGB(Colors.black, isIos() ? 0.6 : 0.5),
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  moreOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: normalize(15),
  },
  todayDay: {
    fontFamily: Fonts.Inter_Regular,
    fontSize: normalize(12),
    color: '#3A3A3A',
  },
  arrowRotate: {
    width: normalize(12),
    height: normalize(12),
    tintColor: Colors.night_blue,
    resizeMode: 'contain',
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: normalize(10),
  },
  transactionTextBox: { flex: 1, marginLeft: normalize(12) },
  profileImage: {
    width: normalize(37),
    height: normalize(37),
    borderRadius: 18.5,
  },
  profileName: {
    fontFamily: Fonts.Inter_Medium,
    fontSize: normalize(11),
    color: Colors.night_blue,
    fontWeight: '600',
  },
  timing: {
    fontFamily: Fonts.Inter_Regular,
    color: '#3A3A3A',
    fontSize: normalize(9),
    marginTop: 4,
  },
  amount: {
    fontFamily: Fonts.Inter_Medium,
    fontSize: normalize(14),
    color: Colors.night_blue,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    width: '92%',
    backgroundColor: '#EDEDED',
    alignSelf: 'center',
    marginTop: 8,
  },
  loaderBox: { marginVertical: normalize(15), alignItems: 'center' },
  emptyContainer: {
    marginTop: normalize(40),
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: Fonts.Inter_Medium,
    fontSize: normalize(14),
    color: Colors.dark_grey,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  calendarContainer: {
    backgroundColor: 'white',
    borderRadius: normalize(10),
    padding: normalize(18),
    width: '90%',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: normalize(18),
  },
  button: {
    paddingVertical: normalize(10),
    paddingHorizontal: normalize(20),
    borderRadius: normalize(8),
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F0F0F0',
  },
  applyButton: {
    backgroundColor: Colors.purple,
  },
  disabledButton: {
    backgroundColor: Colors.disable_dark,
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: '600',
  },
  applyButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: normalize(15),
    fontWeight: '600',
    color: Colors.black,
    marginBottom: normalize(14),
    textAlign: 'center',
    fontFamily: Fonts.Inter_Bold,
  },
  contentWrapper: {
    flex: 1,
    backgroundColor: Colors.white,
    marginTop: normalize(30),
    borderTopLeftRadius: normalize(30),
    borderTopRightRadius: normalize(30),
    shadowColor: Colors.black,
    // shadowOffset: { width: 0, height: 4 },
    // shadowOpacity: 0.1,
    // shadowRadius: 10,
    // elevation: 2,
  },
  selectionContainer: {
    backgroundColor: Colors.alabaster,
    height: normalize(45),
    width: '75%',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
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
    width: '48.3%',
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
    width: '48.3%',
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
  payoutIconContainer: {
    backgroundColor: Colors.light_purple || '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  payoutIcon: {
    width: normalize(20),
    height: normalize(20),
    tintColor: Colors.purple,
  },
  statusBadge: {
    fontSize: normalize(12),
    fontWeight: '600',
    textTransform: 'capitalize',
    marginTop: normalize(4),
  },
  taxDetailsBox: {
    alignSelf: 'center',
    marginTop: normalize(-10),
    marginBottom: normalize(10),
    paddingVertical: normalize(6),
    paddingHorizontal: normalize(12),
    borderRadius: normalize(20),
    backgroundColor: Colors.alabaster,
    borderWidth: 1,
    borderColor: Colors.blue_chalk,
  },
});

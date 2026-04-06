/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, memo, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  TextInput,
  ScrollView,
  Pressable,
} from 'react-native';
import MyStatusBar from '@app/utils/helpers/MyStatusBar';
import { Colors, Fonts, Icons, Images } from '@app/themes';
import Header from '@app/components/common/Header';
import { normalize } from '@app/utils/orientation';
import HelpCard from './model/HelpCard';
import Button from '@app/components/common/Button';
// import { isIos } from '@app/utils/helpers/Validation';
import Picker from '@app/components/common/Picker';
import SessionIssueModal from './model/SessionIssueModal';
import { navigate } from '@app/navigation/RootNaivgation';
import { useAppDispatch, useAppSelector } from '@app/store';
import { useIsFocused } from '@react-navigation/native';
import Loader from '@app/utils/helpers/Loader';
import {
  disputeDetailsRequest,
  disputeListRequest,
} from '@app/store/slice/interpreterSession.slice';

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

const ListEmptyContainer = () => (
  <View style={styles.noDataContainer}>
    <Text style={styles.noDataLabel}>No Data Found</Text>
  </View>
);

// Small memoized renderer to avoid defining a component inside HelpSupport render
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
      />
    );
  },
);

const HelpSupport = () => {
  const dispatch = useAppDispatch();
  const isFocused = useIsFocused();
  const { loading, disputeListResponse } = useAppSelector(
    state => state.interpreterSession,
  );
  const [isVisible, setIsVisible] = useState(false);

  console.log('dispute list response===>', disputeListResponse);

  useEffect(() => {
    if (isFocused) {
      dispatch(
        disputeListRequest({
          list_type: ['Pending', 'Resolved', 'Declined'],
          page: 1,
          limit: 5,
          search: '',
        }),
      );
    }
  }, [isFocused]);

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
      <Loader visible={loading} />
      <Text style={styles.title}>
        Help <Text style={styles.titleBold}>& Support</Text>
      </Text>
      <View style={styles.contentWrapper}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.rowBetween}>
            <Text style={styles.headingTitle}>
              Support Tickets
              {/* <Text style={styles.headingCount}> (28)</Text> */}
            </Text>
            <Button
              onPress={() => navigate('Dashboard')}
              title="Create Dispute"
              width={normalize(135)}
              marginTop={0}
              fontSize={normalize(13)}
            />
          </View>
          <Pressable
            style={styles.searchBox}
            onPress={() =>
              navigate('DisputeList', {
                list_type: 'Pending',
              })
            }
          >
            <Image source={Icons.search} style={styles.searchIcon} />
            <TextInput
              placeholder="Search here.."
              placeholderTextColor={Colors.dust}
              style={styles.searchInput}
              editable={false}
            />
          </Pressable>
          {['In Progress', 'Completed', 'Rejected']?.map(itm => {
            return (
              <View style={styles.sectionWrapper}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text style={styles.progressText}>
                    {itm}(
                    {itm === 'In Progress'
                      ? disputeListResponse?.Pending?.data?.total
                      : itm === 'Completed'
                      ? disputeListResponse?.Resolved?.data?.total
                      : disputeListResponse?.Declined?.data?.total}
                    )
                  </Text>
                  <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center' }}
                    onPress={() =>
                      navigate('DisputeList', {
                        list_type:
                          itm === 'In Progress'
                            ? 'Pending'
                            : itm === 'Completed'
                            ? 'Resolved'
                            : 'Declined',
                      })
                    }
                  >
                    <Text style={styles.viewAllLabel}>View All</Text>
                    <Image
                      source={Icons.double_arrow_right}
                      style={styles.arrowIcon}
                    />
                  </TouchableOpacity>
                </View>
                <FlatList
                  data={
                    itm === 'In Progress'
                      ? [...(disputeListResponse?.Pending?.data?.docs || [])]
                      : itm === 'Completed'
                      ? [...(disputeListResponse?.Resolved?.data?.docs || [])]
                      : [...(disputeListResponse?.Declined?.data?.docs || [])]
                  }
                  keyExtractor={(item, index) =>
                    item?._id || `viewall-${index}`
                  }
                  renderItem={({ item, index }) => (
                    <TicketItem
                      item={item}
                      index={index}
                      background="#FFF8F1"
                      badge="#FFF1E2"
                      text="#FFBE79"
                      onPress={() => {
                        setIsVisible(true);
                        dispatch(disputeDetailsRequest({ id: item._id }));
                      }}
                    />
                  )}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.listContent}
                  ListEmptyComponent={ListEmptyContainer}
                />
              </View>
            );
          })}
        </ScrollView>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigate('CustomerSupport')}
          style={styles.floatingCircle}
        >
          <Image source={Icons.headset_mic} style={styles.fabIcon} />
        </TouchableOpacity>

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

export default memo(HelpSupport);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.ceramic,
  },
  listContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllButton: {
    width: normalize(40),
    height: normalize(40),
    backgroundColor: Colors.alabaster,
    borderRadius: normalize(20),
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: normalize(12),
    alignSelf: 'center',
  },
  arrowIcon: {
    width: normalize(20),
    height: normalize(20),
    tintColor: Colors.night_blue,
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
    marginTop: normalize(20),
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
    paddingRight: normalize(15),
  },
  floatingCircle: {
    position: 'absolute',
    bottom: normalize(30),
    right: normalize(20),
    height: normalize(50),
    width: normalize(50),
    borderRadius: normalize(35),
    backgroundColor: Colors.pinkest,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  fabIcon: {
    width: normalize(20),
    height: normalize(20),
    tintColor: Colors.white,
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
  viewAllLabel: {
    fontFamily: Fonts.Inter_Regular,
    fontSize: normalize(11),
    color: Colors.night_blue,
  },
});

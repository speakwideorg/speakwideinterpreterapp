/* eslint-disable react-hooks/exhaustive-deps */
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { Colors, Fonts, Icons, Images } from '@app/themes';
import Header from '@app/components/common/Header';
import MyStatusBar from '@app/utils/helpers/MyStatusBar';
import { normalize } from '@app/utils/orientation';
import { useIsFocused } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '@app/store';
import {
  notificationDeleteAllRequest,
  notificationDeleteRequest,
  notificationListRequest,
  notificationMarkAllReadRequest,
} from '@app/store/slice/Notification.slice';
import { NotificationItem } from '@app/types';
import FooterLoader from '@app/utils/helpers/FooterLoader';
import { navigate } from '@app/navigation/RootNaivgation';
import Loader from '@app/utils/helpers/Loader';

const { width } = Dimensions.get('screen');

const Notifications = () => {
  const isfocused = useIsFocused();
  const dispatch = useAppDispatch();

  const { notificationListResponse, status } = useAppSelector(
    state => state.notification,
  );
  const [list, setList] = useState<NotificationItem[]>([]);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const fetchNotifications = (pageNumber: number) => {
    setLoading(true);
    dispatch(notificationListRequest({ page: pageNumber, limit: 5 }));
  };
  useEffect(() => {
    if (isfocused) {
      setPage(1);
      fetchNotifications(1);
    }
  }, [isfocused]);

  useEffect(() => {
    switch (status) {
      case 'notification/notificationDeleteSuccess':
      case 'notification/notificationMarkAllReadSuccess':
      case 'notification/notificationDeleteAllSuccess':
        setPage(1);
        fetchNotifications(1);
        break;
    }
  }, [status]);

  useEffect(() => {
    if (notificationListResponse?.status == 200) {
      const newData =
        notificationListResponse?.docs || notificationListResponse?.data?.docs;
      if (page === 1) {
        setList(newData);
      } else {
        setList(prev => [...prev, ...newData]);
      }

      setHasMore(newData?.length > 0);
      setLoading(false);
    }
  }, [notificationListResponse]);

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchNotifications(nextPage);
    }
  };

  const renderItem = ({ item }: any) => {
    // console.log('item===>', item);
    return (
      <TouchableOpacity
        style={[
          styles.card,
          !item?.is_read && { backgroundColor: Colors.light_purple },
        ]}
        activeOpacity={0.8}
        onPress={() => {
          const handleNavigate = (type: string) => {
            navigate('DrawerNavigation', {
              screen: 'Dashboard',
              params: {
                screen: 'SessionDetails',
                params: {
                  details: {
                    _id: item?.data?.session_id,
                    title: item?.data?.title,
                    description: item?.data?.body,
                    notification_id: item?.uid,
                  },
                  type,
                  from: 'notificationList',
                },
              },
            });
          };

          switch (item?.data?.type) {
            case 'session_requested':
            case 'session_updated':
              handleNavigate('RequestDetails');
              break;
            case 'scheduled_session_updated':
              handleNavigate('ScheduledDetails');
              break;
            default:
              navigate('Notifications');
              break;
          }
        }}
      >
        {/* IMAGE */}
        {/* <Image source={{ uri: item?.data?.imageUrl }} style={styles.image} /> */}

        {/* CONTENT */}
        <View style={styles.textWrapper}>
          <Text style={styles.titleTxt}>{item?.data?.title}</Text>

          <Text style={styles.bodyTxt}>{item?.data?.body}</Text>

          <Text style={styles.timeTxt}>
            {new Date(item?.createdAt).toLocaleString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.deleteButton,
            item?.is_read && {
              backgroundColor: Colors.light_purple,
            },
          ]}
          onPress={() => dispatch(notificationDeleteRequest({ id: item?._id }))}
        >
          <Image
            source={Icons.delete}
            style={styles.deleteImage}
            tintColor={Colors.red}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
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
      <Header
        isBack={true}
        isShowProfile={false}
        isShowName={false}
        isNotiShow={false}
      />
      <Loader visible={loading && page === 1} />

      <Text style={styles.title}>
        Notifications{' '}
        <Text style={{ fontFamily: Fonts.Manrope_SemiBold }}>History</Text>
      </Text>

      <View style={styles.contentWrapper}>
        <View style={styles.mainButtonContainer}>
          <TouchableOpacity
            style={styles.buttonContainer}
            onPress={() => dispatch(notificationMarkAllReadRequest({}))}
          >
            <Text style={styles.buttonText}>Mark all as read</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.buttonContainer}
            onPress={() => dispatch(notificationDeleteAllRequest({}))}
          >
            <Text style={styles.buttonText}>Delete all</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={list}
          renderItem={renderItem}
          keyExtractor={(item: any, index) =>
            item?._id ? `${item._id}_${index}` : `${index}`
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: normalize(80) }}
          onEndReachedThreshold={0.3}
          onEndReached={loadMore}
          ListFooterComponent={loading ? <FooterLoader visible={true} /> : null}
          ListEmptyComponent={() => (
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={styles.emptyTxt}>No Notification found</Text>
            </View>
          )}
        />
      </View>
    </View>
  );
};

export default Notifications;

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

  contentWrapper: {
    flex: 1,
    backgroundColor: Colors.white,
    marginTop: normalize(20),
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

  card: {
    flexDirection: 'row',
    padding: normalize(10),
    borderRadius: normalize(12),
    backgroundColor: Colors.white,
    marginBottom: normalize(12),
    elevation: 1,
    borderColor: Colors.light_purple,
    borderWidth: 1,
  },

  image: {
    height: normalize(55),
    width: normalize(55),
    borderRadius: normalize(10),
    backgroundColor: Colors.paly_grey,
  },
  deleteButton: {
    width: normalize(25),
    height: normalize(25),
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    right: normalize(6),
    top: normalize(6),
    backgroundColor: Colors.white,
    borderRadius: normalize(15),
  },
  deleteImage: {
    height: normalize(20),
    width: normalize(20),
  },

  textWrapper: {
    flex: 1,
    marginLeft: normalize(10),
  },

  titleTxt: {
    fontFamily: Fonts.Manrope_SemiBold,
    color: Colors.night_blue,
    fontSize: normalize(15),
  },

  bodyTxt: {
    fontFamily: Fonts.Manrope_Regular,
    color: Colors.dark_grey,
    fontSize: normalize(13),
    marginTop: normalize(4),
  },

  timeTxt: {
    fontFamily: Fonts.Manrope_Regular,
    color: Colors.gray,
    fontSize: normalize(12),
    marginTop: normalize(6),
  },

  emptyTxt: {
    textAlign: 'center',
    marginTop: normalize(30),
    fontSize: normalize(15),
    fontFamily: Fonts.Manrope_Medium,
    color: Colors.gray,
  },
  mainButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: normalize(10),
  },
  buttonContainer: {
    padding: normalize(8),
    borderRadius: normalize(8),
    borderWidth: 1,
    borderColor: Colors.light_purple,
    backgroundColor: Colors.light_purple,
  },
  buttonText: {
    fontFamily: Fonts.Manrope_SemiBold,
    color: Colors.dark_grey,
    fontSize: normalize(12),
  },
});

/* eslint-disable react-hooks/exhaustive-deps */
import Button from '@app/components/common/Button';
import { navigate } from '@app/navigation/RootNaivgation';
import { useAppDispatch, useAppSelector } from '@app/store';
import { getInterpreterDetailsRequest } from '@app/store/slice/interpreterSession.slice';
import { Colors, Fonts, Icons, Images } from '@app/themes';
import {
  chatData,
  IMAGES_BUCKET_URL,
  Message,
  messages,
} from '@app/utils/constants';
import { hexToRGB } from '@app/utils/helpers';
import { isIos } from '@app/utils/helpers/Validation';
import { normalize } from '@app/utils/orientation';
import { useIsFocused } from '@react-navigation/native';
import moment from 'moment';
import React, { FC, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';

type TabType = 'Information' | 'Shared Files' | 'Chat';

type Props = {
  onClose: () => void;
  item: any;
};

const ClientDetails: FC<Props> = ({ onClose, item }) => {
  const isFocused = useIsFocused();
  const dispatch = useAppDispatch();
  const { getInterpreterDetailsResponse } = useAppSelector(
    state => state.interpreterSession,
  );
  const [activeTab, setActiveTab] = useState<TabType>('Information');

  console.log('getInterpreterDetailsResponse', getInterpreterDetailsResponse);

  console.log('item', item);

  const RenderMessage = ({ item }: { item: Message }) => {
    // render date separator
    if (item.type === 'date') {
      return (
        <View style={styles.dateWrapper}>
          <Text style={styles.dateText}>{item.dateLabel}</Text>
        </View>
      );
    }

    // render sent message
    if (item.type === 'sent') {
      return (
        <View>
          <View style={styles.sentWrapper}>
            <View style={styles.sentBubble}>
              <Text style={styles.messageText}>{item.text}</Text>
            </View>
            {item.avatar && (
              <Image source={item.avatar} style={styles.avatarSmall} />
            )}
          </View>
          <Text
            style={[
              styles.timeText,
              { textAlign: 'right', color: Colors.dust },
            ]}
          >
            {item.time}
          </Text>
        </View>
      );
    }

    // render received message
    return (
      <View>
        <View style={styles.receivedWrapper}>
          {item.avatar && (
            <Image source={item.avatar} style={styles.avatarSmall} />
          )}
          <View style={styles.receivedBubble}>
            <Text style={styles.messageText}>{item.text}</Text>
          </View>
        </View>
        <Text style={[styles.timeText, { textAlign: 'left' }]}>
          {item.time}
        </Text>
      </View>
    );
  };

  useEffect(() => {
    if (isFocused) {
      dispatch(getInterpreterDetailsRequest({ id: item?._id }));
    }
  }, [isFocused]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Information':
        return (
          <View style={{ flex: 1 }}>
            <View style={styles.row}>
              <View
                style={{
                  backgroundColor: '#F6F0FF',
                  height: normalize(32),
                  width: normalize(32),
                  borderRadius: normalize(6),
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Image
                  source={Icons.translate}
                  style={{
                    height: normalize(18),
                    width: normalize(18),
                    tintColor: Colors.purple,
                  }}
                />
              </View>
              <View style={{ marginLeft: normalize(10) }}>
                <Text style={styles.label}>Languages</Text>
                <Text style={styles.value}>
                  {
                    getInterpreterDetailsResponse?.language_one
                      ?.language_display_name
                  }{' '}
                  ↔{' '}
                  {
                    getInterpreterDetailsResponse?.language_two
                      ?.language_display_name
                  }
                </Text>
              </View>
            </View>

            <View style={styles.row}>
              <View
                style={{
                  backgroundColor: '#F6F0FF',
                  height: normalize(32),
                  width: normalize(32),
                  borderRadius: normalize(6),
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Image
                  source={Icons.calendar}
                  style={{
                    height: normalize(18),
                    width: normalize(18),
                    tintColor: Colors.purple,
                  }}
                />
              </View>
              <View style={{ marginLeft: normalize(10) }}>
                <Text style={styles.label}>Date</Text>
                <Text style={styles.value}>{`${moment(
                  getInterpreterDetailsResponse?.start_date_time,
                )
                  .local()
                  .format('dddd, DD MMMM YYYY')}`}</Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row' }}>
              <View style={[styles.row, { flex: 1 }]}>
                <View
                  style={{
                    backgroundColor: '#F6F0FF',
                    height: normalize(32),
                    width: normalize(32),
                    borderRadius: normalize(6),
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Image
                    source={Icons.schedule}
                    style={{
                      height: normalize(18),
                      width: normalize(18),
                      tintColor: Colors.purple,
                    }}
                  />
                </View>
                <View style={{ marginLeft: normalize(10) }}>
                  <Text style={styles.label}>Start Time</Text>
                  <Text style={styles.value}>{`${moment(
                    getInterpreterDetailsResponse?.start_date_time,
                  )
                    .local()
                    .format('hh:mm A')}`}</Text>
                </View>
              </View>

              <View style={[styles.row, { flex: 1 }]}>
                <View
                  style={{
                    backgroundColor: '#F6F0FF',
                    height: normalize(32),
                    width: normalize(32),
                    borderRadius: normalize(6),
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Image
                    source={Icons.schedule}
                    style={{
                      height: normalize(18),
                      width: normalize(18),
                      tintColor: Colors.purple,
                    }}
                  />
                </View>
                <View style={{ marginLeft: normalize(10) }}>
                  <Text style={styles.label}>End Time</Text>
                  <Text style={styles.value}>{`${moment(
                    getInterpreterDetailsResponse?.end_date_time,
                  )
                    .local()
                    .format('hh:mm A')}`}</Text>
                </View>
              </View>
            </View>

            <View style={styles.row}>
              <View
                style={{
                  backgroundColor: '#F6F0FF',
                  height: normalize(32),
                  width: normalize(32),
                  borderRadius: normalize(6),
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Image
                  source={Icons.tv_signin}
                  style={{
                    height: normalize(18),
                    width: normalize(18),
                    tintColor: Colors.purple,
                  }}
                />
              </View>
              <View style={{ marginLeft: normalize(10) }}>
                <Text style={styles.label}>Session Format</Text>
                <Text style={styles.value}>
                  {getInterpreterDetailsResponse?.format?.title}
                </Text>
              </View>
            </View>
          </View>
        );

      case 'Shared Files':
        return (
          <View style={{ flex: 1 }}>
            {getInterpreterDetailsResponse?.document?.length > 0 ? (
              getInterpreterDetailsResponse?.document?.map(i => (
                <View key={i} style={styles.fileCard}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Image
                      source={Icons.pdf}
                      style={{
                        height: normalize(25),
                        width: normalize(25),
                      }}
                    />
                    <View style={{ marginLeft: normalize(10) }}>
                      <Text style={styles.fileName}>mydocuments.pdf</Text>
                      <Text style={styles.fileSize}>1.2Mb</Text>
                    </View>
                  </View>

                  <TouchableOpacity>
                    <Image
                      source={Icons.file_save}
                      style={{
                        height: normalize(22),
                        width: normalize(22),
                      }}
                    />
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text style={styles.noDataFound}>No Document Found</Text>
            )}
          </View>
        );

      case 'Chat':
        return (
          <View>
            <View style={styles.chatContainer}>
              {messages.slice(0, 3).map((item, index) => (
                <RenderMessage item={item} key={index} />
              ))}
            </View>
            <Button
              onPress={() => {
                onClose?.();
                setTimeout(() => {
                  navigate('ChatDetails', {
                    details: chatData[0],
                  });
                }, 1000);
              }}
              title="View Chat History"
              width={'68%'}
              style={{
                alignSelf: 'center',
                position: 'absolute',
                bottom: normalize(10),
              }}
            />
          </View>
        );
    }
  };

  return (
    <View style={styles.modal}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={
            getInterpreterDetailsResponse?.client?.profile_image
              ? {
                  uri:
                    IMAGES_BUCKET_URL.profile_user +
                    getInterpreterDetailsResponse.client.profile_image,
                }
              : Icons.icon_user
          }
          style={styles.avatar}
          tintColor={
            getInterpreterDetailsResponse?.client?.profile_image === '' ||
            getInterpreterDetailsResponse?.client?.profile_image === null ||
            getInterpreterDetailsResponse?.client?.profile_image === undefined
              ? Colors.melrose
              : undefined
          }
        />

        <View>
          <Text style={styles.name}>
            {getInterpreterDetailsResponse?.client?.full_name}
          </Text>
          <Text style={styles.role}>Client</Text>
        </View>
        <TouchableOpacity style={styles.closeBtn}>
          {/* <Icon name="close" size={24} color="#333" /> */}
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {['Information', 'Shared Files', 'Chat'].map(tab => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab as TabType)}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
          >
            <Image
              source={
                tab === 'Chat'
                  ? Icons.chat
                  : tab === 'Information'
                  ? Icons.errorInfo
                  : Icons.folder
              }
              style={{
                height: normalize(15),
                width: normalize(15),
                tintColor: activeTab === tab ? Colors.white : Colors.dark_grey,
              }}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>{renderTabContent()}</ScrollView>
      <TouchableOpacity onPress={() => onClose?.()} style={styles.touch}>
        <Image source={Icons.close} style={styles.closeIcon} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    backgroundColor: '#fff',
    minHeight: normalize(300),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: normalize(15),
  },
  avatar: {
    width: normalize(42),
    height: normalize(42),
    borderRadius: normalize(8),
    marginRight: normalize(12),
  },
  name: {
    fontSize: normalize(13),
    fontFamily: Fonts.Inter_SemiBold,
    color: Colors.night_blue,
  },
  role: {
    fontSize: normalize(11),
    fontFamily: Fonts.Inter_Regular,
    color: Colors.dark_grey,
  },
  closeBtn: {
    marginLeft: 'auto',
  },
  tabRow: {
    flexDirection: 'row',
    marginVertical: normalize(5),
    justifyContent: 'space-between',
  },
  tab: {
    paddingVertical: normalize(7),
    paddingHorizontal: normalize(10),
    borderRadius: normalize(18),
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(5),
    borderWidth: normalize(1),
    borderColor: '#E8E8E8',
  },
  activeTab: {
    backgroundColor: Colors.purple,
    borderColor: Colors.purple,
  },
  tabText: {
    fontFamily: Fonts.Inter_Medium,
    color: Colors.dark_grey,
    fontSize: normalize(10),
  },
  activeTabText: {
    color: '#fff',
  },
  content: {
    marginTop: normalize(10),
  },
  touch: {
    position: 'absolute',
    top: normalize(-15),
    right: normalize(-10),
    padding: normalize(5),
    zIndex: 10,
  },
  closeIcon: {
    height: normalize(26),
    width: normalize(26),
    tintColor: '#1C1B1F',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  label: {
    fontFamily: Fonts.Inter_Regular,
    color: '#9EA0A4',
    fontSize: normalize(9),
  },
  value: {
    fontFamily: Fonts.Inter_MediumItalic,
    fontSize: normalize(11),
    color: Colors.night_blue,
    marginTop: normalize(3),
  },
  fileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: normalize(13),
    paddingHorizontal: normalize(15),
    backgroundColor: '#FFF4E9',
    borderRadius: normalize(8),
    marginVertical: normalize(5),
    justifyContent: 'space-between',
  },
  fileName: {
    fontFamily: Fonts.Inter_Medium,
    color: Colors.night_blue,
    fontSize: normalize(12),
  },
  fileSize: {
    fontFamily: Fonts.Inter_Regular,
    color: Colors.dark_grey,
    fontSize: normalize(10),
    marginTop: normalize(3),
  },
  chatContainer: {
    maxHeight: normalize(180),
    opacity: 0.3,
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
    marginRight: normalize(8),
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
    marginLeft: normalize(8),
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
    marginHorizontal: normalize(40),
  },
  noDataFound: {
    textAlign: 'center',
    fontFamily: Fonts.Inter_Medium,
    fontSize: normalize(12),
    color: Colors.gray,
  },
});

export default ClientDetails;

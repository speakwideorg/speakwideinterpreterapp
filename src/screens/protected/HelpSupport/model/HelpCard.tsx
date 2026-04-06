import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
} from 'react-native';
import React from 'react';
import { normalize } from '@app/utils/orientation';
import { Colors, Fonts } from '@app/themes';
import { formatDateTime } from '@app/utils/helpers';

type Ticket = {
  _id: string;
  date_initiated: string;
  dispute_id: string;
  title: string;
  subtitle: string;
  dispute_status: string;
  ticketId: string;
  issue_details: string;
  categories: Array<{
    title: string;
  }>;
};

const HelpCard = ({
  item,
  index,
  cardBackgrounds,
  badgeBackgrounds,
  textColor,
  onPress,
  width,
}: {
  item: Ticket;
  index: number;
  cardBackgrounds: string;
  badgeBackgrounds: string;
  textColor: string;
  onPress?: () => void;
  width?: () => number | string;
}) => {
  return (
    <TouchableOpacity
      onPress={() => {
        if (onPress) {
          onPress();
        }
      }}
      activeOpacity={0.7}
      style={[
        styles.ticketCard,
        {
          backgroundColor: cardBackgrounds,
          width: width ? width : normalize(207),
        },
      ]}
    >
      <View style={styles.disputeMainContainer}>
        <View style={styles.disputeContainer}>
          <Text style={[styles.ticketId, { color: textColor }]}>
            {item.dispute_id}
          </Text>

          <View style={styles.statusBadgeWrapper}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: badgeBackgrounds },
              ]}
            >
              <Text style={[styles.disputeStatusLabel, { color: textColor }]}>
                {item.dispute_status}
              </Text>
            </View>
          </View>
        </View>

        {/* Title */}
        {item?.categories?.map(itm => (
          <Text style={styles.ticketTitle}>{itm.title}</Text>
        ))}

        {/* Subtitle */}
        <Text style={styles.ticketSubtitle}>{item.issue_details}</Text>

        {/* Date */}
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={[styles.ticketDate, { color: textColor }]}>
            {formatDateTime(item?.date_initiated).formattedDate +
              ' ' +
              formatDateTime(item?.date_initiated).formattedTime}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default HelpCard;

const styles = StyleSheet.create({
  statusBadge: {
    paddingHorizontal: normalize(10),
    paddingVertical: normalize(3),
    borderRadius: normalize(12),
    marginBottom: normalize(5),
  },
  disputeMainContainer: { flex: 1, marginHorizontal: normalize(10) },
  disputeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: normalize(10),
  },
  disputeStatusLabel: {
    fontSize: normalize(11),
    fontWeight: '600',
    fontFamily: Fonts.Inter_Medium,
  },
  ticketCard: {
    width: normalize(207),
    height: normalize(150),
    borderRadius: normalize(10),
    marginRight: normalize(15),
    // borderWidth: normalize(1),
  },

  ticketId: {
    fontFamily: Fonts.Inter_Medium,
    fontSize: normalize(12),
    color: Colors.yellow,
  },

  statusBadgeWrapper: {
    alignItems: 'flex-end',
  },

  ticketTitle: {
    fontFamily: Fonts.Inter_SemiBold,
    fontSize: normalize(14),
    color: Colors.night_blue,
    marginTop: normalize(4),
  },
  ticketSubtitle: {
    fontFamily: Fonts.Inter_Regular,
    fontSize: normalize(12),
    color: Colors.dark_grey,
    marginTop: normalize(10),
  },
  ticketDate: {
    fontFamily: Fonts.Inter_Medium,
    fontSize: normalize(11),
    color: Colors.yellow,
    ...(Platform.OS === 'ios'
      ? { marginTop: normalize(34) }
      : { marginTop: normalize(0) }),
  },
});

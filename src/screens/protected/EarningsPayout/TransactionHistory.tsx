/* eslint-disable react-hooks/exhaustive-deps */
import React, { FC, memo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  Pressable,
  Linking,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors, Fonts, Icons, Images } from '@app/themes';
import { normalize } from '@app/utils/orientation';
import Header from '@app/components/common/Header';
import MyStatusBar from '@app/utils/helpers/MyStatusBar';
import { useAppDispatch, useAppSelector } from '@app/store';
import { useIsFocused } from '@react-navigation/native';
import {
  invoiceDetailsRequest,
  payoutDetailsRequest,
} from '@app/store/slice/payment.slice';
import { Props } from '@stripe/stripe-react-native';
import moment from 'moment';

const { width } = Dimensions.get('window');

type InfoRowProps = {
  label: string;
  value: string;
  icon: any;
  tintColor?: string;
  marginBottom?: number;
};

const InfoRow = memo(
  ({
    label,
    value,
    icon,
    tintColor,
    marginBottom = normalize(15),
  }: InfoRowProps) => (
    <View style={[styles.infoRowWrapper, { marginBottom }]}>
      <View>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
      <View style={styles.iconWrapper}>
        <Image
          source={icon}
          style={[styles.icon, tintColor ? { tintColor } : null]}
          resizeMode="contain"
        />
      </View>
    </View>
  ),
);

const TransactionHistory: FC<Props> = ({ route }) => {
  const { payoutId } = route?.params;

  const dispatch = useAppDispatch();
  const isFocused = useIsFocused();
  const {
    status: invoiceStatus,
    payoutDetailResponse,
    invoiceDetailResponse,
  } = useAppSelector(state => state.payment);

  console.log('invoiceDetailResponse', invoiceDetailResponse);

  useEffect(() => {
    if (isFocused && payoutId) {
      dispatch(
        payoutDetailsRequest({
          payout_id: payoutId,
        }),
      );
    }
  }, [isFocused]);

  useEffect(() => {
    if (invoiceStatus) {
      switch (invoiceStatus) {
        case 'payment/invoiceDetailsSuccess':
          if (invoiceDetailResponse?.invoice_url) {
            // Open the invoice URL in a web browser
            Linking.openURL(invoiceDetailResponse.invoice_url);
          }
          break;
        default:
          break;
      }
    }
  }, [invoiceStatus]);

  // Safe derived data
  const payout = payoutDetailResponse || {};

  const amount = payout?.payout_amount ?? 0;
  const status = payout?.status ?? '-';
  const paymentMethod = payout?.transaction_details?.raw?.source_type ?? '—';
  const payVia = paymentMethod === 'card' ? 'Credit Card' : paymentMethod;

  const date = payout?.payout_date
    ? moment(payout.payout_date).format('DD-MM-YYYY')
    : '-';

  const time = payout?.payout_date
    ? moment(payout.payout_date).format('hh:mm A')
    : '-';

  const clientName =
    payout?.sessionDetails?.[0]?.clientDetails?.full_name ?? '-';

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

      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.title}>
          Payout <Text style={styles.titleSemiBold}>Details</Text>
        </Text>

        <Pressable
          style={styles.downloadContainer}
          onPress={() =>
            dispatch(
              invoiceDetailsRequest({
                payout_details_id: payoutDetailResponse?._id,
              }),
            )
          }
        >
          <Image source={Icons.download} style={styles.download} />
        </Pressable>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.paymentMethodCard}>
          <Image
            source={Images.circle_shape}
            style={styles.backImg}
            resizeMode="contain"
          />

          <View style={styles.paymentCard}>
            {/* Gradient icon */}
            <LinearGradient
              useAngle
              angle={180}
              colors={['#7426F5', '#E4D4FF']}
              style={styles.gradient}
            >
              <Image
                source={Icons.arrow_right}
                style={styles.arrowRight}
                tintColor={Colors.white}
              />
            </LinearGradient>

            {/* Payment Info */}
            <Text style={styles.paymentMethodText}>
              Paid via <Text style={styles.paymentMethodBold}>{payVia}</Text>
            </Text>

            <Text style={styles.amount}>${amount?.toFixed(2)}</Text>

            {/* Dynamic Details */}
            <View style={styles.infoCard}>
              <View style={styles.infoBox}>
                <InfoRow
                  label="Client"
                  value={clientName}
                  icon={Icons.contacts_product}
                />

                <InfoRow label="Status" value={status} icon={Icons.wallet} />

                <InfoRow
                  label="Payment Method"
                  value={`${payVia}`}
                  icon={Icons.crdcart}
                />

                <InfoRow label="Date" value={date} icon={Icons.calendar} />

                <InfoRow
                  label="Time"
                  value={time}
                  icon={Icons.schedule}
                  tintColor={Colors.purple}
                  marginBottom={normalize(5)}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Sessions List */}
        {payout?.sessionDetails?.length > 0 && (
          <View style={styles.sessionsContainer}>
            <Text style={styles.sectionHeader}>Sessions Included</Text>

            {payout.sessionDetails.map((item: any) => (
              <View key={item._id} style={styles.sessionCard}>
                <Text style={styles.sessionTitle}>
                  {item.session_ref_number}
                </Text>

                <Text style={styles.sessionLang}>
                  {item.language_one?.language_display_name} →{' '}
                  {item.language_two?.language_display_name}
                </Text>

                <Text style={styles.sessionDate}>
                  {moment(item.start_date_time).format('DD MMM YYYY, hh:mm A')}
                </Text>

                <Text style={styles.sessionPrice}>
                  ${item.price?.toFixed(2)}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default memo(TransactionHistory);

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
  backImg: {
    width: '100%',
    position: 'absolute',
    top: normalize(-160),
    left: normalize(-25),
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: normalize(15),
    marginTop: normalize(20),
    marginBottom: normalize(15),
  },
  title: {
    fontFamily: Fonts.Manrope_Regular,
    color: Colors.night_blue,
    fontSize: normalize(20),
  },
  titleSemiBold: {
    fontFamily: Fonts.Manrope_SemiBold,
  },
  downloadContainer: {
    backgroundColor: Colors.white,
    width: normalize(28),
    height: normalize(28),
    borderRadius: normalize(28),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#C5C4E3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 2.13,
    elevation: 4,
  },
  download: {
    width: normalize(18),
    height: normalize(18),
    resizeMode: 'contain',
  },
  content: {
    flex: 1,
    paddingHorizontal: normalize(15),
  },
  scrollContent: {
    paddingBottom: normalize(30),
  },
  paymentMethodCard: {
    backgroundColor: Colors.white,
    borderRadius: normalize(12),
    borderColor: Colors.blue_chalk,
    borderWidth: 1,
    marginBottom: normalize(20),
  },
  paymentCard: {
    padding: normalize(20),
    alignItems: 'center',
  },
  gradient: {
    width: normalize(70),
    height: normalize(70),
    borderRadius: normalize(35),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: normalize(20),
  },
  arrowRight: {
    width: normalize(90),
    height: normalize(40),
    resizeMode: 'contain',
    transform: [{ rotate: '90deg' }],
  },
  paymentMethodText: {
    fontFamily: Fonts.Inter_Regular,
    color: Colors.night_blue,
    fontSize: normalize(12),
    marginBottom: normalize(10),
  },
  paymentMethodBold: {
    fontFamily: Fonts.Inter_SemiBold,
  },
  amount: {
    fontFamily: Fonts.Inter_SemiBold,
    fontSize: normalize(24),
    color: Colors.night_blue,
  },
  infoCard: {
    marginTop: normalize(15),
    width: '100%',
  },
  infoBox: {
    backgroundColor: Colors.magnolia,
    borderRadius: normalize(10),
    paddingHorizontal: normalize(15),
    paddingVertical: normalize(19),
    width: normalize(260),
    alignSelf: 'center',
  },
  infoRowWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoLabel: {
    fontFamily: Fonts.Inter_Regular,
    fontSize: normalize(10),
    color: Colors.dark_grey,
  },
  infoValue: {
    fontFamily: Fonts.Inter_Medium,
    fontSize: normalize(13),
    color: Colors.night_blue,
    marginTop: normalize(3),
  },
  iconWrapper: {
    width: normalize(30),
    height: normalize(30),
    borderRadius: normalize(30),
    backgroundColor: '#F3ECFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: normalize(16),
    height: normalize(16),
    tintColor: Colors.purple,
  },
  sessionsContainer: {
    marginTop: normalize(15),
    marginHorizontal: normalize(5),
  },
  sectionHeader: {
    fontFamily: Fonts.Inter_SemiBold,
    fontSize: normalize(16),
    marginBottom: normalize(10),
    color: Colors.night_blue,
  },
  sessionCard: {
    backgroundColor: Colors.white,
    padding: normalize(15),
    borderRadius: normalize(10),
    marginBottom: normalize(10),
    borderWidth: 1,
    borderColor: Colors.blue_chalk,
  },
  sessionTitle: {
    fontFamily: Fonts.Inter_SemiBold,
    fontSize: normalize(14),
  },
  sessionLang: {
    fontFamily: Fonts.Inter_Regular,
    fontSize: normalize(12),
    marginTop: normalize(5),
  },
  sessionDate: {
    fontFamily: Fonts.Inter_Regular,
    fontSize: normalize(11),
    marginTop: normalize(5),
    color: Colors.dark_grey,
  },
  sessionPrice: {
    marginTop: normalize(5),
    fontFamily: Fonts.Inter_SemiBold,
    fontSize: normalize(14),
    color: Colors.night_blue,
  },
});

import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Linking,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import MyStatusBar from '@app/utils/helpers/MyStatusBar';
import { Colors, Fonts, Icons, Images } from '@app/themes';
import { normalize } from '@app/utils/orientation';
import { isIos } from '@app/utils/helpers/Validation';
import Picker from '@app/components/common/Picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import Css from '@app/themes/Css';
import SubscriptionPlanItem from './SubscriptionPlanItem';
import { SubscriptionRatesTable } from './SubscriptionRatesTable';
import { useAppDispatch, useAppSelector } from '@app/store';
import { useIsFocused } from '@react-navigation/native';
import { subscriptionListRequest } from '@app/store/slice/default.slice';
import { navigate } from '@app/navigation/RootNaivgation';

const SubscriptionSetUp = () => {
  const isFocused = useIsFocused();
  const dispatch = useAppDispatch();
  const subscriptionList = useAppSelector(
    state => state.default.subscriptionListResponse,
  );

  useEffect(() => {
    if (isFocused) {
      dispatch(subscriptionListRequest({}));
    }
  }, [dispatch, isFocused]);

  const [visible, setVisible] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <Image source={Images.shape} style={styles.shape} />
      {isIos() && (
        <MyStatusBar
          backgroundColor={'transparent'}
          barStyle={'dark-content'}
          translucent
        />
      )}
      <ScrollView
        style={Css.f1}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: normalize(40),
        }}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Subscriptions</Text>
          <Text style={styles.subTitle}>
            Choose the plan that's right for you
          </Text>
        </View>

        <View style={[Css.asc, Css.mt9]}>
          {subscriptionList && subscriptionList?.length > 0
            ? subscriptionList?.map((item: any, index: number) => {
                return (
                  <SubscriptionPlanItem
                    index={index}
                    item={item}
                    key={index}
                    marginRight={0}
                    marginBottom={normalize(12)}
                  />
                );
              })
            : null}
        </View>

        <TouchableOpacity onPress={() => setVisible(true)} style={styles.v1}>
          <Text style={styles.rates}>View Session Rates</Text>
          <Image source={Icons.arrow_forward} style={styles.forward} />
        </TouchableOpacity>

        <Pressable
          style={styles.v2}
          onPress={() =>
            Linking.openURL('https://speakwide.com/subscription-tc/')
          }
        >
          <Text style={styles.terms}>Terms & Conditions</Text>
        </Pressable>
      </ScrollView>

      <Picker visible={visible} onClose={() => setVisible(false)}>
        <SubscriptionRatesTable />
      </Picker>
      <TouchableOpacity
        style={styles.skipContainer}
        onPress={() => navigate('AddBankAccount')}
      >
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default SubscriptionSetUp;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  shape: {
    height: normalize(180),
    width: '100%',
    resizeMode: 'contain',
    position: 'absolute',
    top: 0,
  },
  header: {
    paddingHorizontal: normalize(18),
    paddingTop: normalize(isIos() ? 12 : 20),
  },
  title: {
    fontFamily: Fonts.Manrope_Bold,
    color: Colors.night_blue,
    fontSize: normalize(20),
  },
  subTitle: {
    fontFamily: Fonts.Inter_Regular,
    color: Colors.dark_grey,
    fontSize: normalize(12),
    marginTop: normalize(6),
  },
  v1: {
    marginHorizontal: normalize(18),
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: normalize(8),
    alignSelf: 'flex-start',
    marginTop: normalize(5),
  },
  rates: {
    color: Colors.night_blue,
    fontFamily: Fonts.Inter_Regular,
    fontSize: normalize(12),
  },
  forward: {
    height: normalize(15),
    width: normalize(15),
    marginLeft: normalize(3),
  },
  v2: {
    marginHorizontal: normalize(18),
    backgroundColor: Colors.water,
    padding: normalize(12),
    borderRadius: normalize(10),
    marginTop: normalize(12),
  },
  terms: {
    color: Colors.purple,
    fontFamily: Fonts.Inter_Medium,
    fontSize: normalize(12),
  },
  con: {
    color: Colors.dark_grey,
    fontFamily: Fonts.Inter_Regular,
    fontSize: normalize(11),
    marginTop: normalize(6),
    lineHeight: normalize(16),
  },
  skipContainer: {
    marginTop: normalize(15),
    // marginBottom: normalize(10),
    alignSelf: 'center',
    // backgroundColor: Colors.yellow,
  },
  skipText: {
    fontFamily: Fonts.Inter_SemiBold,
    fontSize: normalize(14),
    color: Colors.night_blue,
    textDecorationLine: 'underline',
  },
});

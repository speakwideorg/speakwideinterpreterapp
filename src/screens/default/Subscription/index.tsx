import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Linking,
} from 'react-native';
import React, { useCallback, useState } from 'react';
import MyStatusBar from '@app/utils/helpers/MyStatusBar';
import { Colors, Fonts, Icons, Images } from '@app/themes';
import { normalize } from '@app/utils/orientation';
import { isIos } from '@app/utils/helpers/Validation';
import { SubscriptionPlans } from '@app/utils/constants';
import { SubscriptionPlan } from '@app/types';
import { FlatList } from 'react-native-gesture-handler';
import PlanItem from './model/PlanItem';
import Picker from '@app/components/common/Picker';
import { RatesTable } from './model/RatesTable';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('screen');

const Subscription = () => {
  const [visible, setVisible] = useState(false);

  const renderSubscriptionPlans = useCallback(
    ({ item, index }: { item: SubscriptionPlan; index: number }) => {
      return (
        <PlanItem
          index={index}
          item={item}
          key={index}
          isLastIndex={SubscriptionPlans.length === index + 1}
        />
      );
    },
    [SubscriptionPlans],
  );

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
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: normalize(40),
        }}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Subscriptions</Text>
          <Text style={styles.subTitle}>
            Choose the plan that’s right for you
          </Text>
        </View>

        <View
          style={{
            alignSelf: 'center',
            marginTop: normalize(isIos() ? 18 : 18),
          }}
        >
          {SubscriptionPlans.map((item, index) => {
            return (
              <PlanItem
                index={index}
                item={item}
                key={index}
                isLastIndex={SubscriptionPlans.length === index + 1}
                marginRight={0}
                marginBottom={normalize(12)}
              />
            );
          })}
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
        <RatesTable />
      </Picker>
    </SafeAreaView>
  );
};

export default Subscription;

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
});

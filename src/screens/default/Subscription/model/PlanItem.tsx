import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageBackground,
  Dimensions,
} from 'react-native';
import React, { FC } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { Colors, Fonts, Icons, Images } from '@app/themes';
import { normalize } from '@app/utils/orientation';
import Button from '@app/components/common/Button';
import { SubscriptionPlan } from '@app/types';
import { navigate } from '@app/navigation/RootNaivgation';

const { width } = Dimensions.get('screen');

type PlanItemProps = {
  item: SubscriptionPlan;
  index: number;
  isLastIndex?: boolean;
  isHideButton?: boolean;
  marginRight?: number;
  marginBottom?: number;
  isShowPopular?: boolean;
};

const PlanItem: FC<PlanItemProps> = ({
  item,
  index,
  isLastIndex,
  isHideButton = false,
  marginRight = normalize(6),
  marginBottom = 0,
  isShowPopular = false,
}) => {
  return (
    <View key={index} style={[styles.card, { marginRight,marginBottom }]}>
      <LinearGradient
        useAngle={true}
        angle={160}
        colors={['#90A9FF', '#8142E9']}
        style={[styles.linear]}
      >
        <Image source={Images.vector} style={styles.vector} />
        {item.type === 'Bronze' && isShowPopular && (
          <View style={styles.v2}>
            <Image source={Icons.star} style={styles.star} />
            <Text style={styles.txt2}>POPULAR</Text>
          </View>
        )}
        <View style={{ padding: normalize(12), flex: 1 ,paddingBottom: normalize(30),}}>
          {item.price ? (
            <Text style={styles.price}>
              {`${item.price}`}
              {<Text style={styles.plan}>/{item.plan}</Text>}
            </Text>
          ) : (
            <Text style={styles.price}>{item.plan}</Text>
          )}
          {item?.trial && <Text style={styles.trail}>{item.trial}</Text>}
          <ImageBackground source={Images.shapebox} style={styles.shape}>
            <Text style={styles.type}>{item.type} Monthly Plan</Text>
          </ImageBackground>

          <Text style={styles.txt}>This plan gets</Text>

          <View style={styles.plansContainer}>
            {item.plans.map((_item, _index) => (
              <View key={_index} style={styles.itemView}>
                <View
                  style={[
                    styles.imageView,
                    {
                      backgroundColor: _item.status
                        ? Colors.blue_chalk
                        : Colors.pearl,
                    },
                  ]}
                >
                  <Image
                    source={_item.status ? Icons.check : Icons.close}
                    style={{
                      height: normalize(_item.status ? 8 : 16),
                      width: normalize(_item.status ? 8 : 16),
                    }}
                    tintColor={_item.status ? Colors.purple : Colors.orange}
                  />
                </View>
                <Text style={styles.fetures}>
                  {_item.title}
                  {_item.subTitle ? (
                    <Text
                      style={{ color: Colors.dark_grey }}
                    >{` ${_item.subTitle}`}</Text>
                  ) : (
                    ''
                  )}
                  {_item.value && `: ${_item.value}`}
                </Text>
              </View>
            ))}
          </View>

          {!isHideButton && (
            <Button
              onPress={() =>
                navigate('SubscriptionPlanDetails', {
                  plan: item,
                  type: 'Select',
                })
              }
              title={'Choose Plan'}
              fontFamily={Fonts.Inter_Medium}
              width={'100%'}
              colors={[Colors.snow, Colors.snow]}
              marginTop={normalize(16)}
              borderColor={Colors.white}
              textColor={Colors.night_blue}
            />
          )}
        </View>
      </LinearGradient>
    </View>
  );
};

export default PlanItem;

const styles = StyleSheet.create({
  vector: {
    height: normalize(300),
    width: normalize(300),
    resizeMode: 'contain',
    position: 'absolute',
    top: normalize(-35),
    right: 0,
  },
  card: {
    borderRadius: normalize(12),
    overflow: 'hidden',
    width: width - normalize(30),
  },
  linear: {
    borderRadius: normalize(12),
    width: '100%',
    overflow: 'hidden',
  },
  price: {
    fontFamily: Fonts.Manrope_SemiBold,
    color: Colors.white,
    fontSize: normalize(28),
  },
  plan: {
    fontFamily: Fonts.Manrope_Regular,
    color: Colors.white,
    fontSize: normalize(12),
  },
  trail: {
    fontFamily: Fonts.Inter_Medium,
    color: Colors.water,
    fontSize: normalize(11),
  },
  shape: {
    borderRadius: normalize(30),
    overflow: 'hidden',
    paddingVertical: normalize(6),
    paddingHorizontal: normalize(12),
    alignSelf: 'flex-start',
    marginTop: normalize(5),
  },
  type: {
    color: Colors.white,
    fontFamily: Fonts.Manrope_SemiBold,
    fontSize: normalize(12),
  },
  txt: {
    color: Colors.white,
    fontFamily: Fonts.Inter_Medium,
    fontSize: normalize(11),
    marginTop: normalize(12),
  },
  plansContainer: {
    backgroundColor: Colors.white,
    borderRadius: normalize(15),
    padding: normalize(13),
    gap: normalize(14),
    marginTop: normalize(10),
  },
  itemView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageView: {
    height: normalize(18),
    width: normalize(18),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: normalize(30),
    marginRight: normalize(8),
  },
  fetures: {
    fontFamily: Fonts.Inter_Regular,
    color: Colors.night_blue,
    fontSize: normalize(11),
  },
  v2: {
    height: normalize(26),
    width: normalize(85),
    backgroundColor: Colors.white,
    borderRadius: normalize(30),
    position: 'absolute',
    right: normalize(25),
    top: normalize(30),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: normalize(10),
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  star: {
    height: normalize(13),
    width: normalize(13),
  },
  txt2: {
    fontFamily: Fonts.Manrope_SemiBold,
    color: Colors.purple,
    fontSize: normalize(10),
  },
});

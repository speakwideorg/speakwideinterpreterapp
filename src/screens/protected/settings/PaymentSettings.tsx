/* eslint-disable react-hooks/exhaustive-deps */
import React, { use, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  Linking,
  ImageBackground,
} from 'react-native';
import MyStatusBar from '@app/utils/helpers/MyStatusBar';
import { Colors, Fonts, Icons, Images } from '@app/themes';
import Header from '@app/components/common/Header';
import { normalize } from '@app/utils/orientation';
import { isIos } from '@app/utils/helpers/Validation';
import { hexToRGB } from '@app/utils/helpers';
import { useAppDispatch, useAppSelector } from '@app/store';
import { useIsFocused } from '@react-navigation/native';
import useIsAppForeground from '@app/utils/hooks/useAppForeground';
import {
  addBankAccountRequest,
  bankAccountListRequest,
  cardListRequest,
  deleteCardRequest,
  resetUserDefaults,
} from '@app/store/slice/user.slice';
import Loader from '@app/utils/helpers/Loader';
import Button from '@app/components/common/Button';
import AlertModal from '@app/components/common/AlertModal';
import Carousel, {
  ICarouselInstance,
  Pagination,
} from 'react-native-reanimated-carousel';
import { useSharedValue } from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import AddNewCard from './model/AddNewCard';
import Css from '@app/themes/Css';
import KeyboardAvoidingTemplate from '@app/components/template/KeyboardAvoidingTemplate';
import { taxEligibilityRequest } from '@app/store/slice/payment.slice';

const { width } = Dimensions.get('window');

type CardProps = {
  icon: any;
  label: string;
  borderBottomWidth?: number;
  onPress?: () => void;
  isPrimary?: boolean;
};

const RenderCard = ({
  icon,
  label,
  borderBottomWidth,
  isPrimary = false,
  onPress = () => {},
}: CardProps) => (
  <TouchableOpacity
    activeOpacity={0.8}
    style={[styles.card, { borderBottomWidth }]}
    onPress={onPress}
  >
    <View style={styles.cardContent}>
      <View style={styles.bankLogoWrapper}>
        <Image source={icon} style={styles.icon} />
      </View>
      <View>
        <Text style={styles.cardText}>{label}</Text>
        {isPrimary && (
          <View style={styles.primaryTag}>
            <Text style={styles.primaryText}>Primary</Text>
          </View>
        )}
      </View>
    </View>
  </TouchableOpacity>
);

const PaymentSettings = () => {
  const ref = useRef<ICarouselInstance>(null);
  const progress = useSharedValue<number>(0);
  const dispatch = useAppDispatch();
  const isFocused = useIsFocused();
  const isForeground = useIsAppForeground();
  const {
    status,
    isLoading,
    addBankAccountResponse,
    bankAccountListResponse,
    cardListsResponse,
  } = useAppSelector(state => state.user);
  const { taxEligibilityResponse } = useAppSelector(state => state.payment);
  console.log('taxEligibilityResponse', taxEligibilityResponse);

  useEffect(() => {
    if (isForeground && isFocused) {
      dispatch(bankAccountListRequest({}));
    }
  }, [isForeground]);

  useEffect(() => {
    if (isFocused) {
      dispatch(taxEligibilityRequest({}));
    }
  }, [isFocused]);

  const [isAddCard, setIsAddCard] = useState(false);
  const [isDeleteModal, setIsDeleteModal] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string>('');

  const Cards = useMemo(() => {
    const list = cardListsResponse || [];
    return list.map((item: any) => ({
      id: item.id,
      name: item.billing_details?.name || 'Unknown',
      number: `**** **** **** ${item.card?.last4}`,
      valid: `${item.card?.exp_month?.toString().padStart(2, '0')}/${String(
        item.card?.exp_year,
      ).slice(-2)}`,
      brand: item.card?.brand,
      isDefault: item?.isDefault,
    }));
  }, [cardListsResponse]);

  const onPressPagination = (index: number) => {
    ref.current?.scrollTo({
      count: index - progress.value,
      animated: true,
    });
  };

  useEffect(() => {
    switch (status) {
      case 'user/addBankAccountSuccess': {
        dispatch(resetUserDefaults());
        Linking.openURL(addBankAccountResponse.link);
        break;
      }
      case 'user/addBankAccountFailure': {
        dispatch(resetUserDefaults());
        break;
      }
      case 'user/bankAccountListSuccess': {
        dispatch(resetUserDefaults());
        break;
      }
      case 'user/bankAccountListFailure': {
        dispatch(resetUserDefaults());
        break;
      }
      case 'user/updateBankStatusSuccess': {
        dispatch(resetUserDefaults());
        break;
      }
      case 'user/updateBankStatusFailure': {
        dispatch(resetUserDefaults());
        break;
      }
      case 'user/deleteCardSuccess': {
        dispatch(resetUserDefaults());
        setIsDeleteModal(false);
        setSelectedCardId('');
        dispatch(cardListRequest({}));
        break;
      }
      case 'user/deleteCardFailure': {
        dispatch(resetUserDefaults());
        break;
      }
    }
  }, [status, isFocused, dispatch]);

  const handleManageBankAccount = () => {
    dispatch(addBankAccountRequest({}));
  };

  console.log('cards ==>', Cards);

  return (
    <KeyboardAvoidingTemplate
      contentContainerStyle={styles.container}
      loaderEnable={isLoading}
    >
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
        <Loader visible={isLoading} />
        <Text style={styles.title}>
          Payment <Text style={styles.subTitle}>Settings</Text>
        </Text>

        <View style={styles.contentWrapper}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Saved Cards</Text>
            <TouchableOpacity
              onPress={() => setIsAddCard(true)}
              style={styles.addBtn}
            >
              <Text style={styles.addBtnText}>Add new Card</Text>
              <Image source={Icons.double_arrow_right} style={styles.addIcon} />
            </TouchableOpacity>
          </View>

          {Cards.length === 0 ? (
            <View style={styles.noCardView}>
              <Text style={styles.noCardText}>No saved cards yet</Text>
            </View>
          ) : (
            <>
              <Carousel
                ref={ref}
                width={width}
                height={normalize(160)}
                data={Cards}
                mode="parallax"
                modeConfig={{
                  parallaxScrollingScale: 0.9,
                  parallaxScrollingOffset: 50,
                }}
                onProgressChange={progress}
                renderItem={({ item }: any) => (
                  <LinearGradient
                    useAngle
                    angle={90}
                    colors={['#5297FE', '#8142E9']}
                    style={styles.cardGradient}
                  >
                    <ImageBackground
                      source={Images.card_overlay}
                      style={styles.cardOverlay}
                    >
                      <View style={styles.cardHeader}>
                        <Image
                          source={
                            item.brand === 'visa'
                              ? Icons.visa_transparent
                              : Icons.visa_transparent
                          }
                          style={styles.visaIcon}
                        />
                        {item.isDefault && (
                          <View
                            style={{
                              backgroundColor: Colors.white,
                              borderRadius: normalize(10),
                              paddingHorizontal: normalize(5),
                              paddingVertical: normalize(3),
                            }}
                          >
                            <Text style={{ color: Colors.purple }}>
                              Default
                            </Text>
                          </View>
                        )}
                        <TouchableOpacity
                          style={styles.deleteBtn}
                          onPress={() => {
                            setSelectedCardId(item.id);
                            setIsDeleteModal(true);
                          }}
                        >
                          <Image
                            source={Icons.delete}
                            style={styles.deleteIcon}
                          />
                        </TouchableOpacity>
                      </View>

                      <Text style={styles.cardNumber}>
                        <Text style={{ marginBottom: normalize(10) }}>
                          {item.number}
                        </Text>
                      </Text>

                      <View style={styles.cardDetails}>
                        <View style={Css.f_07}>
                          <Text style={styles.detailLabel}>
                            Cardholder name
                          </Text>
                          <Text style={styles.detailValue}>{item.name}</Text>
                        </View>
                        <View style={Css.f_03}>
                          <Text style={styles.detailLabel}>Valid Till</Text>
                          <Text style={styles.detailValue}>{item.valid}</Text>
                        </View>
                      </View>
                    </ImageBackground>
                  </LinearGradient>
                )}
                loop={false}
              />

              {/* Pagination */}
              <Pagination.Custom
                progress={progress}
                data={Cards}
                size={normalize(6)}
                containerStyle={styles.pagination}
                onPress={onPressPagination}
                dotStyle={styles.dot}
                activeDotStyle={styles.activeDot}
              />
            </>
          )}
        </View>

        <View style={styles.contentWrapper}>
          <Text style={styles.sectionTitle}>Bank Accounts</Text>

          <View style={styles.v1}>
            <Image
              source={Images.backgroundHeader}
              style={styles.backgroundHeader}
            />
            {bankAccountListResponse?.length ? (
              bankAccountListResponse?.map((card: any, index: number) => {
                return (
                  <RenderCard
                    icon={Icons.icon_payment_card}
                    label={card?.bank_name + ' - ' + card?.last4}
                    borderBottomWidth={normalize(
                      index === bankAccountListResponse.length - 1 ? 0 : 1,
                    )}
                    isPrimary={card?.isPrimary}
                  />
                );
              })
            ) : (
              <Text style={styles.no_bank_account_text}>No Bank Account</Text>
            )}
          </View>

          <TouchableOpacity
            onPress={() => handleManageBankAccount()}
            style={styles.linkContainer}
          >
            <Text style={styles.linkText}>Manage Bank Account</Text>
          </TouchableOpacity>

          <Text
            style={[
              styles.taxEligibilityNote,
              {
                color: taxEligibilityResponse?.w9Completed
                  ? Colors.purple
                  : Colors.red,
              },
            ]}
          >
            {taxEligibilityResponse?.note}
          </Text>
        </View>
      </View>
      {isAddCard && (
        <AlertModal
          visible={isAddCard}
          onClose={() => setIsAddCard(false)}
          padding={0}
          colors={[Colors.white, Colors.white]}
        >
          <AddNewCard
            onCancel={() => setIsAddCard(false)}
            onConfirm={() => setIsAddCard(false)}
          />
        </AlertModal>
      )}

      {isDeleteModal && (
        <AlertModal
          visible={isDeleteModal}
          onClose={() => setIsDeleteModal(false)}
          padding={0}
        >
          <View style={styles.container}>
            <View style={styles.main}>
              <Image source={Images.bank} style={styles.icon} />
              <Text style={styles.modalTitle}>
                {'Are You Sure You Want \n to Delete this card?'}
              </Text>
            </View>

            <View style={styles.btnRow}>
              <Button
                onPress={() => {
                  setIsDeleteModal(false);
                  setSelectedCardId('');
                }}
                title="No"
                width="100%"
                marginTop={10}
                colors={[Colors.snow_drift, Colors.snow_drift]}
                textColor={Colors.purple}
                elevation={0}
                shadowOpacity={0}
                borderColor="#D0B3FF"
              />
              <Button
                onPress={() =>
                  dispatch(deleteCardRequest({ cardId: selectedCardId }))
                }
                isLoading={isLoading}
                title="Yes, Delete"
                width="100%"
                marginTop={10}
              />
            </View>
          </View>
        </AlertModal>
      )}
    </KeyboardAvoidingTemplate>
  );
};

export default PaymentSettings;

const styles = StyleSheet.create({
  container: { paddingBottom: normalize(45) },
  topShape: { height: normalize(340), width, position: 'absolute', top: 0 },
  title: {
    fontFamily: Fonts.Manrope_SemiBold,
    color: Colors.night_blue,
    fontSize: normalize(20),
    marginLeft: normalize(15),
    marginTop: normalize(10),
  },
  subTitle: { fontFamily: Fonts.Manrope_Regular },
  contentWrapper: {
    marginTop: normalize(5),
    borderTopLeftRadius: normalize(30),
    borderTopRightRadius: normalize(30),
    paddingTop: normalize(15),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: normalize(15),
    marginBottom: normalize(5),
  },
  sectionTitle: {
    fontFamily: Fonts.Inter_Medium,
    color: Colors.night_blue,
    fontSize: normalize(13),
    marginLeft: normalize(15),
  },
  v1: {
    marginHorizontal: normalize(15),
    backgroundColor: Colors.white,
    borderRadius: normalize(17),
    shadowColor: hexToRGB(Colors.dark_grey, isIos() ? 1 : 0.3),
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    paddingVertical: normalize(5),
    marginTop: normalize(12),
    marginBottom: normalize(30),
  },
  backgroundHeader: {
    width: '100%',
    height: normalize(50),
    resizeMode: 'contain',
    top: -8,
    position: 'absolute',
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: normalize(15),
    paddingVertical: normalize(10),
    borderColor: '#E8E8E8',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(10),
  },
  cardText: {
    fontSize: normalize(12),
    color: Colors.night_blue,
    fontFamily: Fonts.Inter_Medium,
  },
  bankLogoWrapper: {
    borderColor: '#F3F3F3',
    borderWidth: normalize(1),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    height: normalize(35),
    width: normalize(50),
    borderRadius: normalize(5),
  },
  primaryTag: {
    backgroundColor: Colors.teal_blue,
    alignSelf: 'flex-start',
    paddingHorizontal: normalize(6),
    paddingVertical: normalize(1),
    borderRadius: normalize(30),
    marginTop: normalize(5),
  },
  primaryText: {
    color: Colors.white,
    fontFamily: Fonts.Inter_Medium,
    fontSize: normalize(6),
  },
  icon: { height: normalize(20), width: normalize(35), resizeMode: 'cover' },
  arrow: {
    height: normalize(10),
    width: normalize(10),
    resizeMode: 'contain',
    transform: [{ rotate: '-90deg' }],
  },
  updateBtn: { alignSelf: 'center' },
  linkContainer: {
    height: normalize(45),
    width: '90%',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: normalize(1),
    borderColor: '#9EA0A4',
    borderStyle: 'dashed',
    borderRadius: normalize(8),
    alignSelf: 'center',
    // marginTop: normalize(30),
  },
  linkText: {
    fontFamily: Fonts.Manrope_Medium,
    color: '#9EA0A4',
    fontSize: normalize(12),
  },
  no_bank_account_text: {
    width: '100%',
    textAlign: 'center',
    fontFamily: Fonts.DMSans_Bold,
    fontSize: normalize(12),
    color: Colors.black,
    marginTop: normalize(15),
    marginBottom: normalize(10),
  },
  addBtn: { flexDirection: 'row', alignItems: 'center' },
  addBtnText: {
    fontFamily: Fonts.Inter_Medium,
    color: Colors.purple,
    fontSize: normalize(11),
  },
  addIcon: {
    height: normalize(17),
    width: normalize(17),
    resizeMode: 'contain',
    right: -3,
  },
  cardGradient: { flex: 1, borderRadius: normalize(12), overflow: 'hidden' },
  cardOverlay: { height: '100%', width: '100%' },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  visaIcon: {
    height: normalize(50),
    width: normalize(80),
    resizeMode: 'contain',
    margin: normalize(5),
  },
  deleteBtn: {
    height: normalize(30),
    width: normalize(30),
    backgroundColor: Colors.white,
    borderRadius: normalize(8),
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: normalize(15),
  },
  deleteIcon: { height: normalize(18), width: normalize(18) },
  cardNumber: {
    fontFamily: Fonts.DMSans_Bold,
    fontSize: normalize(15),
    color: Colors.white,
    letterSpacing: normalize(2),
    marginTop: normalize(15),
    marginLeft: normalize(18),
  },
  cardDetails: {
    marginHorizontal: normalize(18),
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: normalize(10),
  },
  detailLabel: {
    fontFamily: Fonts.Inter_Regular,
    color: Colors.white,
    fontSize: normalize(10),
    textTransform: 'uppercase',
  },
  detailValue: {
    fontFamily: Fonts.Inter_SemiBold,
    color: Colors.white,
    fontSize: normalize(12),
    textTransform: 'uppercase',
  },
  pagination: { gap: 5, marginTop: normalize(8) },
  dot: { borderRadius: normalize(8), backgroundColor: '#E8E8E8' },
  activeDot: {
    borderRadius: normalize(8),
    width: normalize(20),
    height: normalize(6),
    backgroundColor: Colors.night_blue,
  },
  noCardView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: normalize(40),
    paddingHorizontal: normalize(20),
    backgroundColor: '#FFFFFF',
  },
  noCardText: {
    fontSize: normalize(16),
    color: '#999999',
    textAlign: 'center',
    fontFamily: Fonts.DMSans_SemiBold,
  },
  main: {
    alignItems: 'center',
    paddingTop: normalize(16),
    paddingHorizontal: normalize(16),
  },
  btnRow: {
    // flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.snow_drift,
    paddingVertical: normalize(16),
    paddingHorizontal: normalize(12),
    width: '100%',
    borderBottomLeftRadius: normalize(20),
    borderBottomRightRadius: normalize(20),
  },
  modalTitle: {
    fontFamily: Fonts.Manrope_SemiBold,
    color: Colors.night_blue,
    fontSize: normalize(16),
    textAlign: 'center',
    marginTop: normalize(10),
  },
  taxEligibilityNote: {
    fontFamily: Fonts.Inter_Regular,
    color: Colors.purple,
    fontSize: normalize(10),
    textAlign: 'center',
    marginTop: normalize(10),
    marginHorizontal: normalize(20),
  },
});

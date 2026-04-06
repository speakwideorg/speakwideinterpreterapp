import React, { useState, memo } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import KeyboardAvoidingTemplate from '@app/components/template/KeyboardAvoidingTemplate';
import { Colors, Fonts, Icons, Images } from '@app/themes';
import MyStatusBar from '@app/utils/helpers/MyStatusBar';
import { normalize } from '@app/utils/orientation';
import { isIos } from '@app/utils/helpers/Validation';
import Header from '@app/components/common/Header';
import { hexToRGB } from '@app/utils/helpers';
import { navigate } from '@app/navigation/RootNaivgation';
import { SubscriptionPlans } from '@app/utils/constants';
import AlertModal from '@app/components/common/AlertModal';
import ChangePassword from './model/ChangePassword';
import { useAppDispatch } from '@app/store';
import Picker from '@app/components/common/Picker';
import Button from '@app/components/common/Button';
import { deleteAccountRequest } from '@app/store/slice/auth.slice';

type CardProps = {
  icon: any;
  label: string;
  borderBottom?: boolean;
  onPress?: () => void;
};

const RenderCard = memo(({ icon, label, borderBottom, onPress }: CardProps) => (
  <TouchableOpacity
    activeOpacity={0.8}
    style={[styles.card, borderBottom && styles.cardBorder]}
    onPress={onPress}
  >
    <View style={styles.cardContent}>
      <Image source={icon} style={styles.icon} tintColor={Colors.night_blue} />
      <Text style={styles.cardText}>{label}</Text>
    </View>
    <Image source={Icons.arrow_drop_down} style={styles.arrow} />
  </TouchableOpacity>
));

type SectionProps = {
  title: string;
  children: React.ReactNode;
  marginTop?: number;
};

const Section = ({ title, children, marginTop }: SectionProps) => (
  <View style={[styles.section, { marginTop }]}>
    <Image source={Images.backgroundHeader} style={styles.backgroundHeader} />
    {children}
    <Text style={styles.subTitle}>{title}</Text>
  </View>
);

const SettingsScreen = () => {
  const dispatch = useAppDispatch();
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [isChangePassword, setIsChangePassword] = useState(false);

  return (
    <View style={styles.root}>
      <Image source={Images.top_shape} style={styles.background} />
      <MyStatusBar
        backgroundColor="transparent"
        barStyle="dark-content"
        translucent
      />

      <KeyboardAvoidingTemplate contentContainerStyle={styles.container}>
        <View style={styles.main}>
          <Header />
          <Text style={styles.title}>Settings</Text>

          {/* Payments Section */}
          <Section title="ACCOUNT" marginTop={normalize(55)}>
            <RenderCard
              icon={Icons.wallet}
              label="Payment Settings"
              borderBottom
              onPress={() => navigate('PaymentSettings')}
            />
            <RenderCard
              icon={Icons.diamond}
              label="Subscription"
              onPress={() =>
                navigate('SubscriptionDetails', {
                  plan: SubscriptionPlans[1],
                  type: 'Details',
                })
              }
            />
          </Section>

          {/* Account Section */}
          <Section title="OTHERS" marginTop={normalize(isIos() ? 50 : 48)}>
            <RenderCard
              icon={Icons.lock}
              label="Change Password"
              borderBottom
              onPress={
                () => navigate('ChangePassword')
                // setIsChangePassword(true)
              }
            />
            <RenderCard
              icon={Icons.event_available}
              label="Update Availability"
              borderBottom
              onPress={() =>
                navigate('AvailabilitySetup', {
                  type: 'Update',
                })
              }
            />
            <RenderCard
              icon={Icons.delete}
              label="Delete Account"
              onPress={() => setDeleteModalVisible(true)}
            />
          </Section>
        </View>

        <Picker
          visible={deleteModalVisible}
          onClose={() => setDeleteModalVisible(false)}
          onBackDropPess={() => setDeleteModalVisible(false)}
        >
          <Text style={styles.deleteModalLabel}>
            Are You sure you want to delete your account ??
          </Text>
          <View style={styles.deleteModalContainer}>
            <Button
              title="No"
              onPress={() => setDeleteModalVisible(false)}
              width={'48%'}
              colors={[Colors.white, Colors.white, Colors.white, Colors.white]}
              textColor={'#8142E9'}
              style={{ backgroundColor: Colors.white }}
            />
            <Button
              title="Yes"
              onPress={() => dispatch(deleteAccountRequest({}))}
              width={'48%'}
            />
          </View>
        </Picker>

        {/* Change Password Modal */}
        {/* {isChangePassword && (
          <AlertModal
            visible={isChangePassword}
            onClose={() => setIsChangePassword(false)}
            padding={0}
            colors={[Colors.white, Colors.white]}
          >
            <ChangePassword
              onCancel={() => setIsChangePassword(false)}
              onConfirm={() => setIsChangePassword(false)}
            />
          </AlertModal>
        )} */}
      </KeyboardAvoidingTemplate>
    </View>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'rgba(253,250,249)',
  },
  container: {
    paddingBottom: normalize(45),
  },
  main: {
    flex: 1,
  },
  background: {
    width: '100%',
    height: normalize(300),
    position: 'absolute',
  },
  title: {
    marginHorizontal: normalize(15),
    fontSize: normalize(18),
    color: Colors.night_blue,
    fontFamily: Fonts.Manrope_SemiBold,
    marginTop: normalize(15),
  },
  subTitle: {
    fontSize: normalize(12),
    color: Colors.night_blue,
    fontFamily: Fonts.Manrope_SemiBold,
    top: normalize(-33),
    position: 'absolute',
  },
  section: {
    marginHorizontal: normalize(15),
    backgroundColor: Colors.white,
    borderRadius: normalize(17),
    shadowColor: hexToRGB(Colors.dark_grey, isIos() ? 1 : 0.3),
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  backgroundHeader: {
    width: '100%',
    height: normalize(50),
    resizeMode: 'contain',
    top: normalize(-12),
    position: 'absolute',
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: normalize(15),
    paddingVertical: normalize(16),
  },
  cardBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#E8E8E8',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(10),
  },
  cardText: {
    fontSize: normalize(13),
    color: Colors.night_blue,
    fontFamily: Fonts.Inter_Medium,
  },
  icon: {
    height: normalize(20),
    width: normalize(20),
    resizeMode: 'contain',
  },
  arrow: {
    height: normalize(10),
    width: normalize(10),
    resizeMode: 'contain',
    transform: [{ rotate: '-90deg' }],
  },
  deleteModalLabel: {
    fontSize: normalize(15),
    color: Colors.night_blue,
    fontFamily: Fonts.Inter_Medium,
    textAlign: 'center',
    marginVertical: normalize(10),
  },
  deleteModalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: normalize(25),
  },
});

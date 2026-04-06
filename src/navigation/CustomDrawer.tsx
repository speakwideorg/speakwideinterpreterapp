import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import {
  DrawerContentComponentProps,
  useDrawerStatus,
} from '@react-navigation/drawer';
import { Colors, Fonts, Icons, Images } from '@app/themes';
import { normalize } from '@app/utils/orientation';
import { isIos } from '@app/utils/helpers/Validation';
import { logoutRequest } from '@app/store/slice/auth.slice';
import { useAppDispatch } from '@app/store';
import AlertModal from '@app/components/common/AlertModal';
import LogoutConfirmation from '@app/components/template/LogoutConfirmation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const menuItems = [
  { label: 'Dashboard', icon: Icons.dashboard, screen: 'Dashboard' },
  // { label: 'Request Session', icon: Icons.alarm, screen: 'RequestSession' },
  { label: 'Session History', icon: Icons.timer, screen: 'SessionHistory' },
  { label: 'Calendar', icon: Icons.calendar, screen: 'Calendar' },
  { label: 'Chat History', icon: Icons.messages, screen: 'ChatHistory' },
  // {
  //   label: 'Raise Dispute',
  //   icon: Icons.approval_delegation_off,
  //   screen: 'RaiseDispute',
  // },
  // {
  //   label: 'Transaction History',
  //   icon: Icons.payment_arrow_down,
  //   screen: 'TransactionHistory',
  // },
  // { label: 'Favorites', icon: Icons.heart, screen: 'Favorites' },
  // {
  //   label: 'Dispute Management',
  //   icon: Icons.heart,
  //   screen: 'DisputeManagement',
  // },
  {
    label: 'Help & Support',
    icon: Icons.headset_mic,
    screen: 'HelpSupport',
  },
  {
    label: 'Earnings & Payout ',
    icon: Icons.payment_arrow_down,
    screen: 'EarningsPayout',
  },
  // { label: 'Help & Support', icon: Icons.headset_mic, screen: 'HelpSupport' },
  { label: 'Profile', icon: Icons.contacts_product, screen: 'Profile' },
  { label: 'Settings', icon: Icons.build, screen: 'Settings' },
];

const CustomDrawer: React.FC<DrawerContentComponentProps> = ({
  navigation,
  state,
}) => {
  const dispatch = useAppDispatch();
  const drawerStatus = useDrawerStatus();
  const insets = useSafeAreaInsets();
  const [isLogout, setIsLogout] = useState(false);

  const currentRoute = state?.routeNames[state?.index];

  return (
    <View
      style={[
        styles.container,
        Platform.OS === 'android' && { paddingBottom: insets.bottom },
      ]}
    >
      {/* Background Shape */}
      <Image source={Images.drawer_shape} style={styles.drawerShape} />
      <View style={styles.innerWrapper}>
        {/* Logo + Title */}
        <View style={styles.logoRow}>
          <Image source={Icons.logo} style={styles.logoIcon} />
          <Image source={Icons.speakwide2} style={styles.logoText} />
        </View>

        {/* Divider + Close Button */}
        <View style={styles.divider}>
          {drawerStatus === 'open' && (
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.closeButton}
              onPress={() => navigation.closeDrawer()}
            >
              <Image source={Icons.close} style={styles.closeIcon} />
            </TouchableOpacity>
          )}
        </View>

        {/* Menu Items */}
        {
          // (__DEV__
          //   ? [
          //       ...menuItems,
          //       {
          //         label: 'VonageTest',
          //         icon: Icons.icon_cross,
          //         screen: 'VonageTest',
          //       },
          //     ]
          //   : menuItems
          // )
          menuItems.map((item, index) => {
            const isActive = currentRoute === item.screen;
            return (
              <TouchableOpacity
                key={index}
                style={styles.menuItem}
                onPress={() => {
                  navigation.closeDrawer();
                  navigation.navigate(item.screen as never);
                }}
              >
                <View
                  style={[
                    styles.iconWrapper,
                    isActive && { backgroundColor: Colors.purple_heart + '20' }, // light bg highlight
                  ]}
                >
                  <Image
                    source={item.icon}
                    style={[
                      styles.menuIcon,
                      {
                        tintColor: isActive
                          ? Colors.purple_heart
                          : Colors.purple,
                      },
                    ]}
                  />
                </View>
                <Text
                  style={[
                    styles.menuText,
                    {
                      color: isActive ? Colors.purple_heart : Colors.night_blue,
                    },
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })
        }

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => setIsLogout(true)}
        >
          <Text style={styles.logoutText}>Logout</Text>
          <Image source={Icons.logout} style={styles.logoutIcon} />
        </TouchableOpacity>
      </View>

      {isLogout && (
        <AlertModal
          visible={isLogout}
          onClose={() => setIsLogout(false)}
          padding={0}
          paddingTop={normalize(isIos() ? 190 : 180)}
        >
          <LogoutConfirmation
            onCancel={() => setIsLogout(false)}
            onConfirm={() => {
              setIsLogout(false);
              dispatch(logoutRequest({}));
              // setTimeout(() => {
              //   navigate('Success', {
              //     type: 'Logout',
              //     title1: 'Successfully',
              //     title4: '\nLogged Out',
              //   });
              // }, 300);
            }}
          />
        </AlertModal>
      )}
    </View>
  );
};

export default CustomDrawer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    borderTopRightRadius: normalize(30),
    borderBottomRightRadius: normalize(30),
  },
  innerWrapper: {
    width: '90%',
    alignSelf: 'flex-end',
    paddingTop: normalize(isIos() ? 50 : 40),
    height: '100%',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    height: normalize(40),
    width: normalize(40),
    resizeMode: 'contain',
    marginRight: normalize(6),
  },
  logoText: {
    height: normalize(20),
    width: normalize(78),
    resizeMode: 'contain',
  },
  divider: {
    height: normalize(1),
    width: '100%',
    backgroundColor: '#EEEEEE',
    marginVertical: normalize(12),
    justifyContent: 'center',
  },
  closeButton: {
    position: 'absolute',
    right: normalize(-15),
    backgroundColor: Colors.purple,
    width: normalize(28),
    height: normalize(28),
    borderRadius: normalize(28),
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  closeIcon: {
    height: normalize(20),
    width: normalize(22),
    resizeMode: 'contain',
    tintColor: Colors.white,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: normalize(7),
  },
  iconWrapper: {
    height: normalize(32),
    width: normalize(32),
    borderRadius: normalize(32),
    backgroundColor: '#F6F1FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: normalize(10),
  },
  menuIcon: {
    height: normalize(17),
    width: normalize(17),
    tintColor: Colors.purple,
  },
  menuText: {
    fontFamily: Fonts.Inter_Medium,
    color: Colors.night_blue,
    fontSize: normalize(11),
  },
  logoutBtn: {
    backgroundColor: Colors.night_blue,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: normalize(40),
    borderRadius: normalize(12),
    width: '90%',
    position: 'absolute',
    bottom: normalize(30),
    zIndex: 10,
  },
  logoutText: {
    fontFamily: Fonts.Inter_Medium,
    color: Colors.white,
    fontSize: normalize(11),
  },
  logoutIcon: {
    height: normalize(15),
    width: normalize(15),
    tintColor: Colors.white,
    marginLeft: normalize(8),
  },
  drawerShape: {
    height: '60%',
    width: '100%',
    position: 'absolute',
    bottom: 0,
    borderBottomRightRadius: normalize(30),
  },
});

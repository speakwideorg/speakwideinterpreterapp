/* eslint-disable react-hooks/exhaustive-deps */
import React, { FC, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { normalize } from '@app/utils/orientation';
import { Colors, Fonts, Icons } from '@app/themes';
import { goBack, navigate } from '@app/navigation/RootNaivgation';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { RootDrawerParamList } from '@app/types';
import { useAppDispatch, useAppSelector } from '@app/store';
import { IMAGES_BUCKET_URL } from '@app/utils/constants';
import { unreadCountRequest } from '@app/store/slice/Notification.slice';

type HeaderProps = {
  isShowProfile?: boolean;
  isBack?: boolean;
  onMenuPress?: () => void;
  isShowName?: boolean;
  isNotiShow?: boolean;
};

const Header: FC<HeaderProps> = ({
  isBack = false,
  isShowProfile = true,
  onMenuPress,
  isShowName = true,
  isNotiShow = true,
}) => {
  const isFocused = useIsFocused();
  const dispatch = useAppDispatch();
  const { unreadCountResponse } = useAppSelector(state => state.notification);
  console.log('unreadCountResponse', unreadCountResponse?.data?.unread_count);
  const navigation = useNavigation<DrawerNavigationProp<RootDrawerParamList>>();
  const profileDetails = useAppSelector(
    state => state.auth.profileDetailsResponse,
  );

  const handlePress = useCallback(() => {
    if (isBack) {
      goBack();
    } else {
      // onMenuPress?.();
      navigation.openDrawer();
    }
  }, [isBack, onMenuPress]);

  useEffect(() => {
    if (isFocused) {
      dispatch(unreadCountRequest({}));
    }
  }, [isFocused]);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handlePress} style={styles.iconButton}>
        <Image
          source={isBack ? Icons.arrow_right : Icons.menu}
          style={[
            styles.icon,
            {
              height: normalize(isBack ? 18 : 15),
              width: normalize(isBack ? 18 : 15),
            },
          ]}
        />
      </TouchableOpacity>

      {isShowProfile && (
        <View style={styles.profileContainer}>
          {isShowName && (
            <Text style={styles.greeting}>
              Hey,{' '}
              <Text style={styles.username}>
                {profileDetails?.full_name
                  ? profileDetails?.full_name?.split(' ')[0]
                  : 'Interpreter'}
              </Text>
            </Text>
          )}
          <TouchableOpacity
            onPress={() => navigate('Profile')}
            style={styles.profileImageWrapper}
          >
            <Image
              source={
                profileDetails?.profile_image === '' ||
                profileDetails?.profile_image === null ||
                profileDetails?.profile_image === undefined
                  ? Icons.icon_user
                  : {
                      uri:
                        IMAGES_BUCKET_URL.profile +
                        profileDetails?.profile_image,
                    }
              }
              style={styles.profileImage}
              tintColor={
                profileDetails?.profile_image === '' ||
                profileDetails?.profile_image === null ||
                profileDetails?.profile_image === undefined
                  ? Colors.melrose
                  : undefined
              }
            />
          </TouchableOpacity>
          {isNotiShow && (
            <TouchableOpacity
              onPress={() => navigate('Notifications')}
              style={styles.profileImageWrapper}
            >
              <Image
                source={Icons.bell}
                style={styles.bellImage}
                tintColor={Colors.melrose}
              />
            </TouchableOpacity>
          )}
          {unreadCountResponse?.data?.unread_count > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationCount}>
                {unreadCountResponse?.data?.unread_count}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: normalize(45),
    marginTop: normalize(5),
    flexDirection: 'row',
    paddingHorizontal: normalize(15),
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: {
    height: normalize(35),
    width: normalize(35),
    borderRadius: normalize(35),
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  icon: {
    resizeMode: 'contain',
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greeting: {
    fontFamily: Fonts.DMSans_Regular,
    color: Colors.night_blue,
    fontSize: normalize(14),
  },
  username: {
    fontFamily: Fonts.DMSans_SemiBold,
  },
  profileImageWrapper: {
    height: normalize(35),
    width: normalize(35),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: normalize(8),
    overflow: 'hidden',
    marginLeft: normalize(8),
    backgroundColor: Colors.white,
    borderWidth: normalize(1.5),
    borderColor: Colors.lilac,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  bellImage: {
    width: '75%',
    height: '75%',
    resizeMode: 'cover',
  },
  notificationBadge: {
    position: 'absolute',
    top: normalize(-5),
    right: normalize(-5),
    backgroundColor: Colors.red,
    borderRadius: normalize(25),
    minWidth: normalize(16),
    height: normalize(16),
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: normalize(3),
  },
  notificationCount: {
    color: Colors.white,
    fontSize: normalize(8),
    fontFamily: Fonts.DMSans_Bold,
  },
});

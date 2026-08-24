import StackNavigation from './src/navigation/StackNavigation';
import { useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { store, useAppDispatch, useAppSelector } from './src/store/index';
import {
  areaOfExpertiseRequest,
  businessSectorListRequest,
  languageListRequest,
  pricingListRequest,
  subscriptionListRequest,
} from './src/store/slice/default.slice';
import { profileDetailsRequest } from './src/store/slice/auth.slice';
import {
  bankAccountListRequest,
  cardListRequest,
} from './src/store/slice/user.slice';
import { unreadCountRequest } from './src/store/slice/Notification.slice';
import NotificationService from './src/utils/helpers/NotificationService';
import { connectSocket, disconnectSocket } from './src/utils/socket/socket';

const App = () => {
  const dispatch = useAppDispatch();
  const token = useAppSelector(state => state.auth.token);
  const unreadCount = useAppSelector(
    state =>
      state.notification.unreadCountResponse?.data?.unread_count ??
      state.notification.unreadCountResponse?.unread_count,
  );

  useEffect(() => {
    if (token) {
      dispatch(profileDetailsRequest());
      dispatch(businessSectorListRequest({}));
      dispatch(areaOfExpertiseRequest({}));
      dispatch(languageListRequest({}));
      dispatch(subscriptionListRequest({}));
      dispatch(pricingListRequest({}));
      dispatch(bankAccountListRequest({}));
      dispatch(cardListRequest({}));
      dispatch(unreadCountRequest({}));
    }
  }, [dispatch, token]);

  // Keep app badge count synchronized with unread notifications count in state
  useEffect(() => {
    if (token && unreadCount !== undefined && unreadCount !== null) {
      NotificationService.updateBadgeCount(Number(unreadCount) || 0);
    }
  }, [token, unreadCount]);

  // Sync unread count and app badge count on AppState change (minimize / foreground)
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (token) {
        if (nextAppState === 'active') {
          // App returned to foreground: refresh unread count from server
          dispatch(unreadCountRequest({}));
        } else if (nextAppState === 'background' || nextAppState === 'inactive') {
          // App minimized: ensure icon badge is set to current unread count
          const currentCount =
            store.getState()?.notification?.unreadCountResponse?.data?.unread_count ??
            store.getState()?.notification?.unreadCountResponse?.unread_count ??
            0;
          NotificationService.updateBadgeCount(Number(currentCount) || 0);
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, [dispatch, token]);

  useEffect(() => {
    if (token) {
      connectSocket(token);
    }
    return () => {
      disconnectSocket();
    };
  }, [token]);

  useEffect(() => {
    // Initialize Notification Service (includes FCM token + listeners)
    NotificationService.initialize();

    // No need to call registerListenerWithFCM() manually
    // It is already handled inside NotificationService.initialize()

    return () => {
      NotificationService.cleanup();
    };
  }, []);

  // messaging().onMessage(async remoteMessage => {
  //   const notif: AppNotification = remoteMessage as any;

  //   console.log('Received Notification:', notif);

  //   if (notif?.data?.type === 'session_requested') {
  //     // Navigate or update redux
  //     console.log('Session request ID:', notif.data.session_id);
  //   }
  // });

  return <StackNavigation />;
};

export default App;

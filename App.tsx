import StackNavigation from './src/navigation/StackNavigation';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './src/store/index';
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
import NotificationService from './src/utils/helpers/NotificationService';
import { connectSocket, disconnectSocket } from './src/utils/socket/socket';

const App = () => {
  const dispatch = useAppDispatch();
  const token = useAppSelector(state => state.auth.token);

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
    }
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

// src/services/NotificationService.ts

import { Platform } from 'react-native';
import {
  getMessaging,
  setBackgroundMessageHandler,
  onMessage,
  onNotificationOpenedApp,
  getInitialNotification,
  requestPermission as firebaseRequestPermission,
  getToken,
  AuthorizationStatus,
} from '@react-native-firebase/messaging';
import { getApp } from '@react-native-firebase/app';
import notifee, {
  EventType,
  AndroidImportance,
  AndroidStyle,
  Notification as NotifeeNotification,
} from '@notifee/react-native';
import { store } from '../../store/index';
import { setDeviceToken } from '@app/store/slice/auth.slice';
import { navigate } from '@app/navigation/RootNaivgation';

type RemoteMessage = {
  data?: Record<string, any>;
  messageId?: string;
  from?: string;
};

type ExtractedData = {
  type?: string;
  title: string;
  body: string;
  session_id?: string;
  notification_id?: string;
  uid: string;
};

let cachedChannelId: string | null = null;
let isInitialized = false;
let unsubscribeForeground: (() => void) | null = null;
let unsubscribeBackground: (() => void) | null = null;
let unsubscribeForegroundEvent: (() => void) | null = null;

/***********************
 * UNIFIED DATA PARSER
 ************************/
const extractNotificationData = (msg: RemoteMessage): ExtractedData => {
  if (!msg) {
    return {
      title: 'Notification',
      body: '',
      uid: `${Date.now()}`,
    };
  }

  // FIX: Use msg.data (not msg.data.data)
  const raw = msg.data || {};

  const uid = String(raw.uid || msg.messageId || Date.now());

  return {
    type: raw.type,
    title: raw.title || 'Notification',
    body: raw.body || '',
    session_id: raw.session_id,
    notification_id: raw._id || msg.messageId,
    uid,
  };
};

/***********************
 * PERMISSION
 ************************/
export const requestNotificationPermission = async (): Promise<boolean> => {
  try {
    await notifee.requestPermission();
    const app = getApp();
    const messagingInstance = getMessaging(app);

    const authStatus = await firebaseRequestPermission(messagingInstance);
    const enabled =
      authStatus === AuthorizationStatus.AUTHORIZED ||
      authStatus === AuthorizationStatus.PROVISIONAL;

    return enabled;
  } catch (error) {
    console.log('[Notification] Permission error:', error);
    return false;
  }
};

/***********************
 * GET FCM TOKEN
 ************************/
export const getFcmToken = async (): Promise<string | null> => {
  try {
    const app = getApp();
    const messagingInstance = getMessaging(app);

    const token = await getToken(messagingInstance);
    if (token) {
      store.dispatch(setDeviceToken(token));
    }
    return token;
  } catch (error) {
    console.log('[Notification] Error getting FCM token:', error);
    return null;
  }
};

/***********************
 * NAVIGATION HANDLER
 ************************/
export const handleNotificationNavigation = (msg: any) => {
  const data = extractNotificationData(msg);
  if (!data?.type) {
    navigate('Notifications');
    return;
  }

  const _handleNavigate = (type: string) => {
    navigate('DrawerNavigation', {
      screen: 'Dashboard',
      params: {
        screen: 'SessionDetails',
        params: {
          details: {
            _id: data.session_id,
            title: data.title,
            description: data.body,
            notification_id: data.notification_id,
          },
          type: type,
          from: 'notificationList',
        },
      },
    });
  };

  switch (data.type) {
    case 'session_requested':
      _handleNavigate('RequestDetails');
      break;
    case 'session_updated':
      _handleNavigate('RequestDetails');
      break;
    case 'scheduled_session_updated':
      _handleNavigate('ScheduledDetails');
      break;
    default:
      navigate('Notifications');
      break;
  }
};

/***********************
 * CLEAN LISTENERS
 ************************/
const cleanupListeners = () => {
  try {
    if (unsubscribeForeground) {
      unsubscribeForeground();
      unsubscribeForeground = null;
    }
    if (unsubscribeBackground) {
      unsubscribeBackground();
      unsubscribeBackground = null;
    }
    if (unsubscribeForegroundEvent) {
      unsubscribeForegroundEvent();
      unsubscribeForegroundEvent = null;
    }
  } catch (err) {
    console.warn('[Notification] cleanupListeners error', err);
  }
};

/***********************
 * MAIN FCM LISTENERS
 * RETURNS cleanup function
 ************************/
export const registerListenerWithFCM = (): (() => void) => {
  cleanupListeners();

  const app = getApp();
  const messagingInstance = getMessaging(app);

  // FOREGROUND MESSAGE
  unsubscribeForeground = onMessage(messagingInstance, async remoteMessage => {
    const data = extractNotificationData(remoteMessage);
    await displayNotification(data.title, data.body, data);
    console.log('[Notification] Received:', remoteMessage);
  });

  // FOREGROUND PRESS (notifee)
  unsubscribeForegroundEvent = notifee.onForegroundEvent(({ type, detail }) => {
    if (type === EventType.PRESS && detail?.notification?.data) {
      const parsed = extractNotificationData({
        data: detail.notification.data,
      });
      handleNotificationNavigation({ data: parsed, from: 'notification' });
    }
  });

  // BACKGROUND APP OPEN (notification pressed)
  unsubscribeBackground = onNotificationOpenedApp(
    messagingInstance,
    remoteMessage => {
      const data = extractNotificationData(remoteMessage);
      handleNotificationNavigation({ data, from: 'notification' });
    },
  );

  // INITIAL NOTIFICATION (app killed → opened via notification)
  getInitialNotification(messagingInstance)
    .then(remoteMessage => {
      if (remoteMessage) {
        const data = extractNotificationData(remoteMessage);
        handleNotificationNavigation({ data });
      }
    })
    .catch(err => {
      console.warn('[Notification] getInitialNotification error', err);
    });

  // BACKGROUND MESSAGE HANDLER
  setBackgroundMessageHandler(messagingInstance, async remoteMessage => {
    const data = extractNotificationData(remoteMessage);
    await displayNotification(data.title, data.body, data);
    return Promise.resolve();
  });

  const cleanup = () => {
    cleanupListeners();
  };

  return cleanup;
};

/***********************
 * DISPLAY NOTIFICATION
 ************************/
const displayNotification = async (
  title: string,
  body: string,
  data: ExtractedData,
): Promise<void> => {
  try {
    if (!cachedChannelId && Platform.OS === 'android') {
      cachedChannelId = await notifee.createChannel({
        id: 'default',
        name: 'Default',
        importance: AndroidImportance.HIGH,
      });
    }

    await notifee.displayNotification({
      id: data.uid, // ensures unique string
      title,
      body,
      data,
      android: {
        channelId: cachedChannelId!,
        importance: AndroidImportance.HIGH,
        smallIcon: 'ic_launcher',
        style: data.session_id // example conditional
          ? {
              type: AndroidStyle.BIGPICTURE,
              picture: data.session_id, // if you have imageUrl in data, use it instead
            }
          : undefined,
        pressAction: { id: 'default' },
      },
      ios: {
        foregroundPresentationOptions: {
          alert: true,
          badge: true,
          sound: true,
        },
      },
    } as NotifeeNotification);
  } catch (err) {
    console.log('[Notification] Display error:', err);
  }
};

/***********************
 * SERVICE WRAPPER (PUBLIC API)
 ************************/
class NotificationService {
  private cleanupFn: (() => void) | null = null;

  async initialize(): Promise<void> {
    try {
      if (isInitialized) {
        if (!this.cleanupFn) {
          this.cleanupFn = registerListenerWithFCM();
        }
        return;
      }

      const permitted = await requestNotificationPermission();
      if (permitted) {
        await getFcmToken();
      }

      this.cleanupFn = registerListenerWithFCM();
      isInitialized = true;
    } catch (err) {
      console.warn('[NotificationService] initialize error', err);
    }
  }

  cleanup(): void {
    try {
      if (this.cleanupFn) {
        this.cleanupFn();
        this.cleanupFn = null;
      } else {
        cleanupListeners();
      }
    } catch (err) {
      console.warn('[NotificationService] cleanup error', err);
    } finally {
      isInitialized = false;
    }
  }

  async reinitialize(): Promise<void> {
    this.cleanup();
    await this.initialize();
  }
}

export default new NotificationService();

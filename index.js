import { AppRegistry, LogBox } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { persistor, store } from './src/store/index';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StripeProvider } from '@stripe/stripe-react-native';
import { STRIPE_PUBLISH_KEY, STRIPE_PUBLISH_KEY_LIVE } from '@env';

LogBox.ignoreAllLogs();

const createApp = () => (
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <SafeAreaProvider>
        <StripeProvider
          // publishableKey={STRIPE_PUBLISH_KEY}
          publishableKey={STRIPE_PUBLISH_KEY_LIVE}
          merchantIdentifier="merchant.com.speakwide.app"
        >
          <App />
        </StripeProvider>
      </SafeAreaProvider>
    </PersistGate>
  </Provider>
);

AppRegistry.registerComponent(appName, () => createApp);

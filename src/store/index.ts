import { combineReducers, configureStore } from '@reduxjs/toolkit';
import authReducer from './slice/auth.slice';
import userReducer from './slice/user.slice';
import defaultReducer from './slice/default.slice';
import interPreterReducer from './slice/interpreterSession.slice';
import notificationReducer from './slice/Notification.slice';
import PaymentReducer from './slice/payment.slice';

import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import Storage from '@app/utils/storage';
import { createLogger } from 'redux-logger';
import rootSaga from './service/rootSaga';

const customLogger = createLogger({
  actionTransformer: action => {
    if (action.payload && typeof action.payload === 'object') {
      const sanitized = { ...action.payload };
      if ('password' in sanitized) sanitized.password = '***';
      if ('confirm_password' in sanitized) sanitized.confirm_password = '***';
      return { ...action, payload: sanitized };
    }
    return action;
  },
});

const createSagaMiddleware = require('redux-saga');

const appReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  default: defaultReducer,
  interpreterSession: interPreterReducer,
  notification: notificationReducer,
  payment: PaymentReducer,
});

const rootReducer = (state: any, action: any) => {
  if (action.type === 'RESET_STORE') {
    state = undefined;
  }
  return appReducer(state, action);
};

const persistConfig = {
  key: 'root',
  storage: Storage,
  whitelist: ['auth'],
  blacklist: ['default', 'notification'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const sagaMiddleware = createSagaMiddleware.default();

const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      thunk: false,
      serializableCheck: {
        ignoredActions: [
          FLUSH,
          REHYDRATE,
          PAUSE,
          PERSIST,
          PURGE,
          REGISTER,
          'user/profileSetupRequest',
        ],
        ignoredPaths: ['register', 'rehydrate'],
      },
    }).concat(customLogger, sagaMiddleware),
});

sagaMiddleware.run(rootSaga);

const persistor = persistStore(store);

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export { store, persistor };

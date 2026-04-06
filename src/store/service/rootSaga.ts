import { all } from 'redux-saga/effects';
import authSaga from './auth.saga';
import defaultSaga from './default.saga';
import userSaga from './user.saga';
import interpreterSessionSaga from './interpreterSession.saga';
import notificationSaga from './notification.saga';
import paymentSaga from './payment.saga';
// import { onboardingSaga } from './onboarding.saga';

export default function* rootSaga() {
  yield all([
    // onboardingSaga(),
    authSaga(),
    defaultSaga(),
    userSaga(),
    interpreterSessionSaga(),
    notificationSaga(),
    paymentSaga(),
    // Add other sagas here
  ]);
}

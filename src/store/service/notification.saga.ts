import { instance } from '@app/utils/server/instance';
import { AxiosResponse } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';
import { API } from '@app/utils/constants';
import { showMessage } from '@app/utils/helpers/Toast';

import {
  notificationListFailure,
  notificationListSuccess,
  unreadCountSuccess,
  unreadCountFailure,
  unreadListSuccess,
  unreadListFailure,
  notificationDetailsSuccess,
  notificationDetailsFailure,
  notificationDeleteSuccess,
  notificationDeleteFailure,
  notificationMarkReadSuccess,
  notificationMarkReadFailure,
  notificationMarkAllReadSuccess,
  notificationMarkAllReadFailure,
  notificationDeleteAllSuccess,
  notificationDeleteAllFailure,
} from '../slice/Notification.slice';

// REUSABLE API CALL HANDLER
function* apiHandler(
  apiFunc: any,
  payload: any,
  successAction: any,
  failureAction: any,
  isShowMessage = true,
) {
  try {
    console.log("in delete all")
    const result: AxiosResponse<any> = yield call(apiFunc, payload);
    if (result?.status === 200 || result?.status === 201) {
      yield put(successAction({ response: result?.data }));
      if (result?.data?.message && isShowMessage)
        showMessage(result?.data?.message);
    } else {
      yield put(failureAction({ response: result?.data }));
    }
  } catch (error: any) {
    yield put(failureAction({ response: error?.response?.data }));
  }
}

// NOTIFICATION LIST
function* handleNotificationListRequest(action: any) {
  const { page = 1, limit = 3 } = action.payload;
  const url = `${API.notification.noti_list}?page=${page}&limit=${limit}`;

  yield* apiHandler(
    (payload: any) => instance.get(url, payload),
    action.payload,
    notificationListSuccess,
    notificationListFailure,
    false,
  );
}

// UNREAD COUNT
function* handleUnreadCountRequest() {
  yield* apiHandler(
    () => instance.get(API.notification.unread_count),
    null,
    unreadCountSuccess,
    unreadCountFailure,
    false,
  );
}

// UNREAD LIST
function* handleUnreadListRequest() {
  yield* apiHandler(
    () => instance.get(API.notification.unread_noti_list),
    null,
    unreadListSuccess,
    unreadListFailure,
  );
}

// NOTIFICATION DETAILS
function* handleNotificationDetailsRequest(action: any) {
  yield* apiHandler(
    () =>
      instance.get(`${API.notification.noti_details}/${action.payload?.id}`),
    null,
    notificationDetailsSuccess,
    notificationDetailsFailure,
  );
}

// DELETE NOTIFICATION
function* handleNotificationDeleteRequest(action: any) {
  yield* apiHandler(
    () =>
      instance.delete(`${API.notification.noti_delete}${action.payload?.id}`),
    null,
    notificationDeleteSuccess,
    notificationDeleteFailure,
  );
}

// MARK SINGLE AS READ
function* handleNotificationMarkReadRequest(action: any) {
  let url = `${API.notification.noti_details}${action.payload.id}/read`
  console.log(url, "__url");

  yield* apiHandler(
    () =>
      instance.put(url),
    null,
    notificationMarkReadSuccess,
    notificationMarkReadFailure,
  );
}

// MARK ALL READ
function* handleNotificationMarkAllReadRequest() {
  yield* apiHandler(
    () => instance.put(API.notification.noti_mark_all_read, {}),
    null,
    notificationMarkAllReadSuccess,
    notificationMarkAllReadFailure,
  );
}

// DELETE ALL
function* handleNotificationDeleteAllRequest() {
  yield* apiHandler(
    () => instance.delete(API.notification.delete_all),
    null,
    notificationDeleteAllSuccess,
    notificationDeleteAllFailure,
  );
}

// WATCHERS
function* notificationSaga() {
  yield takeLatest(
    'notification/notificationListRequest',
    handleNotificationListRequest,
  );
  yield takeLatest('notification/unreadCountRequest', handleUnreadCountRequest);
  yield takeLatest('notification/unreadListRequest', handleUnreadListRequest);
  yield takeLatest(
    'notification/notificationDetailsRequest',
    handleNotificationDetailsRequest,
  );
  yield takeLatest(
    'notification/notificationDeleteRequest',
    handleNotificationDeleteRequest,
  );
  yield takeLatest(
    'notification/notificationMarkReadRequest',
    handleNotificationMarkReadRequest,
  );
  yield takeLatest(
    'notification/notificationMarkAllReadRequest',
    handleNotificationMarkAllReadRequest,
  );
  yield takeLatest(
    'notification/notificationDeleteAllRequest',
    handleNotificationDeleteAllRequest,
  );
}

export default notificationSaga;

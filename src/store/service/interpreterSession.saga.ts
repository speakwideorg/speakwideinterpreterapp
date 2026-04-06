import { API } from '@app/utils/constants';
import { instance } from '@app/utils/server/instance';
import { AxiosResponse } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';
import { showMessage } from '@app/utils/helpers/Toast';
import {
  acceptSessionFailure,
  acceptSessionSuccess,
  declineRequestedSessionFailure,
  declineRequestedSessionSuccess,
  declineSessionFailure,
  declineSessionSuccess,
  disputeChatListFailure,
  disputeChatListSuccess,
  disputeCreateFailure,
  disputeCreateSuccess,
  disputeDetailsFailure,
  disputeDetailsSuccess,
  disputeListCategoryFailure,
  disputeListCategorySuccess,
  disputeListFailure,
  disputeListSuccess,
  getInterpreterAllSecheduledFailure,
  getInterpreterAllSecheduledSuccess,
  getInterpreterDetailsFailure,
  getInterpreterDetailsSuccess,
  getInterpreterListFailure,
  getInterpreterListSuccess,
  getInterpreterMsgHistoryFailure,
  getInterpreterMsgHistorySuccess,
  getInterpreterSessionTokenFailure,
  getInterpreterSessionTokenSuccess,
  getSessionListFailure,
  getSessionListSuccess,
  getSessionUpdateApproveFailure,
  getSessionUpdateApproveSuccess,
  getSessionUpdateRejectFailure,
  getSessionUpdateRejectSuccess,
  sendInterpreterMsgFailure,
  sendInterpreterMsgSuccess,
  uploadInterpreterMessageFileFailure,
  uploadInterpreterMessageFileSuccess,
} from '../slice/interpreterSession.slice';

function* handleGetInterpreterList(action: any) {
  try {
    const result: AxiosResponse<any> = yield call(
      instance.post,
      API.session.interpreterList,
      action.payload,
    );

    if (result?.status === 200) {
      yield put(
        getInterpreterListSuccess({
          response: result?.data,
          page: action.payload?.page || 1,
        }),
      );
    } else {
      yield put(getInterpreterListFailure({ response: result?.data }));
    }
  } catch (error: any) {
    yield put(
      getInterpreterListFailure({
        response: error?.response?.data?.message || error.message,
      }),
    );
  }
}

function* handleGetInterpreterSechudledList(action: any) {
  try {
    const result: AxiosResponse<any> = yield call(
      instance.post,
      API.session.interpreterList,
      action.payload,
    );

    if (result?.status === 200) {
      yield put(
        getInterpreterAllSecheduledSuccess({
          response: result?.data,
        }),
      );
    } else {
      yield put(getInterpreterAllSecheduledFailure({ response: result?.data }));
    }
  } catch (error: any) {
    yield put(
      getInterpreterAllSecheduledFailure({
        response: error?.response?.data?.message || error.message,
      }),
    );
  }
}

function* handleGetInterpreterDetails(action: any) {
  try {
    const result: AxiosResponse<any> = yield call(
      instance.get,
      API.session.interpreterDetails + action.payload.id,
    );

    console.log('result==>', result);

    if (result?.status === 200) {
      yield put(getInterpreterDetailsSuccess({ response: result?.data?.data }));
    } else {
      yield put(getInterpreterDetailsFailure({ response: result?.data }));
    }
  } catch (error: any) {
    yield put(
      getInterpreterDetailsFailure({
        response: error?.response?.data?.message || error.message,
      }),
    );
  }
}

function* handleInterpreterGetSessionToken(action: any) {
  try {
    const result: AxiosResponse<any> = yield call(
      instance.get,
      API.session.getToken + action.payload._id,
    );

    if (result?.status === 200) {
      yield put(getInterpreterSessionTokenSuccess({ response: result?.data }));
    } else {
      yield put(getInterpreterSessionTokenFailure({ response: result?.data }));
    }

  } catch (error: any) {
    showMessage(error?.response?.data?.message || error.message);
    yield put(
      getInterpreterSessionTokenFailure({
        response: error?.response?.data?.message || error.message,
      }),
    );
  }
}

function* handleGetInterpreterMsgHistory(action: any) {
  try {
    const result: AxiosResponse<any> = yield call(
      instance.get,
      API.session.getMsgHistory,
      { params: action?.payload },
    );

    if (result?.status === 200) {
      yield put(getInterpreterMsgHistorySuccess({ response: result?.data }));
    } else {
      yield put(getInterpreterMsgHistoryFailure({ response: result?.data }));
    }
  } catch (error: any) {
    showMessage(error?.response?.data?.message || error.message);
    yield put(
      getInterpreterMsgHistoryFailure({
        response: error?.response?.data?.message || error.message,
      }),
    );
  }
}

function* handleSendInterpreterMsg(action: any) {
  try {
    const result: AxiosResponse<any> = yield call(
      instance.post,
      API.session.sendMsg,
      action.payload,
    );

    if (result?.status === 200) {
      yield put(sendInterpreterMsgSuccess({ response: result?.data }));
    } else {
      yield put(sendInterpreterMsgFailure({ response: result?.data }));
    }
  } catch (error: any) {
    showMessage(error?.response?.data?.message || error.message);
    yield put(
      sendInterpreterMsgFailure({
        response: error?.response?.data?.message || error.message,
      }),
    );
  }
}

function* handleUploadMessageFile(action: any) {
  try {
    const result: AxiosResponse<any> = yield call(
      instance.post,
      API.session.uploadFile,
      action.payload,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );

    if (result?.status === 200) {
      yield put(
        uploadInterpreterMessageFileSuccess({ response: result?.data }),
      );
    } else {
      yield put(
        uploadInterpreterMessageFileFailure({ response: result?.data }),
      );
    }
  } catch (error: any) {
    yield put(
      uploadInterpreterMessageFileFailure({
        response: error?.response?.data?.message || error.message,
      }),
    );
  }
}

function* handleDeclineSession(action: any) {
  try {
    const result: AxiosResponse<any> = yield call(
      instance.get,
      API.session.decline + action.payload.id,
    );

    if (result?.status === 200) {
      yield put(declineSessionSuccess({ response: result?.data }));
    } else {
      yield put(declineSessionFailure({ response: result?.data }));
    }
    showMessage(result?.data?.message);
  } catch (error: any) {
    yield put(
      declineSessionFailure({
        response: error?.response?.data?.message || error.message,
      }),
    );
  }
}

function* handleDeclineRequestedSession(action: any) {
  try {
    const result: AxiosResponse<any> = yield call(
      instance.get,
      API.session.request_decline + action.payload.id,
    );

    if (result?.status === 200) {
      yield put(declineRequestedSessionSuccess({ response: result?.data }));
    } else {
      yield put(declineRequestedSessionFailure({ response: result?.data }));
    }
    showMessage(result?.data?.message);
  } catch (error: any) {
    yield put(
      declineRequestedSessionFailure({
        response: error?.response?.data?.message || error.message,
      }),
    );
  }
}

function* handleAcceptSession(action: any) {
  try {
    const result: AxiosResponse<any> = yield call(
      instance.get,
      API.session.accept + action.payload.id,
    );

    if (result?.status === 200) {
      yield put(acceptSessionSuccess({ response: result?.data }));
    } else {
      yield put(acceptSessionFailure({ response: result?.data }));
    }
    showMessage(result?.data?.message);
  } catch (error: any) {
    showMessage(error?.response?.data?.message || error.message);
    yield put(
      acceptSessionFailure({
        response: error?.response?.data?.message || error.message,
      }),
    );
  }
}

function* handleGetSessionList(action: any) {
  try {
    const result: AxiosResponse<any> = yield call(
      instance.post,
      API.session.sessionHistory,
      action.payload,
    );

    if (result?.status === 200) {
      yield put(
        getSessionListSuccess({
          response: result?.data,
          page: action.payload?.page || 1,
        }),
      );
    } else {
      yield put(getSessionListFailure({ response: result?.data }));
    }
  } catch (error: any) {
    yield put(
      getSessionListFailure({
        response: error?.response?.data?.message || error.message,
      }),
    );
  }
}

function* handleGetSessionUpdateApprove(action: any) {
  try {
    const result: AxiosResponse<any> = yield call(
      instance.get,
      API.session.sessionUpdateApprove + action.payload.id,
    );

    if (result?.status === 200) {
      yield put(
        getSessionUpdateApproveSuccess({
          response: result?.data,
        }),
      );
    } else {
      yield put(getSessionUpdateApproveFailure({ response: result?.data }));
    }
    showMessage(result?.data?.message);
  } catch (error: any) {
    yield put(
      getSessionUpdateApproveFailure({
        response: error?.response?.data?.message || error.message,
      }),
    );
  }
}

function* handleGetSessionUpdateReject(action: any) {
  try {
    const result: AxiosResponse<any> = yield call(
      instance.get,
      API.session.sessionUpdateReject + action.payload.id,

    );

    if (result?.status === 200) {
      yield put(
        getSessionUpdateRejectSuccess({
          response: result?.data,
        }),
      );
    } else {
      yield put(getSessionUpdateRejectFailure({ response: result?.data }));
    }
    showMessage(result?.data?.message);
  } catch (error: any) {
    yield put(
      getSessionUpdateRejectFailure({
        response: error?.response?.data?.message || error.message,
      }),
    );
  }
}

function* handleDisputeList(action: any) {
  try {
    const listType = action?.payload?.list_type;

    // Support sending an array of list types: ['Pending','Resolved','Declined']
    if (Array.isArray(listType)) {
      for (const lt of listType) {
        const payload = { ...action.payload, list_type: lt };
        const result: AxiosResponse<any> = yield call(
          instance.post,
          API.session.disputeList,
          payload,
        );

        console.log(`result in dispute list for ${lt}===>`, result);

        if (result?.status === 200) {
          yield put(disputeListSuccess({ response: result?.data, list_type: lt }));
        } else {
          yield put(disputeListFailure({ response: result?.data, list_type: lt }));
        }
      }
    } else {
      const result: AxiosResponse<any> = yield call(
        instance.post,
        API.session.disputeList,
        action.payload,
      );

      console.log('result in dispute list===>', result);

      if (result?.status === 200) {
        yield put(disputeListSuccess({ response: result?.data, list_type: listType }));
      } else {
        yield put(disputeListFailure({ response: result?.data, list_type: listType }));
      }
    }
  } catch (error: any) {
    const listType = action?.payload?.list_type;
    if (Array.isArray(listType)) {
      // Dispatch failure for each type in the array
      for (const lt of listType) {
        yield put(
          disputeListFailure({
            response: error?.response?.data?.message || error.message,
            list_type: lt,
          }),
        );
      }
    } else {
      yield put(
        disputeListFailure({
          response: error?.response?.data?.message || error.message,
          list_type: listType,
        }),
      );
    }
  }
}

function* handleDisputeCreate(action: any) {
  try {
    const result: AxiosResponse<any> = yield call(
      instance.post,
      API.session.raiseDispute,
      action.payload,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );

    if (result?.status === 200) {
      yield put(
        disputeCreateSuccess({
          response: result?.data,
        }),
      );
    } else {
      yield put(disputeCreateFailure({ response: result?.data }));
    }
    showMessage(result?.data?.message);
  } catch (error: any) {
    yield put(
      disputeCreateFailure({
        response: error?.response?.data?.message || error.message,
      }),
    );
  }
}

function* handleDisputeDetails(action: any) {
  try {
    const result: AxiosResponse<any> = yield call(
      instance.get,
      API.session.disputeDetails + action.payload.id,
    );

    if (result?.status === 200) {
      yield put(
        disputeDetailsSuccess({
          response: result?.data,
        }),
      );
    } else {
      yield put(disputeDetailsFailure({ response: result?.data }));
    }
  } catch (error: any) {
    yield put(
      disputeDetailsFailure({
        response: error?.response?.data?.message || error.message,
      }),
    );
  }
}

function* handleDisputeCategoryList() {
  try {
    const result: AxiosResponse<any> = yield call(instance.get, API.session.disputeCategory, {
      params: { type_role: 'interpreter' },
    });

    if (result?.status === 200) {
      yield put(
        disputeListCategorySuccess({
          response: result.data,
        }),
      );
    } else {
      yield put(
        disputeListCategoryFailure({
          response: result.data,
        }),
      );
    }
  } catch (error: any) {
    yield put(
      disputeListCategoryFailure({
        response: error?.response?.data?.message || error.message,
      }),
    );
  }
}

function* handleDisputeChatList(action: any) {
  try {
    const result: AxiosResponse<any> = yield call(instance.post, API.session.disputeChatList, action.payload);

    if (result?.status === 200) {
      yield put(
        disputeChatListSuccess({
          response: result.data,
        }),
      );
    } else {
      yield put(
        disputeChatListFailure({
          response: result.data,
        }),
      );
    }
  } catch (error: any) {
    yield put(
      disputeChatListFailure({
        response: error?.response?.data?.message || error.message,
      }),
    );
  }
}


function* interpreterSession() {
  yield takeLatest(
    'interpreterSession/getInterpreterListRequest',
    handleGetInterpreterList,
  );
  yield takeLatest(
    'interpreterSession/getInterpreterAllSecheduledRequest',
    handleGetInterpreterSechudledList,
  );
  yield takeLatest(
    'interpreterSession/getInterpreterDetailsRequest',
    handleGetInterpreterDetails,
  );
  yield takeLatest(
    'interpreterSession/getInterpreterSessionTokenRequest',
    handleInterpreterGetSessionToken,
  );
  yield takeLatest(
    'interpreterSession/getInterpreterMsgHistoryRequest',
    handleGetInterpreterMsgHistory,
  );
  yield takeLatest(
    'interpreterSession/sendInterpreterMsgRequest',
    handleSendInterpreterMsg,
  );
  yield takeLatest(
    'interpreterSession/uploadInterpreterMessageFileRequest',
    handleUploadMessageFile,
  );
  yield takeLatest(
    'interpreterSession/acceptSessionRequest',
    handleAcceptSession,
  );
  yield takeLatest(
    'interpreterSession/declineSessionRequest',
    handleDeclineSession,
  );
  yield takeLatest(
    'interpreterSession/declineRequestedSessionRequest',
    handleDeclineRequestedSession,
  );
  yield takeLatest(
    'interpreterSession/getSessionListRequest',
    handleGetSessionList,
  );
  yield takeLatest(
    'interpreterSession/getSessionUpdateApproveRequest',
    handleGetSessionUpdateApprove,
  );
  yield takeLatest(
    'interpreterSession/getSessionUpdateRejectRequest',
    handleGetSessionUpdateReject,
  );
  yield takeLatest(
    'interpreterSession/disputeListRequest',
    handleDisputeList,
  );
  yield takeLatest(
    'interpreterSession/disputeCreateRequest',
    handleDisputeCreate,
  );
  yield takeLatest(
    'interpreterSession/disputeDetailsRequest',
    handleDisputeDetails,
  );
  yield takeLatest(
    'interpreterSession/disputeListCategoryRequest',
    handleDisputeCategoryList,
  );
  yield takeLatest(
    'interpreterSession/disputeChatListRequest',
    handleDisputeChatList,
  );
}

export default interpreterSession;

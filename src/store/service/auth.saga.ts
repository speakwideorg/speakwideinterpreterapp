import { instance } from '@app/utils/server/instance';
import { AxiosResponse } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';
import { API } from '@app/utils/constants';
import {
  createAccountFailure,
  createAccountSuccess,
  deleteAccountFailure,
  deleteAccountSuccess,
  deleteDocumentFailure,
  deleteDocumentSuccess,
  forgetChangePasswordFailure,
  forgetChangePasswordSuccess,
  forgotPasswordFailure,
  forgotPasswordSuccess,
  logoutFailure,
  logoutSuccess,
  profileDetailsFailure,
  profileDetailsRequest,
  profileDetailsSuccess,
  profileUpdateFailure,
  profileUpdateSuccess,
  refreshTokenFailure,
  refreshTokenSuccess,
  resendOtpFailure,
  resendOtpSuccess,
  signInFailure,
  signInSuccess,
  verifyOtpFailure,
  verifyOtpSuccess,
} from '../slice/auth.slice';
import { store } from '..';
import { persistor } from '..'; // import persistor here
import { showMessage } from '@app/utils/helpers/Toast';
import Storage from '@app/utils/storage';

function* handleCreateAccount(action: any) {
  try {
    const result: AxiosResponse<any> = yield call(
      instance.post,
      API.auth.create_account,
      action.payload,
    );

    if (result?.status === 200) {
      yield put(createAccountSuccess(result?.data));
      yield put(profileDetailsRequest());
    } else {
      yield put(createAccountFailure(result?.data));
    }
    showMessage(result?.data?.message);
  } catch (error: any) {
    yield put(createAccountFailure(error?.response?.data));
    showMessage(error?.response?.data?.message);
  }
}

function* handleSignIn(action: any) {
  try {
    const result: AxiosResponse<any> = yield call(
      instance.post,
      API.auth.signin,
      action.payload,
    );

    console.log("login success response==>", result?.data);

    if (result?.status === 200) {
      yield put(signInSuccess(result?.data));

      if (action.payload?.isRemember) {
        yield call([Storage, Storage.setItem], 'remember_me', 'true');
        yield call(
          [Storage, Storage.setItem],
          'remember_email',
          action.payload.user_name,
        );
        yield call(
          [Storage, Storage.setItem],
          'remember_password',
          action.payload.password,
        );
      } else {
        yield call([Storage, Storage.removeItem], 'remember_me');
        yield call(
          [Storage, Storage.removeItem],
          'remember_email'
        );
        yield call(
          [Storage, Storage.removeItem],
          'remember_password',
        );
      }


      yield put(profileDetailsRequest());
    } else {
      yield put(signInFailure(result?.data));
    }
    showMessage(result?.data?.message);
  } catch (error: any) {
    console.log("login error response==>", error?.response?.data || error);
    yield put(signInFailure(error?.response?.data));
    showMessage(error?.response?.data?.message);
  }
}

function* handleRefreshToken() {
  try {
    const refreshToken = store?.getState()?.auth?.refreshToken;

    const result: AxiosResponse<any> = yield call(
      instance.post,
      API.auth.refreshToken,
      { refreshToken },
    );

    if (result?.status === 200) {
      yield put(refreshTokenSuccess(result?.data));
    } else {
      yield put(refreshTokenFailure(result?.data));
      yield call([persistor, persistor.purge]);
      yield put({ type: 'RESET_STORE' });
    }
  } catch (error: any) {
    yield put(refreshTokenFailure(error?.response?.data));
    yield call([persistor, persistor.purge]);
    yield put({ type: 'RESET_STORE' });
  }
}

function* handleLogout() {
  try {
    const result: AxiosResponse<any> = yield call(
      instance.get,
      API.auth.logout,
    );

    if (result?.status === 200) {
      yield call([persistor, persistor.purge]);
      yield put({ type: 'RESET_STORE' });
      yield put(logoutSuccess({ data: {} }));
    } else {
      yield put(logoutFailure(result?.data));
    }
    showMessage(result?.data?.message);
  } catch (error: any) {
    showMessage(error?.response?.data?.message);
    yield put(logoutFailure(error?.response?.data));
  }
}

function* handleForgotPassword(action: any) {
  try {
    const result: AxiosResponse<any> = yield call(
      instance.post,
      API.auth.forgot_password,
      action.payload,
    );

    if (result?.status === 200) {
      yield put(forgotPasswordSuccess(result?.data));
    } else {
      yield put(forgotPasswordFailure(result?.data));
    }
    showMessage(result?.data?.message);
  } catch (error: any) {
    showMessage(error?.response?.data?.message);
    yield put(forgotPasswordFailure(error?.response?.data));
  }
}

function* handleVerifyOtp(action: any) {
  try {
    const result: AxiosResponse<any> = yield call(
      instance.post,
      API.auth.verify_otp,
      action.payload,
    );

    if (result?.status === 200) {
      yield put(verifyOtpSuccess(result?.data));
    } else {
      yield put(verifyOtpFailure(result?.data));
    }
    showMessage(result?.data?.message);
  } catch (error: any) {
    showMessage(error?.response?.data?.message);
    yield put(verifyOtpFailure(error?.response?.data));
  }
}

function* handleResendOtp(action: any) {
  try {
    const result: AxiosResponse<any> = yield call(
      instance.post,
      API.auth.resend_otp,
      action.payload,
    );

    if (result?.status === 200) {
      yield put(resendOtpSuccess(result?.data));
    } else {
      yield put(resendOtpFailure(result?.data));
    }
    showMessage(result?.data?.message);
  } catch (error: any) {
    showMessage(error?.response?.data?.message);
    yield put(resendOtpFailure(error?.response?.data));
  }
}

function* handleForgotChangePassword(action: any) {
  try {
    const result: AxiosResponse<any> = yield call(
      instance.post,
      API.auth.forgot_change_password,
      action.payload,
    );

    if (result?.status === 200) {
      yield put(forgetChangePasswordSuccess(result?.data));
    } else {
      yield put(forgetChangePasswordFailure(result?.data));
    }
    showMessage(result?.data?.message);
  } catch (error: any) {
    showMessage(error?.response?.data?.message);
    yield put(forgetChangePasswordFailure(error?.response?.data));
  }
}


function* handleDeleteAccountRequest() {
  try {
    const result: AxiosResponse<any> = yield call(
      instance.get,
      API.auth.delete_Account,
    );

    if (result?.status === 200) {
      Storage.clearAll();
      yield call([persistor, persistor.purge]);
      yield put({ type: 'RESET_STORE' });
      yield put(
        deleteAccountSuccess(result?.data),
      );
    } else {
      yield put(
        deleteAccountFailure(result?.data),
      );
    }
    showMessage(result?.data?.message);
  } catch (error: any) {
    yield put(
      deleteAccountFailure(
        error?.response?.data,
      ),
    );
    showMessage(error?.response?.data?.message);
  }
}

function* handleProfileDetails() {
  try {
    const result: AxiosResponse<any> = yield call(
      instance.get,
      API.auth.userDetails,
    );

    if (result?.status === 200) {
      yield put(profileDetailsSuccess(result?.data));
    } else {
      yield put(profileDetailsFailure(result?.data));
    }
  } catch (error: any) {
    yield put(profileDetailsFailure(error?.response?.data));
  }
}

function* handleProfileUpdate(action: any) {
  try {
    const result: AxiosResponse<any> = yield call(
      instance.post,
      API.user.update_profile,
      action.payload,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );

    if (result?.status === 200) {
      yield put(profileUpdateSuccess(result?.data));
    } else {
      yield put(profileUpdateFailure(result?.data));
    }
    showMessage(result?.data?.message);
  } catch (error: any) {
    showMessage(error?.response?.data?.message);
    yield put(profileUpdateFailure(error?.response?.data));
  }
}

function* handleDeleteDocumentRequest(action: any) {
  try {
    const result: AxiosResponse<any> = yield call(
      instance.post,
      API.user.delete_certificate_document,
      action.payload,
    );

    if (result?.status === 200) {
      yield put(deleteDocumentSuccess(result?.data));
      // yield put(profileDetailsRequest());
    } else {
      yield put(deleteDocumentFailure(result?.data));
    }
    // showMessage(result?.data?.message);
  } catch (error: any) {
    showMessage(error?.response?.data?.message);
    yield put(deleteDocumentFailure(error?.response?.data));
  }
}

function* authSaga() {
  yield takeLatest('auth/createAccountRequest', handleCreateAccount);
  yield takeLatest('auth/signInRequest', handleSignIn);
  yield takeLatest('auth/deleteAccountRequest', handleDeleteAccountRequest);
  yield takeLatest('auth/refreshTokenRequest', handleRefreshToken);
  yield takeLatest('auth/logoutRequest', handleLogout);
  yield takeLatest('auth/forgotPasswordRequest', handleForgotPassword);
  yield takeLatest('auth/verifyOtpRequest', handleVerifyOtp);
  yield takeLatest('auth/resendOtpRequest', handleResendOtp);
  yield takeLatest(
    'auth/forgetChangePasswordRequest',
    handleForgotChangePassword,
  );
  yield takeLatest('auth/profileDetailsRequest', handleProfileDetails);
  yield takeLatest('auth/profileUpdateRequest', handleProfileUpdate);
  yield takeLatest('auth/deleteDocumentRequest', handleDeleteDocumentRequest);
}

export default authSaga;

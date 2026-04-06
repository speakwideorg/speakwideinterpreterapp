import { instance } from '@app/utils/server/instance';
import { AxiosResponse } from 'axios';
import { call, delay, put, takeLatest } from 'redux-saga/effects';
import { API } from '@app/utils/constants';
import { showMessage } from '@app/utils/helpers/Toast';
import {
  addBankAccountFailure,
  addBankAccountSuccess,
  addCardFailure,
  addCardSuccess,
  addPaymentMethodFailure,
  addPaymentMethodSuccess,
  bankAccountListFailure,
  bankAccountListSuccess,
  cancelSubscriptionFailure,
  cancelSubscriptionSuccess,
  changePasswordFailure,
  changePasswordSuccess,
  clearPaymentStatus,
  createPaymentFailure,
  createPaymentSuccess,
  deleteCardFailure,
  deleteCardSuccess,
  profileSetupFailure,
  profileSetupSuccess,
  setupAvailibilityFailure,
  setupAvailibilitySuccess,
  subscriptionDetailsFailure,
  subscriptionDetailsSuccess,
  updateBankStatusFailure,
  updateBankStatusSuccess,
} from '../slice/user.slice';
import { cardListFailure, cardListSuccess } from '../slice/user.slice';
import { profileDetailsRequest } from '../slice/auth.slice';

function* handleChangePassword(action: any) {
  try {
    const result: AxiosResponse<any> = yield call(
      instance.post,
      API.user.change_password,
      action.payload,
    );

    if (result?.status === 200) {
      yield put(changePasswordSuccess(result?.data));
    } else {
      yield put(changePasswordFailure(result?.data));
    }
    showMessage(result?.data?.message);
  } catch (error: any) {
    showMessage(error?.response?.data?.message);
    yield put(changePasswordFailure(error?.response?.data));
  }
}

function* handleProfileSetup(action: any) {
  try {
    const result: AxiosResponse<any> = yield call(
      instance.post,
      API.auth.profile_setup,
      action.payload,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );

    if (result?.status === 200) {
      yield put(profileSetupSuccess(result?.data));
      yield put(profileDetailsRequest());
    } else {
      yield put(profileSetupFailure(result?.data));
    }
    showMessage(result?.data?.message);
  } catch (error: any) {
    showMessage(error?.response?.data?.message);
    yield put(profileSetupFailure(error?.response?.data));
  }
}

function* handleCardLists() {
  try {
    const result: AxiosResponse<any> = yield call(
      instance.get,
      API.user.listCards,
    );

    if (result?.status === 200) {
      yield put(cardListSuccess(result?.data));
    } else {
      yield put(cardListFailure(result?.data));
    }
  } catch (error: any) {
    // showMessage(error?.response?.data?.message);
    yield put(cardListFailure(error?.response?.data));
  }
}

function* handleCreatePayment(action: any) {
  try {
    const result: AxiosResponse<any> = yield call(
      instance.post,
      API.user.create_payment,
      action.payload,
    );

    if (result?.status === 200) {
      yield put(createPaymentSuccess(result?.data));
      yield delay(1000);
      yield put(clearPaymentStatus());
    } else {
      yield put(createPaymentFailure(result?.data));
    }
  } catch (error: any) {
    yield put(createPaymentFailure(error?.response?.data));
  }
}

function* handleAddBankAccount() {
  try {
    const result: AxiosResponse<any> = yield call(
      instance.get,
      API.user.add_bank_account,
    );

    if (result?.status === 200) {
      yield put(addBankAccountSuccess(result?.data));
    } else {
      yield put(addBankAccountFailure(result?.data));
    }
  } catch (error: any) {
    showMessage(error?.response?.data?.message);
    yield put(addBankAccountFailure(error?.response?.data));
  }
}

function* handlePaymentIntentCreate() {
  try {
    const result: AxiosResponse<any> = yield call(
      instance.post,
      API.user.paymentIntentCreate,
    );

    if (result?.status === 200) {
      yield put(addPaymentMethodSuccess(result?.data));
    } else {
      yield put(addPaymentMethodFailure(result?.data));
    }
  } catch (error: any) {
    console.log('error in payment===>', error);
    yield put(addPaymentMethodFailure(error?.response?.data));
  }
}

function* handleAddCard(action: any) {
  try {
    const result: AxiosResponse<any> = yield call(
      instance.post,
      API.user.add_card,
      action.payload,
    );


    if (result?.status === 200) {
      yield put(addCardSuccess(result?.data));
      yield put(profileDetailsRequest());
    } else {
      yield put(addCardFailure(result?.data));
    }
  } catch (error: any) {
    console.log('error in add card===>', error);
    yield put(addCardFailure(error?.response?.data));
  }
}

function* handleDeleteCard(action: any) {
  try {
    const result: AxiosResponse<any> = yield call(
      instance.post,
      API.user.deleteCard,
      action.payload,
    );

    console.log('result in delete card===>', result);

    if (result?.status === 200) {
      yield put(deleteCardSuccess(result?.data));
    } else {
      yield put(deleteCardFailure(result?.data));
    }
    showMessage(result?.data?.message);
  } catch (error: any) {
    showMessage(error?.response?.data?.message);
    yield put(deleteCardFailure(error?.response?.data));
  }
}

function* handleSetUpAvailabilityReq(action: any) {
  try {
    const result: AxiosResponse<any> = yield call(
      instance.post,
      API.auth.setup_availibility,
      action.payload,
    );

    if (result?.status === 200) {
      yield put(setupAvailibilitySuccess(result?.data));
      yield put(profileDetailsRequest());
    } else {
      yield put(setupAvailibilityFailure(result?.data));
    }
    showMessage(result?.data?.message);
  } catch (error: any) {
    showMessage(error?.response?.data?.message);
    yield put(setupAvailibilityFailure(error?.response?.data));
  }
}

function* handleGetBankLists() {
  try {
    const result: AxiosResponse<any> = yield call(
      instance.get,
      API.user.get_bank_list,
    );

    if (result?.status === 200) {
      yield put(bankAccountListSuccess(result?.data));
    } else {
      yield put(bankAccountListFailure(result?.data));
    }
  } catch (error: any) {
    showMessage(error?.response?.data?.message);
    yield put(bankAccountListSuccess(error?.response?.data));
  }
}

function* handleUpdateBankStatus(action: any) {
  try {
    const result: AxiosResponse<any> = yield call(
      instance.put,
      API.user.update_bank_status,
      action.payload,
    );

    if (result?.status === 200) {
      yield put(updateBankStatusSuccess(result?.data));
      yield put(profileDetailsRequest());
    } else {
      yield put(updateBankStatusFailure(result?.data));
    }
    showMessage(result?.data?.message);
  } catch (error: any) {
    showMessage(error?.response?.data?.message);
    yield put(updateBankStatusFailure(error?.response?.data));
  }
}

function* handleGetSubscriptionDetails(action: any) {
  try {
    const result: AxiosResponse<any> = yield call(
      instance.get,
      API.user.subscription_details + action.payload.subscriptionId,
    );

    if (result?.status === 200) {
      yield put(subscriptionDetailsSuccess(result?.data));
    } else {
      yield put(subscriptionDetailsFailure(result?.data));
    }
  } catch (error: any) {
    yield put(subscriptionDetailsFailure(error?.response?.data));
  }
}

function* handleCancelSubscriptionDetails() {
  console.log("in cancel")
  try {
    const result: AxiosResponse<any> = yield call(
      instance.get,
      API.user.cancel_subscription,
    );

    if (result?.status === 200) {
      yield put(cancelSubscriptionSuccess(result?.data));
      yield put(profileDetailsRequest());
    } else {
      yield put(cancelSubscriptionFailure(result?.data));
    }
    showMessage(result?.data?.message);
  } catch (error: any) {
    showMessage(error?.response?.data?.message);
    yield put(cancelSubscriptionFailure(error?.response?.data));
  }
}

function* userSaga() {
  yield takeLatest('user/changePasswordRequest', handleChangePassword);
  yield takeLatest('user/cardListRequest', handleCardLists);
  yield takeLatest('user/createPaymentRequest', handleCreatePayment);
  yield takeLatest('user/addBankAccountRequest', handleAddBankAccount);
  yield takeLatest('user/addPaymentMethodRequest', handlePaymentIntentCreate);
  yield takeLatest('user/addCardRequest', handleAddCard);
  yield takeLatest('user/deleteCardRequest', handleDeleteCard);
  yield takeLatest('user/profileSetupRequest', handleProfileSetup);
  yield takeLatest('user/setupAvailibilityRequest', handleSetUpAvailabilityReq);
  yield takeLatest('user/bankAccountListRequest', handleGetBankLists);
  yield takeLatest('user/updateBankStatusRequest', handleUpdateBankStatus);
  yield takeLatest(
    'user/subscriptionDetailsRequest',
    handleGetSubscriptionDetails,
  );
  yield takeLatest('user/cancelSubscriptionRequest', handleCancelSubscriptionDetails);
}

export default userSaga;

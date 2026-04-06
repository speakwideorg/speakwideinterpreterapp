import { instance } from '@app/utils/server/instance';
import { AxiosResponse } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';
import { API } from '@app/utils/constants';
import { invoiceDetailsFailure, invoiceDetailsSuccess, payoutDetailsFailure, payoutDetailsSuccess, payoutListFailure, payoutListSuccess, taxDetailsFailure, taxDetailsSuccess, taxEligibilityFailure, taxEligibilitySuccess, transactionListFailure, transactionListSuccess } from '../slice/payment.slice';

function* handleGetTransactionList(action: any) {
  try {
    const result: AxiosResponse<any> = yield call(
      instance.post,
      API.payment.earning_list,
      action.payload
    );

    if (result?.status === 200) {
      yield put(transactionListSuccess(result?.data));
    } else {
      yield put(transactionListFailure(result?.data));
    }
  } catch (error: any) {
    yield put(transactionListFailure(error?.response?.data));
  }
}

function* handleGetPayoutList(action: any) {
  try {
    const result: AxiosResponse<any> = yield call(
      instance.post,
      API.payment.payout_list,
      action.payload
    );

    if (result?.status === 200) {
      yield put(payoutListSuccess(result?.data));
    } else {
      yield put(payoutListFailure(result?.data));
    }
  } catch (error: any) {
    yield put(payoutListFailure(error?.response?.data));
  }
}

function* handleGetPayoutDetails(action: any) {
  try {
    const result: AxiosResponse<any> = yield call(
      instance.post,
      API.payment.payout_details,
      action.payload
    );

    if (result?.status === 200) {
      yield put(payoutDetailsSuccess(result?.data));
    } else {
      yield put(payoutDetailsFailure(result?.data));
    }
  } catch (error: any) {
    yield put(payoutDetailsFailure(error?.response?.data));
  }
}

function* handleGetInvoiceDetails(action: any) {
  try {
    const result: AxiosResponse<any> = yield call(
      instance.post,
      API.payment.invoice_details,
      action.payload
    );

    if (result?.status === 200) {
      yield put(invoiceDetailsSuccess(result?.data));
    } else {
      yield put(invoiceDetailsFailure(result?.data));
    }
  } catch (error: any) {
    yield put(invoiceDetailsFailure(error?.response?.data));
  }
}

function* handleGetTaxEligibility() {
  try {
    const result: AxiosResponse<any> = yield call(
      instance.get,
      API.payment.taxEligibility,
    );

    if (result?.status === 200) {
      yield put(taxEligibilitySuccess(result?.data));
    } else {
      yield put(taxEligibilityFailure(result?.data));
    }
  } catch (error: any) {
    yield put(taxEligibilityFailure(error?.response?.data));
  }
}

function* handleGetTaxDetails() {
  try {
    const result: AxiosResponse<any> = yield call(
      instance.get,
      API.payment.tax_details,
    );

    if (result?.status === 200) {
      yield put(taxDetailsSuccess(result?.data));
    } else {
      yield put(taxDetailsFailure(result?.data));
    }
  } catch (error: any) {
    yield put(taxDetailsFailure(error?.response?.data));
  }
}


function* paymentSaga() {
  yield takeLatest(
    'payment/transactionListRequest',
    handleGetTransactionList,
  );
  yield takeLatest(
    'payment/payoutListRequest',
    handleGetPayoutList,
  );
  yield takeLatest(
    'payment/payoutDetailsRequest',
    handleGetPayoutDetails,
  );
  yield takeLatest(
    'payment/invoiceDetailsRequest',
    handleGetInvoiceDetails,
  );
  yield takeLatest(
    'payment/taxEligibilityRequest',
    handleGetTaxEligibility,
  );
  yield takeLatest(
    'payment/taxDetailsRequest',
    handleGetTaxDetails,
  );
}

export default paymentSaga;

import { instance } from '@app/utils/server/instance';
import { AxiosResponse } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';
import { API } from '@app/utils/constants';
import {
  areaOfExpertiseFailure,
  areaOfExpertiseSuccess,
  businessSectorListFailure,
  businessSectorListSuccess,
  cmsDetailsFailure,
  cmsDetailsSuccess,
  languageListFailure,
  languageListSuccess,
  pricingListFailure,
  pricingListSuccess,
  subscriptionListFailure,
  subscriptionListSuccess,
} from '../slice/default.slice';

function* handleGetAreaOfExpertiseList() {
  try {
    const result: AxiosResponse<any> = yield call(
      instance.get,
      API.default.area_of_expertise_list,
    );

    if (result?.status === 200) {
      yield put(areaOfExpertiseSuccess(result?.data));
    } else {
      yield put(areaOfExpertiseFailure(result?.data));
    }
  } catch (error: any) {
    yield put(areaOfExpertiseFailure(error?.response?.data));
  }
}

function* handleGetLanguageList() {
  try {
    const result: AxiosResponse<any> = yield call(
      instance.get,
      API.default.language_list,
    );

    if (result?.status === 200) {
      yield put(languageListSuccess(result?.data));
    } else {
      yield put(languageListFailure(result?.data));
    }
  } catch (error: any) {
    yield put(languageListFailure(error?.response?.data));
  }
}

function* handleGetBusinessSectorList() {
  try {
    const result: AxiosResponse<any> = yield call(
      instance.get,
      API.default.business_sector_list,
    );

    if (result?.status === 200) {
      yield put(businessSectorListSuccess(result?.data));
    } else {
      yield put(businessSectorListFailure(result?.data));
    }
  } catch (error: any) {
    yield put(businessSectorListFailure(error?.response?.data));
  }
}

function* handleGetSubscriptionList() {
  try {
    const result: AxiosResponse<any> = yield call(
      instance.get,
      API.default.subscription_list,
    );

    if (result?.status === 200) {
      yield put(subscriptionListSuccess(result?.data));
    } else {
      yield put(subscriptionListFailure(result?.data));
    }
  } catch (error: any) {
    yield put(subscriptionListFailure(error?.response?.data));
  }
}

function* handleGetPricingList() {
  try {
    const result: AxiosResponse<any> = yield call(
      instance.get,
      API.default.pricing_list,
    );

    if (result?.status === 200) {
      yield put(pricingListSuccess(result?.data));
    } else {
      yield put(pricingListFailure(result?.data));
    }
  } catch (error: any) {
    yield put(pricingListFailure(error?.response?.data));
  }
}

function* handleGetCmsDetails(_action: any) {
  try {
    const result: AxiosResponse<any> = yield call(
      instance.post,
      API.default.cms,
      _action.payload
    );

    if (result?.status === 200) {
      yield put(cmsDetailsSuccess(result?.data));
    } else {
      yield put(cmsDetailsFailure(result?.data));
    }
  } catch (error: any) {
    yield put(cmsDetailsFailure(error?.response?.data));
  }
}

function* defaultSaga() {
  yield takeLatest(
    'default/areaOfExpertiseRequest',
    handleGetAreaOfExpertiseList,
  );
  yield takeLatest('default/languageListRequest', handleGetLanguageList);
  yield takeLatest(
    'default/businessSectorListRequest',
    handleGetBusinessSectorList,
  );
  yield takeLatest(
    'default/subscriptionListRequest',
    handleGetSubscriptionList,
  );
  yield takeLatest('default/pricingListRequest', handleGetPricingList);
  yield takeLatest('default/cmsDetailsRequest', handleGetCmsDetails)
}

export default defaultSaga;

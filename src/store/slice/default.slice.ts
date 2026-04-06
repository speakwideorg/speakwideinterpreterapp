import { createSlice } from '@reduxjs/toolkit';

interface payload_interface {
  payload: { data: any };
  type: string;
}

interface initialStateInterface {
  status: string;
  message: string;
  isLoading: boolean;
  /////////////////////// responses
  areaOfExpertiseListResponse: any;
  languageListResponse: any;
  businessAreaListResponse: any;
  subscriptionListResponse: any;
  pricingListResponse: any;
  cmsDetailsResponse?: any;
}

const initialState: initialStateInterface = {
  status: '',
  message: '',
  isLoading: false,
  /////////////////////// responses
  areaOfExpertiseListResponse: {},
  languageListResponse: {},
  businessAreaListResponse: {},
  subscriptionListResponse: {},
  pricingListResponse: {},
  cmsDetailsResponse: {},
};

const DefaultSlice = createSlice({
  name: 'default',
  initialState,
  reducers: {
    //////////////////// reset
    resetDefaults(state) {
      state.isLoading = false;
      state.message = '';
      state.status = '';
    },

    //////////////////// area of expertise
    areaOfExpertiseRequest(state, action) {
      state.isLoading = true;
      state.status = action.type;
    },
    areaOfExpertiseSuccess(state, action: payload_interface) {
      state.isLoading = false;
      state.status = action.type;
      state.areaOfExpertiseListResponse = action?.payload?.data;
    },
    areaOfExpertiseFailure(state, action: payload_interface) {
      state.isLoading = false;
      state.status = action.type;
      state.areaOfExpertiseListResponse = action?.payload?.data;
    },

    //////////////////// language
    languageListRequest(state, action) {
      state.isLoading = true;
      state.status = action.type;
    },
    languageListSuccess(state, action: payload_interface) {
      state.isLoading = false;
      state.status = action.type;
      state.languageListResponse = action?.payload?.data;
    },
    languageListFailure(state, action: payload_interface) {
      state.isLoading = false;
      state.status = action.type;
      state.languageListResponse = action?.payload?.data;
    },

    //////////////////// language
    businessSectorListRequest(state, action) {
      state.isLoading = true;
      state.status = action.type;
    },
    businessSectorListSuccess(state, action: payload_interface) {
      state.isLoading = false;
      state.status = action.type;
      state.businessAreaListResponse = action?.payload?.data;
    },
    businessSectorListFailure(state, action: payload_interface) {
      state.isLoading = false;
      state.status = action.type;
      state.businessAreaListResponse = action?.payload?.data;
    },

    //////////////////// subscription
    subscriptionListRequest(state, action) {
      state.isLoading = true;
      state.status = action.type;
    },
    subscriptionListSuccess(state, action: payload_interface) {
      state.isLoading = false;
      state.status = action.type;
      state.subscriptionListResponse = action?.payload?.data;
    },
    subscriptionListFailure(state, action: payload_interface) {
      state.isLoading = false;
      state.status = action.type;
      state.subscriptionListResponse = action?.payload?.data;
    },

    //////////////////// pricing
    pricingListRequest(state, action) {
      state.isLoading = false;
      state.status = action.type;
    },
    pricingListSuccess(state, action: payload_interface) {
      state.isLoading = false;
      state.status = action.type;
      state.pricingListResponse = action?.payload?.data;
    },
    pricingListFailure(state, action: payload_interface) {
      state.isLoading = false;
      state.status = action.type;
      state.pricingListResponse = action?.payload?.data;
    },

    //////////////////// cms list
    cmsDetailsRequest(state, action) {
      state.isLoading = true;
      state.status = action.type;
    },
    cmsDetailsSuccess(state, action: payload_interface) {
      state.isLoading = false;
      state.status = action.type;
      state.cmsDetailsResponse = action?.payload?.data;
    },
    cmsDetailsFailure(state, action: payload_interface) {
      state.isLoading = false;
      state.status = action.type;
      state.cmsDetailsResponse = action?.payload?.data;
    },
  },
});

export const {
  resetDefaults,

  areaOfExpertiseRequest,
  areaOfExpertiseSuccess,
  areaOfExpertiseFailure,

  languageListRequest,
  languageListSuccess,
  languageListFailure,

  businessSectorListRequest,
  businessSectorListSuccess,
  businessSectorListFailure,

  subscriptionListRequest,
  subscriptionListSuccess,
  subscriptionListFailure,

  pricingListRequest,
  pricingListSuccess,
  pricingListFailure,

  // cms details
  cmsDetailsRequest,
  cmsDetailsSuccess,
  cmsDetailsFailure
} = DefaultSlice.actions;

export default DefaultSlice.reducer;

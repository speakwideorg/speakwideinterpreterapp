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
  transactionListResponse: any;
  payoutListResponse?: any;
  payoutDetailResponse?: any;
  invoiceDetailResponse?: any;
  taxEligibilityResponse?: any;
  taxDetailsResponse?: any;

}

const initialState: initialStateInterface = {
  status: '',
  message: '',
  isLoading: false,
  /////////////////////// responses
  transactionListResponse: {},
  payoutListResponse: {},
  payoutDetailResponse: {},
  invoiceDetailResponse: {},
  taxEligibilityResponse: {},
  taxDetailsResponse: {},

};

const PaymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    //////////////////// reset
    resetDefaults(state) {
      state.isLoading = false;
      state.message = '';
      state.status = '';
    },

    //////////////////// transactions list
    transactionListRequest(state, action) {
      state.isLoading = true;
      state.status = action.type;
    },
    transactionListSuccess(state, action: payload_interface) {
      state.isLoading = false;
      state.status = action.type;
      state.transactionListResponse = action?.payload?.data;
    },
    transactionListFailure(state, action: payload_interface) {
      state.isLoading = false;
      state.status = action.type;
      state.transactionListResponse = action?.payload?.data;
    },

    //////////////////// payout lists
    payoutListRequest(state, action) {
      state.isLoading = true;
      state.status = action.type;
    },
    payoutListSuccess(state, action: payload_interface) {
      state.isLoading = false;
      state.status = action.type;
      state.payoutListResponse = action?.payload?.data;
    },
    payoutListFailure(state, action: payload_interface) {
      state.isLoading = false;
      state.status = action.type;
      state.payoutListResponse = action?.payload?.data;
    },

    //////////////////// payout details
    payoutDetailsRequest(state, action) {
      state.isLoading = true;
      state.status = action.type;
    },
    payoutDetailsSuccess(state, action: payload_interface) {
      state.isLoading = false;
      state.status = action.type;
      state.payoutDetailResponse = action?.payload?.data;
    },
    payoutDetailsFailure(state, action: payload_interface) {
      state.isLoading = false;
      state.status = action.type;
      state.payoutDetailResponse = action?.payload?.data;
    },

    //////////////////// invoice details
    invoiceDetailsRequest(state, action) {
      state.isLoading = true;
      state.status = action.type;
    },
    invoiceDetailsSuccess(state, action: payload_interface) {
      state.isLoading = false;
      state.status = action.type;
      state.invoiceDetailResponse = action?.payload?.data;
    },
    invoiceDetailsFailure(state, action: payload_interface) {
      state.isLoading = false;
      state.status = action.type;
      state.invoiceDetailResponse = action?.payload?.data;
    },

    //////////////////// tax eligibility
    taxEligibilityRequest(state, action) {
      state.isLoading = true;
      state.status = action.type;
    },
    taxEligibilitySuccess(state, action: payload_interface) {
      state.isLoading = false;
      state.status = action.type;
      state.taxEligibilityResponse = action?.payload?.data;
    },
    taxEligibilityFailure(state, action: payload_interface) {
      state.isLoading = false;
      state.status = action.type;
      state.taxEligibilityResponse = action?.payload?.data;
    },

    //////////////////// tax details
    taxDetailsRequest(state, action) {
      state.isLoading = true;
      state.status = action.type;
    },
    taxDetailsSuccess(state, action: payload_interface) {
      state.isLoading = false;
      state.status = action.type;
      state.taxDetailsResponse = action?.payload?.data;
    },
    taxDetailsFailure(state, action: payload_interface) {
      state.isLoading = false;
      state.status = action.type;
      state.taxDetailsResponse = action?.payload?.data;
    },
  },
});

export const {
  resetDefaults,

  transactionListRequest,
  transactionListSuccess,
  transactionListFailure,

  payoutListRequest,
  payoutListSuccess,
  payoutListFailure,

  payoutDetailsRequest,
  payoutDetailsSuccess,
  payoutDetailsFailure,

  invoiceDetailsRequest,
  invoiceDetailsSuccess,
  invoiceDetailsFailure,

  taxEligibilityRequest,
  taxEligibilitySuccess,
  taxEligibilityFailure,

  taxDetailsRequest,
  taxDetailsSuccess,
  taxDetailsFailure,

} = PaymentSlice.actions;

export default PaymentSlice.reducer;

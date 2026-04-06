import { createSlice } from '@reduxjs/toolkit';

interface payload_interface {
  payload: {
    data: any;
    token?: string;
    refresh_token?: string;
  };
  type: string;
}

interface initialStateInterface {
  status: string;
  isLoading: boolean;
  token: string;
  refreshToken: string;
  userId: string;
  /////////////////////// responses
  changePasswordResponse: any;
  cardListsResponse: any;
  createPaymentResponse: any;
  addBankAccountResponse: any;
  paymentMethodResponse: any;
  addCardResponse: any;
  deleteCardResponse: any;
  profileSetupResponse: any;
  setUpAvailibilityResponse: any;
  bankAccountListResponse: any;
  updateBankStatusResponse: any;
  subscriptionDetailsResponse: any;
  cancelSubscriptionResponse?: any;
}

const initialState: initialStateInterface = {
  status: '',
  isLoading: false,
  token: '',
  refreshToken: '',
  userId: '',
  /////////////////////// responses
  changePasswordResponse: {},
  cardListsResponse: {},
  createPaymentResponse: {},
  addBankAccountResponse: {},
  addCardResponse: {},
  deleteCardResponse: {},
  paymentMethodResponse: {},
  profileSetupResponse: {},
  setUpAvailibilityResponse: {},
  bankAccountListResponse: {},
  updateBankStatusResponse: {},
  subscriptionDetailsResponse: {},
  cancelSubscriptionResponse: {},
};

const UserSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    //////////////////// reset
    resetUserDefaults(state) {
      state.isLoading = false;
      state.status = '';
    },

    //////////////////// change password
    changePasswordRequest(state, action) {
      state.isLoading = true;
      state.status = action.type;
    },
    changePasswordSuccess(state, action: payload_interface) {
      state.isLoading = false;
      state.status = action.type;
      state.changePasswordResponse = action?.payload?.data;
    },
    changePasswordFailure(state, action: payload_interface) {
      state.isLoading = false;
      state.status = action.type;
      state.changePasswordResponse = action?.payload?.data;
    },

    //////////////////// profile setup
    profileSetupRequest(state, action) {
      state.isLoading = true;
      state.status = action.type;
    },
    profileSetupSuccess(state, action: payload_interface) {
      state.isLoading = false;
      state.status = action.type;
      state.profileSetupResponse = action?.payload?.data;
    },
    profileSetupFailure(state, action: payload_interface) {
      state.isLoading = false;
      state.status = action.type;
      state.profileSetupResponse = action?.payload?.data;
    },

    //////////////////// availibility setup
    setupAvailibilityRequest(state, action) {
      state.isLoading = true;
      state.status = action.type;
    },
    setupAvailibilitySuccess(state, action: payload_interface) {
      state.isLoading = false;
      state.status = action.type;
      state.setUpAvailibilityResponse = action?.payload?.data;
    },
    setupAvailibilityFailure(state, action: payload_interface) {
      state.isLoading = false;
      state.status = action.type;
      state.setUpAvailibilityResponse = action?.payload?.data;
    },

    ////////////////////  card lists
    cardListRequest(state, action) {
      state.isLoading = true;
      state.status = action.type;
    },
    cardListSuccess(state, action: payload_interface) {
      state.isLoading = false;
      state.status = action.type;
      state.cardListsResponse = action?.payload?.data?.data;
    },
    cardListFailure(state, action: payload_interface) {
      state.isLoading = false;
      state.status = action.type;
      state.cardListsResponse = action?.payload?.data?.data;
    },

    ////////////////////  create payment
    createPaymentRequest(state, action) {
      state.isLoading = true;
      state.status = action.type;
    },
    createPaymentSuccess(state, action: payload_interface) {
      state.isLoading = false;
      state.status = action.type;
      state.createPaymentResponse = action?.payload?.data;
    },
    createPaymentFailure(state, action: payload_interface) {
      state.isLoading = false;
      state.status = action.type;
      state.createPaymentResponse = action?.payload?.data;
    },
    clearPaymentStatus(state) {
      state.isLoading = false;
      state.status = "";
    },

    //////////////////// update profile
    addBankAccountRequest(state, action) {
      state.isLoading = true;
      state.status = action.type;
    },
    addBankAccountSuccess(state, action: payload_interface) {
      state.isLoading = false;
      state.status = action.type;
      state.addBankAccountResponse = action?.payload?.data;
    },
    addBankAccountFailure(state, action: payload_interface) {
      state.isLoading = false;
      state.status = action.type;
      state.addBankAccountResponse = action?.payload?.data;
    },

    //////////////////// add payment intent
    addPaymentMethodRequest(state, action) {
      state.isLoading = false;
      state.status = action.type;
    },
    addPaymentMethodSuccess(state, action: payload_interface) {
      state.isLoading = false;
      state.status = action.type;
      state.paymentMethodResponse = action?.payload?.data;
    },
    addPaymentMethodFailure(state, action: payload_interface) {
      state.isLoading = false;
      state.status = action.type;
      state.paymentMethodResponse = action?.payload?.data;
    },

    //////////////////// add card
    addCardRequest(state, action) {
      state.isLoading = false;
      state.status = action.type;
    },
    addCardSuccess(state, action: payload_interface) {
      state.isLoading = false;
      state.status = action.type;
      state.addCardResponse = action?.payload?.data;
    },
    addCardFailure(state, action: payload_interface) {
      state.isLoading = false;
      state.status = action.type;
      state.addCardResponse = action?.payload?.data;
    },

    deleteCardRequest(state, action) {
      state.isLoading = true;
      state.status = action.type;
    },
    deleteCardSuccess(state, action: payload_interface) {
      state.isLoading = false;
      state.status = action.type;
      state.deleteCardResponse = action?.payload?.data;
    },
    deleteCardFailure(state, action: payload_interface) {
      state.isLoading = false;
      state.status = action.type;
      state.deleteCardResponse = action?.payload?.data;
    },

    //////////////////// add card
    bankAccountListRequest(state, action) {
      state.isLoading = false;
      state.status = action.type;
    },
    bankAccountListSuccess(state, action: payload_interface) {
      state.isLoading = false;
      state.status = action.type;
      state.bankAccountListResponse = action?.payload?.data;
    },
    bankAccountListFailure(state, action: payload_interface) {
      state.isLoading = false;
      state.status = action.type;
      state.bankAccountListResponse = action?.payload?.data;
    },

    //////////////////// add card
    updateBankStatusRequest(state, action) {
      state.isLoading = false;
      state.status = action.type;
    },
    updateBankStatusSuccess(state, action: payload_interface) {
      state.isLoading = false;
      state.status = action.type;
      state.updateBankStatusResponse = action?.payload?.data;
    },
    updateBankStatusFailure(state, action: payload_interface) {
      state.isLoading = false;
      state.status = action.type;
      state.updateBankStatusResponse = action?.payload?.data;
    },

    //////////////////// subscription details
    subscriptionDetailsRequest(state, action) {
      state.isLoading = true;
      state.status = action.type;
    },
    subscriptionDetailsSuccess(state, action: payload_interface) {
      state.isLoading = false;
      state.status = action.type;
      state.subscriptionDetailsResponse = action?.payload?.data;
    },
    subscriptionDetailsFailure(state, action: payload_interface) {
      state.isLoading = false;
      state.status = action.type;
      state.subscriptionDetailsResponse = action?.payload?.data;
    },

    /////////////////////// cancel subscription
    cancelSubscriptionRequest(state, action) {
      state.isLoading = true;
      state.status = action.type;
    },
    cancelSubscriptionSuccess(state, action: payload_interface) {
      state.isLoading = false;
      state.status = action.type;
      state.cancelSubscriptionResponse = action?.payload?.data;
    },
    cancelSubscriptionFailure(state, action: payload_interface) {
      state.isLoading = false;
      state.status = action.type;
      state.cancelSubscriptionResponse = action?.payload?.data;
    },
  },
});

export const {
  resetUserDefaults,

  changePasswordRequest,
  changePasswordSuccess,
  changePasswordFailure,

  cardListRequest,
  cardListSuccess,
  cardListFailure,

  createPaymentRequest,
  createPaymentSuccess,
  createPaymentFailure,
  clearPaymentStatus,

  addBankAccountFailure,
  addBankAccountRequest,
  addBankAccountSuccess,

  addCardFailure,
  addCardRequest,
  addCardSuccess,

  deleteCardRequest,
  deleteCardSuccess,
  deleteCardFailure,

  addPaymentMethodFailure,
  addPaymentMethodRequest,
  addPaymentMethodSuccess,

  profileSetupRequest,
  profileSetupSuccess,
  profileSetupFailure,

  setupAvailibilityRequest,
  setupAvailibilitySuccess,
  setupAvailibilityFailure,

  bankAccountListRequest,
  bankAccountListSuccess,
  bankAccountListFailure,

  updateBankStatusRequest,
  updateBankStatusSuccess,
  updateBankStatusFailure,

  subscriptionDetailsRequest,
  subscriptionDetailsSuccess,
  subscriptionDetailsFailure,

  // cancel subscription
  cancelSubscriptionRequest,
  cancelSubscriptionSuccess,
  cancelSubscriptionFailure,
} = UserSlice.actions;

export default UserSlice.reducer;

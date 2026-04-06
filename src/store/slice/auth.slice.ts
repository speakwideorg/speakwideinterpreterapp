import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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
  onBoardingStatus:
  | 'profile_setup'
  | 'availability_setup'
  | 'add_payment_card'
  | 'add_bank_account'
  | 'select_subscription'
  | 'completed'
  | 'incomplete'
  | 'persona_validate';
  skippedBankAccount: boolean;
  device_token: string;
  /////////////////////// responses
  createAccountResponse: any;
  signinResponse: any;
  refreshTokenResponse: any;
  logoutResponse: any;
  forgotPasswordResponse: any;
  resendOtpResponse: any;
  verifyOtpResponse: any;
  forgetChangePasswordResponse: any;
  profileDetailsResponse: any;
  profileUpdateResponse: any;
  deleteAccountResponse: any;
  deleteDocumentResponse: any;
}

const initialState: initialStateInterface = {
  status: '',
  isLoading: false,
  token: '',
  refreshToken: '',
  userId: '',
  onBoardingStatus: 'incomplete',
  skippedBankAccount: false,
  device_token: '',
  /////////////////////// responses
  createAccountResponse: {},
  signinResponse: {},
  refreshTokenResponse: {},
  logoutResponse: {},
  forgotPasswordResponse: {},
  resendOtpResponse: {},
  verifyOtpResponse: {},
  forgetChangePasswordResponse: {},
  profileDetailsResponse: {},
  profileUpdateResponse: {},
  deleteAccountResponse: {},
  deleteDocumentResponse: {},
};

const AuthSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    //////////////////// reset
    resetAuthDefaults(state) {
      state.isLoading = false;
      state.status = '';
    },
    updateOnboardingStatus(state, action) {
      state.onBoardingStatus = action.payload;
      if (action.payload === 'completed') {
        state.skippedBankAccount = true;
      }
    },

    setTokenRefreshToken(state, action) {
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
    },
    //////////////////// create account / sign up
    createAccountRequest(
      state,
      action: {
        payload: {
          full_name: string;
          email: string;
          phone?: string;
          password: string;
          confirm_password: string;
          timeZone: string;
          deviceToken: string;
          deviceType: string;
        };
        type: string;
      },
    ) {
      state.isLoading = true;
      state.status = action.type;
    },
    createAccountSuccess(state, action: payload_interface) {
      state.isLoading = false;
      state.status = action.type;
      state.createAccountResponse = action?.payload?.data;
      // data store
      state.token = action.payload?.data?.token || '';
      state.refreshToken = action.payload?.data?.refresh_token || '';
      state.userId = action.payload?.data?.user?._id || '';
      state.onBoardingStatus = 'incomplete';
    },
    createAccountFailure(state, action: payload_interface) {
      state.isLoading = false;
      state.status = action.type;
      state.createAccountResponse = action?.payload?.data;
    },

    //////////////////// sign in
    signInRequest(
      state,
      action: {
        payload: {
          user_name: string;
          password: string;
        };
        type: string;
      },
    ) {
      state.isLoading = true;
      state.status = action.type;
    },
    signInSuccess(state, action: payload_interface) {
      state.isLoading = false;
      state.status = action.type;
      state.signinResponse = action?.payload?.data;
      // data store
      state.token = action?.payload?.token ?? '';
      state.refreshToken = action?.payload?.refresh_token ?? '';
      state.userId = action?.payload?.data?._id;
    },
    signInFailure(state, action: payload_interface) {
      state.isLoading = false;
      state.status = action.type;
      state.signinResponse = action?.payload?.data;
    },

    //////////////////// refresh token
    refreshTokenRequest(state, action: any) {
      state.isLoading = true;
      state.status = action.type;
    },
    refreshTokenSuccess(state, action: payload_interface) {
      state.isLoading = false;
      state.status = action.type;
      state.refreshTokenResponse = action?.payload?.data;
      // data store
      state.token = action?.payload?.data?.token;
      state.refreshToken = action?.payload?.data?.refreshToken;
    },
    refreshTokenFailure(state, action: payload_interface) {
      state.isLoading = false;
      state.status = action.type;
      state.refreshTokenResponse = action?.payload?.data;
      // data store
      state.token = '';
      state.refreshToken = '';
      state.userId = '';
    },

    //////////////////// logout
    logoutRequest(state, action) {
      state.isLoading = true;
      state.status = action.type;
    },
    logoutSuccess(state, action: payload_interface) {
      state.isLoading = false;
      state.status = action.type;
      state.logoutResponse = action?.payload?.data;

      // state.onBoardingStatus=""
    },
    logoutFailure(state, action: payload_interface) {
      state.isLoading = false;
      state.status = action.type;
      state.logoutResponse = action?.payload?.data;
    },


    deleteAccountRequest(state, action) {
      state.isLoading = true;
      state.status = action.type;
    },
    deleteAccountSuccess(state, action: payload_interface) {
      state.isLoading = false;
      state.status = action.type;
      state.deleteAccountResponse = action?.payload?.data;
    },
    deleteAccountFailure(state, action: payload_interface) {
      state.isLoading = false;
      state.status = action.type;
      state.deleteAccountResponse = action?.payload?.data;
    },

    //////////////////// forget password
    forgotPasswordRequest(state, action) {
      state.isLoading = true;
      state.status = action.type;
    },
    forgotPasswordSuccess(state, action: payload_interface) {
      state.isLoading = false;
      state.status = action.type;
      state.forgotPasswordResponse = action?.payload?.data;
    },
    forgotPasswordFailure(state, action: payload_interface) {
      state.isLoading = false;
      state.status = action.type;
      state.forgotPasswordResponse = action?.payload?.data;
    },

    //////////////////// forget password
    resendOtpRequest(state, action) {
      state.isLoading = true;
      state.status = action.type;
    },
    resendOtpSuccess(state, action: payload_interface) {
      state.isLoading = false;
      state.status = action.type;
      state.resendOtpResponse = action?.payload?.data;
    },
    resendOtpFailure(state, action: payload_interface) {
      state.isLoading = false;
      state.status = action.type;
      state.resendOtpResponse = action?.payload?.data;
    },

    //////////////////// verify otp
    verifyOtpRequest(state, action) {
      state.isLoading = true;
      state.status = action.type;
    },
    verifyOtpSuccess(state, action: payload_interface) {
      state.isLoading = false;
      state.status = action.type;
      state.verifyOtpResponse = action?.payload?.data;
    },
    verifyOtpFailure(state, action: payload_interface) {
      state.isLoading = false;
      state.status = action.type;
      state.verifyOtpResponse = action?.payload?.data;
    },

    //////////////////// forget change password
    forgetChangePasswordRequest(state, action) {
      state.isLoading = true;
      state.status = action.type;
    },
    forgetChangePasswordSuccess(state, action: payload_interface) {
      state.isLoading = false;
      state.status = action.type;
      state.forgetChangePasswordResponse = action?.payload?.data;
    },
    forgetChangePasswordFailure(state, action: payload_interface) {
      state.isLoading = false;
      state.status = action.type;
      state.forgetChangePasswordResponse = action?.payload?.data;
    },

    //////////////////// profile details
    profileDetailsRequest(state, action: PayloadAction) {
      state.isLoading = true;
      state.status = action.type;
    },
    // profileDetailsSuccess(state, action: payload_interface) {
    //   state.isLoading = false;
    //   state.status = action.type;

    //   console.log("action. payload in profile", action.payload)
    //   state.profileDetailsResponse = action?.payload?.data;
    //   state.userId = action?.payload?.data?._id;

    //   if (
    //     action.payload?.data?.isOnboardingComplete &&
    //     action.payload?.data?.isBankAccountAdded
    //   ) {
    //     state.onBoardingStatus = 'completed';
    //   } else if (action.payload?.data?.subscriptionDetails) {
    //     if (
    //       (navigationRef?.current?.getCurrentRoute() as any)?.name !==
    //       'AddBankAccount'
    //     ) {
    //       replace('AddBankAccount');
    //     }
    //   } else if (action.payload?.data?.isPaymentCardAdded) {
    //     console.log("hey all", action.payload?.data)
    //     // replace('SubscriptionSetUp');
    //   } else if (action.payload?.data?.isAvailabilityAdded) {
    //     replace('AddPaymentCard');
    //   } else if (
    //     action.payload?.data?.personaVerifyStatus === 'approved' ||
    //     action.payload?.data?.personaVerifyStatus === 'completed' ||
    //     action.payload?.data?.personaVerifyStatus === 'pending' //need to remove
    //   ) {
    //     replace('AvailabilitySetup');
    //   } else if (action.payload?.data?.isProfileCompleted) {
    //     replace('PersonaValidation');
    //   } else {
    //     replace('ProfileSetup');
    //   }
    // },
    // profileDetailsSuccess(state, action: payload_interface) {
    //   state.isLoading = false;
    //   state.status = action.type;

    //   state.profileDetailsResponse = action?.payload?.data;
    //   state.userId = action?.payload?.data?._id;

    //   // Set onboarding status only
    //   if (action.payload?.data?.isOnboardingComplete && action.payload?.data?.isBankAccountAdded) {
    //     state.onBoardingStatus = 'completed';
    //   } else {
    //     state.onBoardingStatus = 'incomplete';
    //   }
    // },

    profileDetailsSuccess(state, action: payload_interface) {
      state.isLoading = false;
      state.status = action.type;

      state.profileDetailsResponse = action?.payload?.data;
      state.userId = action?.payload?.data?._id;

      // just store flags
      const d = action.payload.data;

      if (d.isOnboardingComplete && d.isBankAccountAdded) {
        state.onBoardingStatus = 'completed';
      } else if (!d.isProfileCompleted) {
        state.onBoardingStatus = 'profile_setup';
      } else if (
        d.personaVerifyStatus !== 'approved' &&
        d.personaVerifyStatus !== 'completed'
      ) {
        state.onBoardingStatus = 'persona_validate';
      } else if (!d.isAvailabilityAdded) {
        state.onBoardingStatus = 'availability_setup';
      } else if (state.skippedBankAccount) {
        state.onBoardingStatus = 'completed';
      } else if (d.subscriptionDetails) {
        state.onBoardingStatus = 'add_bank_account';
      } else if (d.isPaymentCardAdded) {
        state.onBoardingStatus = 'select_subscription';
      } else {
        state.onBoardingStatus = 'add_payment_card';
      }
    },
    profileDetailsFailure(state, action: payload_interface) {
      state.isLoading = false;
      state.status = action.type;
      state.profileDetailsResponse = action?.payload?.data;
    },

    //////////////////// update profile
    profileUpdateRequest(state, action) {
      state.isLoading = true;
      state.status = action.type;
    },
    profileUpdateSuccess(state, action: payload_interface) {
      state.isLoading = false;
      state.status = action.type;
      state.profileUpdateResponse = action?.payload?.data;
    },
    profileUpdateFailure(state, action: payload_interface) {
      state.isLoading = false;
      state.status = action.type;
      state.profileUpdateResponse = action?.payload?.data;
    },

    //// delete documents
    deleteDocumentRequest(state, action) {
      state.isLoading = true;
      state.status = action.type;
    },
    deleteDocumentSuccess(state, action: payload_interface) {
      state.isLoading = false;
      state.status = action.type;
      state.deleteDocumentResponse = action?.payload?.data;
    },
    deleteDocumentFailure(state, action: payload_interface) {
      state.isLoading = false;
      state.status = action.type;
      state.deleteDocumentResponse = action?.payload?.data;
    },

    setDeviceToken(state, action: { payload: string }) {
      state.device_token = action.payload;
    },

  },
});

export const {
  updateOnboardingStatus, //need to delete

  resetAuthDefaults,

  setTokenRefreshToken,

  createAccountRequest,
  createAccountSuccess,
  createAccountFailure,

  signInRequest,
  signInSuccess,
  signInFailure,

  refreshTokenRequest,
  refreshTokenSuccess,
  refreshTokenFailure,

  logoutRequest,
  logoutSuccess,
  logoutFailure,

  deleteAccountRequest,
  deleteAccountSuccess,
  deleteAccountFailure,

  forgotPasswordRequest,
  forgotPasswordSuccess,
  forgotPasswordFailure,

  verifyOtpRequest,
  verifyOtpSuccess,
  verifyOtpFailure,

  resendOtpRequest,
  resendOtpSuccess,
  resendOtpFailure,

  forgetChangePasswordRequest,
  forgetChangePasswordSuccess,
  forgetChangePasswordFailure,

  profileDetailsRequest,
  profileDetailsSuccess,
  profileDetailsFailure,

  profileUpdateRequest,
  profileUpdateSuccess,
  profileUpdateFailure,

  // delete docuemtns
  deleteDocumentRequest,
  deleteDocumentSuccess,
  deleteDocumentFailure,

  setDeviceToken
} = AuthSlice.actions;

export default AuthSlice.reducer;

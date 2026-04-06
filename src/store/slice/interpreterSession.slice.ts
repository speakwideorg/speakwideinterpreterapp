import { createSlice } from '@reduxjs/toolkit';

export interface payload_interface {
  payload: { response: any;[key: string]: any };
  type: string;
}

interface AuthState {
  loading: boolean;
  status: string;
  // response
  getInterpreterSessionTokenResponse: any;
  getInterpreterListResponse: any;
  getSechudledSessionsResponse: any;
  getInterpreterDetailsResponse: any;
  getInterpreterMsgHistoryResponse: any;
  sendInterpreterMsgResponse: any;
  uploadInterpreterMessageFileResponse: any;
  acceptSessionResponse: any;
  declineSessionResponse: any;
  declineRequestedSessionResponse: any;
  sessionHistory: any;
  sessionUpdateApproveResponse: any;
  sessionUpdateRejectResponse: any;
  disputeListResponse: any;
  disputeDetailsResponse: any;
  disputeCreateResponse: any;
  disputeCategoryListResponse: any;
  disputeChatListResponse: any;
}

const initialState: AuthState = {
  loading: false,
  status: '',
  // response
  getInterpreterSessionTokenResponse: {},
  getInterpreterListResponse: {},
  getSechudledSessionsResponse: {},
  getInterpreterDetailsResponse: {},
  getInterpreterMsgHistoryResponse: {},
  sendInterpreterMsgResponse: {},
  uploadInterpreterMessageFileResponse: {},
  acceptSessionResponse: {},
  declineSessionResponse: {},
  declineRequestedSessionResponse: {},
  sessionHistory: {},
  sessionUpdateApproveResponse: {},
  sessionUpdateRejectResponse: {},
  disputeListResponse: {},
  disputeCreateResponse: {},
  disputeDetailsResponse: {},
  disputeCategoryListResponse: {},
  disputeChatListResponse: {},
};

const interpreterSessionSlice = createSlice({
  name: 'interpreterSession',
  initialState,
  reducers: {
    resetDefaults_interpreterSession(state) {
      state.loading = false;
      state.status = '';
    },
    resetInterpreterSessionToken(state) {
      state.getInterpreterSessionTokenResponse = {};
    },

    getInterpreterSessionTokenRequest(state, action) {
      state.loading = true;
      state.status = action.type;
    },
    getInterpreterSessionTokenSuccess(state, action: payload_interface) {
      state.loading = false;
      state.status = action.type;
      state.getInterpreterSessionTokenResponse = action?.payload?.response;
    },
    getInterpreterSessionTokenFailure(state, action: payload_interface) {
      state.loading = false;
      state.status = action.type;
      state.getInterpreterSessionTokenResponse = action?.payload?.response;
    },

    getInterpreterListRequest(state, action) {
      state.loading = true;
      state.status = action.type;
    },
    getInterpreterListSuccess(state, action: payload_interface) {
      state.loading = false;
      state.status = action.type;
      state.getInterpreterListResponse = action?.payload?.response;
    },

    getInterpreterListFailure(state, action: payload_interface) {
      state.loading = false;
      state.status = action.type;
      state.getInterpreterListResponse = action?.payload?.response;
    },

    // secheduled sessions all
    getInterpreterAllSecheduledRequest(state, action) {
      state.loading = true;
      state.status = action.type;
    },
    getInterpreterAllSecheduledSuccess(state, action: payload_interface) {
      state.loading = false;
      state.status = action.type;
      state.getSechudledSessionsResponse = action?.payload?.response;
    },
    getInterpreterAllSecheduledFailure(state, action: payload_interface) {
      state.loading = false;
      state.status = action.type;
      state.getSechudledSessionsResponse = action?.payload?.response;
    },
    // interpreter session details
    getInterpreterDetailsRequest(state, action) {
      state.loading = true;
      state.status = action.type;
    },
    getInterpreterDetailsSuccess(state, action: payload_interface) {
      state.loading = false;
      state.status = action.type;
      state.getInterpreterDetailsResponse = action?.payload?.response;
    },
    getInterpreterDetailsFailure(state, action: payload_interface) {
      state.loading = false;
      state.status = action.type;
      state.getInterpreterDetailsResponse = action?.payload?.response;
    },

    getInterpreterMsgHistoryRequest(state, action) {
      state.loading = true;
      state.status = action.type;
    },
    getInterpreterMsgHistorySuccess(state, action: payload_interface) {
      state.loading = false;
      state.status = action.type;
      state.getInterpreterMsgHistoryResponse = action?.payload?.response;
    },
    getInterpreterMsgHistoryFailure(state, action: payload_interface) {
      state.loading = false;
      state.status = action.type;
      state.getInterpreterMsgHistoryResponse = action?.payload?.response;
    },

    sendInterpreterMsgRequest(state, action) {
      state.loading = true;
      state.status = action.type;
    },
    sendInterpreterMsgSuccess(state, action: payload_interface) {
      state.loading = false;
      state.status = action.type;
      state.sendInterpreterMsgResponse = action?.payload?.response;
    },
    sendInterpreterMsgFailure(state, action: payload_interface) {
      state.loading = false;
      state.status = action.type;
      state.sendInterpreterMsgResponse = action?.payload?.response;
    },

    uploadInterpreterMessageFileRequest(state, action) {
      state.loading = true;
      state.status = action.type;
    },
    uploadInterpreterMessageFileSuccess(state, action: payload_interface) {
      state.loading = false;
      state.status = action.type;
      state.uploadInterpreterMessageFileResponse = action?.payload?.response;
    },
    uploadInterpreterMessageFileFailure(state, action: payload_interface) {
      state.loading = false;
      state.status = action.type;
      state.uploadInterpreterMessageFileResponse = action?.payload?.response;
    },
    // accept session
    acceptSessionRequest(state, action) {
      state.loading = true;
      state.status = action.type;
    },
    acceptSessionSuccess(state, action: payload_interface) {
      state.loading = false;
      state.status = action.type;
      state.acceptSessionResponse = action?.payload?.response;
    },
    acceptSessionFailure(state, action: payload_interface) {
      state.loading = false;
      state.status = action.type;
      state.acceptSessionResponse = action?.payload?.response;
    },
    // decline requested session
    declineRequestedSessionRequest(state, action) {
      state.loading = true;
      state.status = action.type;
    },
    declineRequestedSessionSuccess(state, action: payload_interface) {
      state.loading = false;
      state.status = action.type;
      state.declineRequestedSessionResponse = action?.payload?.response;
    },
    declineRequestedSessionFailure(state, action: payload_interface) {
      state.loading = false;
      state.status = action.type;
      state.declineRequestedSessionResponse = action?.payload?.response;
    },

    // decline session
    declineSessionRequest(state, action) {
      state.loading = true;
      state.status = action.type;
    },
    declineSessionSuccess(state, action: payload_interface) {
      state.loading = false;
      state.status = action.type;
      state.declineSessionResponse = action?.payload?.response;
    },
    declineSessionFailure(state, action: payload_interface) {
      state.loading = false;
      state.status = action.type;
      state.declineSessionResponse = action?.payload?.response;
    },
    //  session history
    getSessionListRequest(state, action) {
      state.loading = true;
      state.status = action.type;
    },
    getSessionListSuccess(state, action: payload_interface) {
      state.loading = false;
      state.status = action.type;
      state.sessionHistory = action?.payload?.response;
    },
    getSessionListFailure(state, action: payload_interface) {
      state.loading = false;
      state.status = action.type;
      state.sessionHistory = action?.payload?.response;
    },

    //  session update approve
    getSessionUpdateApproveRequest(state, action) {
      state.loading = true;
      state.status = action.type;
    },
    getSessionUpdateApproveSuccess(state, action: payload_interface) {
      state.loading = false;
      state.status = action.type;
      state.sessionUpdateApproveResponse = action?.payload?.response;
    },
    getSessionUpdateApproveFailure(state, action: payload_interface) {
      state.loading = false;
      state.status = action.type;
      state.sessionUpdateApproveResponse = action?.payload?.response;
    },

    //  session update reject
    getSessionUpdateRejectRequest(state, action) {
      state.loading = true;
      state.status = action.type;
    },
    getSessionUpdateRejectSuccess(state, action: payload_interface) {
      state.loading = false;
      state.status = action.type;
      state.sessionUpdateRejectResponse = action?.payload?.response;
    },
    getSessionUpdateRejectFailure(state, action: payload_interface) {
      state.loading = false;
      state.status = action.type;
      state.sessionUpdateRejectResponse = action?.payload?.response;
    },

    //  dispute list
    disputeListRequest(state, action) {
      state.loading = true;
      state.status = action.type;
    },
    disputeListSuccess(state, action: payload_interface) {
      state.loading = false;
      state.status = action.type;
      // If the saga provided a list_type, store the response keyed by that type
      const lt = action?.payload?.list_type;
      if (lt) {
        state.disputeListResponse = state.disputeListResponse || {};
        // store response per list type
        (state.disputeListResponse as any)[lt] = action?.payload?.response;
      } else {
        state.disputeListResponse = action?.payload?.response;
      }
    },
    disputeListFailure(state, action: payload_interface) {
      state.loading = false;
      state.status = action.type;
      const lt = action?.payload?.list_type;
      if (lt) {
        state.disputeListResponse = state.disputeListResponse || {};
        (state.disputeListResponse as any)[lt] = action?.payload?.response;
      } else {
        state.disputeListResponse = action?.payload?.response;
      }
    },

    //  dispute list
    disputeDetailsRequest(state, action) {
      state.loading = true;
      state.status = action.type;
    },
    disputeDetailsSuccess(state, action: payload_interface) {
      state.loading = false;
      state.status = action.type;
      state.disputeDetailsResponse = action?.payload?.response;

    },
    disputeDetailsFailure(state, action: payload_interface) {
      state.loading = false;
      state.status = action.type;
      state.disputeDetailsResponse = action?.payload?.response;
    },

    //  dispute create
    disputeCreateRequest(state, action) {
      state.loading = true;
      state.status = action.type;
    },
    disputeCreateSuccess(state, action: payload_interface) {
      state.loading = false;
      state.status = action.type;
      state.disputeCreateResponse = action?.payload?.response;
    },
    disputeCreateFailure(state, action: payload_interface) {
      state.loading = false;
      state.status = action.type;
      state.disputeCreateResponse = action?.payload?.response;
    },

    //  dispute list category
    disputeListCategoryRequest(state, action) {
      state.loading = true;
      state.status = action.type;
    },
    disputeListCategorySuccess(state, action: payload_interface) {
      state.loading = false;
      state.status = action.type;
      state.disputeCategoryListResponse = action?.payload?.response;
    },
    disputeListCategoryFailure(state, action: payload_interface) {
      state.loading = false;
      state.status = action.type;
      state.disputeCategoryListResponse = action?.payload?.response;
    },

    //  dispute chat list
    disputeChatListRequest(state, action) {
      state.loading = true;
      state.status = action.type;
    },
    disputeChatListSuccess(state, action: payload_interface) {
      state.loading = false;
      state.status = action.type;
      state.disputeChatListResponse = action?.payload?.response;
    },
    disputeChatListFailure(state, action: payload_interface) {
      state.loading = false;
      state.status = action.type;
      state.disputeChatListResponse = action?.payload?.response;
    },
  },
});

export const {
  resetDefaults_interpreterSession,
  resetInterpreterSessionToken,
  // session token
  getInterpreterSessionTokenRequest,
  getInterpreterSessionTokenSuccess,
  getInterpreterSessionTokenFailure,
  // interpreter session
  getInterpreterListRequest,
  getInterpreterListSuccess,
  getInterpreterListFailure,

  // secheduled sessions all
  getInterpreterAllSecheduledRequest,
  getInterpreterAllSecheduledSuccess,
  getInterpreterAllSecheduledFailure,

  // interpreter details
  getInterpreterDetailsRequest,
  getInterpreterDetailsSuccess,
  getInterpreterDetailsFailure,

  // interpreter message history
  getInterpreterMsgHistoryRequest,
  getInterpreterMsgHistorySuccess,
  getInterpreterMsgHistoryFailure,
  // interpreter message send
  sendInterpreterMsgRequest,
  sendInterpreterMsgSuccess,
  sendInterpreterMsgFailure,
  // interpreter file upload
  uploadInterpreterMessageFileRequest,
  uploadInterpreterMessageFileSuccess,
  uploadInterpreterMessageFileFailure,

  // accept session
  acceptSessionRequest,
  acceptSessionSuccess,
  acceptSessionFailure,

  // decline session
  declineSessionRequest,
  declineSessionSuccess,
  declineSessionFailure,

  // decline requested sessions
  declineRequestedSessionRequest,
  declineRequestedSessionSuccess,
  declineRequestedSessionFailure,

  // session history
  getSessionListRequest,
  getSessionListSuccess,
  getSessionListFailure,

  // session update approve
  getSessionUpdateApproveRequest,
  getSessionUpdateApproveSuccess,
  getSessionUpdateApproveFailure,

  // session update reject
  getSessionUpdateRejectRequest,
  getSessionUpdateRejectSuccess,
  getSessionUpdateRejectFailure,


  // dispute list
  disputeListRequest,
  disputeListSuccess,
  disputeListFailure,

  // dispute details 
  disputeDetailsRequest,
  disputeDetailsSuccess,
  disputeDetailsFailure,

  // dispute create
  disputeCreateRequest,
  disputeCreateSuccess,
  disputeCreateFailure,

  // dispute category list
  disputeListCategoryRequest,
  disputeListCategorySuccess,
  disputeListCategoryFailure,

  // dispute chat list
  disputeChatListRequest,
  disputeChatListSuccess,
  disputeChatListFailure,
} = interpreterSessionSlice.actions;

export default interpreterSessionSlice.reducer;

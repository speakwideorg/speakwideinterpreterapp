import { createSlice } from '@reduxjs/toolkit';

interface payload_interface {
    payload: { response: any };
    type: string;
}

interface initialStateInterface {
    status: string;
    loading: boolean;

    // existing
    notificationListResponse: any;

    // new
    unreadCountResponse: any;
    unreadListResponse: any;
    notificationDetailsResponse: any;
    notificationDeleteResponse: any;
    notificationMarkReadResponse: any;
    notificationMarkAllReadResponse: any;
    notificationDeleteAllResponse: any;
}

const initialState: initialStateInterface = {
    status: '',
    loading: false,

    // existing
    notificationListResponse: {},

    // new
    unreadCountResponse: {},
    unreadListResponse: {},
    notificationDetailsResponse: {},
    notificationDeleteResponse: {},
    notificationMarkReadResponse: {},
    notificationMarkAllReadResponse: {},
    notificationDeleteAllResponse: {},
};

const NotificationSlice = createSlice({
    name: 'notification',
    initialState,
    reducers: {
        //////////////////// reset
        resetDefaults_default(state) {
            state.loading = false;
            state.status = '';
        },

        //////////////////////////////////////////////////////////////////
        //////////////////// Notification List (existing)
        //////////////////////////////////////////////////////////////////
        notificationListRequest(state, action) {
            state.loading = true;
            state.status = action.type;
        },
        notificationListSuccess(state, action: payload_interface) {
            state.loading = false;
            state.status = action.type;
            state.notificationListResponse = action?.payload?.response;
        },
        notificationListFailure(state, action: payload_interface) {
            state.loading = false;
            state.status = action.type;
            state.notificationListResponse = action?.payload?.response;
        },

        //////////////////////////////////////////////////////////////////
        //////////////////// Unread Count
        //////////////////////////////////////////////////////////////////
        unreadCountRequest(state, action) {
            state.loading = true;
            state.status = action.type;
        },
        unreadCountSuccess(state, action: payload_interface) {
            state.loading = false;
            state.status = action.type;
            state.unreadCountResponse = action?.payload?.response;
        },
        unreadCountFailure(state, action: payload_interface) {
            state.loading = false;
            state.status = action.type;
            state.unreadCountResponse = action?.payload?.response;
        },

        //////////////////////////////////////////////////////////////////
        //////////////////// Unread List
        //////////////////////////////////////////////////////////////////
        unreadListRequest(state, action) {
            state.loading = true;
            state.status = action.type;
        },
        unreadListSuccess(state, action: payload_interface) {
            state.loading = false;
            state.status = action.type;
            state.unreadListResponse = action?.payload?.response;
        },
        unreadListFailure(state, action: payload_interface) {
            state.loading = false;
            state.status = action.type;
            state.unreadListResponse = action?.payload?.response;
        },

        //////////////////////////////////////////////////////////////////
        //////////////////// Notification Details
        //////////////////////////////////////////////////////////////////
        notificationDetailsRequest(state, action) {
            state.loading = true;
            state.status = action.type;
        },
        notificationDetailsSuccess(state, action: payload_interface) {
            state.loading = false;
            state.status = action.type;
            state.notificationDetailsResponse = action?.payload?.response;
        },
        notificationDetailsFailure(state, action: payload_interface) {
            state.loading = false;
            state.status = action.type;
            state.notificationDetailsResponse = action?.payload?.response;
        },

        //////////////////////////////////////////////////////////////////
        //////////////////// Delete Notification
        //////////////////////////////////////////////////////////////////
        notificationDeleteRequest(state, action) {
            state.loading = true;
            state.status = action.type;
        },
        notificationDeleteSuccess(state, action: payload_interface) {
            state.loading = false;
            state.status = action.type;
            state.notificationDeleteResponse = action?.payload?.response;
        },
        notificationDeleteFailure(state, action: payload_interface) {
            state.loading = false;
            state.status = action.type;
            state.notificationDeleteResponse = action?.payload?.response;
        },

        //////////////////////////////////////////////////////////////////
        //////////////////// Mark as Read (single)
        //////////////////////////////////////////////////////////////////
        notificationMarkReadRequest(state, action) {
            state.loading = true;
            state.status = action.type;
        },
        notificationMarkReadSuccess(state, action: payload_interface) {
            state.loading = false;
            state.status = action.type;
            state.notificationMarkReadResponse = action?.payload?.response;
        },
        notificationMarkReadFailure(state, action: payload_interface) {
            state.loading = false;
            state.status = action.type;
            state.notificationMarkReadResponse = action?.payload?.response;
        },

        //////////////////////////////////////////////////////////////////
        //////////////////// Mark All Read
        //////////////////////////////////////////////////////////////////
        notificationMarkAllReadRequest(state, action) {
            state.loading = true;
            state.status = action.type;
        },
        notificationMarkAllReadSuccess(state, action: payload_interface) {
            state.loading = false;
            state.status = action.type;
            state.notificationMarkAllReadResponse = action?.payload?.response;
        },
        notificationMarkAllReadFailure(state, action: payload_interface) {
            state.loading = false;
            state.status = action.type;
            state.notificationMarkAllReadResponse = action?.payload?.response;
        },

        //////////////////////////////////////////////////////////////////
        //////////////////// Delete All Notifications
        //////////////////////////////////////////////////////////////////
        notificationDeleteAllRequest(state, action) {
            state.loading = true;
            state.status = action.type;
        },
        notificationDeleteAllSuccess(state, action: payload_interface) {
            state.loading = false;
            state.status = action.type;
            state.notificationDeleteAllResponse = action?.payload?.response;
        },
        notificationDeleteAllFailure(state, action: payload_interface) {
            state.loading = false;
            state.status = action.type;
            state.notificationDeleteAllResponse = action?.payload?.response;
        },
    },
});

export const {
    resetDefaults_default,

    // noti listing
    notificationListRequest,
    notificationListSuccess,
    notificationListFailure,

    // unread count
    unreadCountRequest,
    unreadCountSuccess,
    unreadCountFailure,

    // unread list
    unreadListRequest,
    unreadListSuccess,
    unreadListFailure,

    // noti details
    notificationDetailsRequest,
    notificationDetailsSuccess,
    notificationDetailsFailure,

    // noti delete
    notificationDeleteRequest,
    notificationDeleteSuccess,
    notificationDeleteFailure,

    // signle noti mark as read
    notificationMarkReadRequest,
    notificationMarkReadSuccess,
    notificationMarkReadFailure,

    // noti mark as all read
    notificationMarkAllReadRequest,
    notificationMarkAllReadSuccess,
    notificationMarkAllReadFailure,

    // noti all delete
    notificationDeleteAllRequest,
    notificationDeleteAllSuccess,
    notificationDeleteAllFailure,
} = NotificationSlice.actions;

export default NotificationSlice.reducer;

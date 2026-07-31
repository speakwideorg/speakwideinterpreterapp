import axios from 'axios';
import NetInfo from '@react-native-community/netinfo';
import { API, URL_LIST } from '../constants';
import { store } from '@app/store';
import {
  logoutRequest,
  setTokenRefreshToken,
} from '@app/store/slice/auth.slice';
import Storage from '../storage';

export const instance = axios.create({
  baseURL: URL_LIST.api_base_url,
  headers: {
    'Content-Type': 'application/json',
  },
});

const refreshTokenApiCall = async () => {
  const { auth } = API;

  const { token, refreshToken } = store.getState().auth;

  // If user is already logged out or has no refresh token, do not trigger redundant logouts
  if (!refreshToken) {
    return null;
  }

  try {
    const response = await axios.post(
      `${URL_LIST.api_base_url}/${auth.refreshToken}`,
      {
        refreshToken: refreshToken,
      },
    );

    const newToken = response.data.token;

    store.dispatch(
      setTokenRefreshToken({
        token: response.data.token,
        refreshToken: response.data.refresh_token,
      }),
    );

    return newToken;
  } catch (error: any) {
    // Only dispatch logout if user was currently logged in
    if (token || refreshToken) {
      Storage.clearAll();
      store.dispatch(logoutRequest({}));
    }
    throw error;
  }
};

instance.interceptors.request.use(async config => {
  const state = await NetInfo.fetch();

  if (!state.isConnected) {
    throw new axios.Cancel(
      'No internet connection. Please connect to the internet.',
    );
  }

  const { token } = store.getState().auth;

  if (token && config.headers) {
    config.headers['x-access-token'] = token;
  }

  return config;
});

instance.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // Do NOT attempt token refresh for auth endpoints (signin, signup, logout)
    const isAuthEndpoint =
      originalRequest?.url?.includes(API.auth.signin) ||
      originalRequest?.url?.includes(API.auth.create_account) ||
      originalRequest?.url?.includes(API.auth.logout);

    // Check if the error is due to an expired token and the request hasn't already been retried
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      !isAuthEndpoint
    ) {
      originalRequest._retry = true;

      try {
        // Access token expired — silently refresh instead of logging out, so the
        // interpreter stays signed in until they log out themselves.
        const newToken = await refreshTokenApiCall();

        // If refresh could not produce a new token, reject original request.
        if (!newToken) {
          return Promise.reject(error);
        }

        // Update the token in the headers and retry the original request
        instance.defaults.headers.common['x-access-token'] = newToken;
        originalRequest.headers['x-access-token'] = newToken;

        return instance(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

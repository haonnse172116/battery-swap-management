import { store } from '../redux/store';

export const getAccessToken = () => {
  return store.getState().auth.accessToken;
};
export const getAuthToken = () => {
  const state = store.getState().auth;
  return state.accessToken || state.tempToken;
};
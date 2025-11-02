import { store } from '../redux/store';

export const getAccessToken = () => {
  return store.getState().auth.accessToken;
};
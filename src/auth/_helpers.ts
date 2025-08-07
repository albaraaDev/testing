import { User as Auth0UserModel } from '@auth0/auth0-spa-js';

import { getData, setData } from '@/utils';
import { type AuthModel } from './_models';

const AUTH_LOCAL_STORAGE_KEY = `${import.meta.env.VITE_APP_NAME}-auth-v${
  import.meta.env.VITE_APP_VERSION
}`;

const isTokenExpired = (auth: AuthModel): boolean => {
  if (!auth.issued_at || !auth.expires_in) {
    return true; // Consider expired if we don't have timing info
  }

  const now = Date.now();
  const expirationTime = auth.issued_at + auth.expires_in * 1000; // Convert seconds to milliseconds

  return now >= expirationTime;
};

const getAuth = (): AuthModel | undefined => {
  try {
    const auth = getData(AUTH_LOCAL_STORAGE_KEY) as AuthModel | undefined;

    if (auth) {
      // Check if token is expired
      if (isTokenExpired(auth)) {
        // Token is expired, remove it and redirect to login
        removeAuth();
        window.location.href = '/auth/login';
        return undefined;
      }
      return auth;
    } else {
      return undefined;
    }
  } catch (error) {
    console.error('AUTH LOCAL STORAGE PARSE ERROR', error);
  }
};

const setAuth = (auth: AuthModel | Auth0UserModel) => {
  // Add timestamp when storing the token
  const authWithTimestamp = {
    ...auth,
    issued_at: Date.now()
  };
  setData(AUTH_LOCAL_STORAGE_KEY, authWithTimestamp);
};

const removeAuth = () => {
  if (!localStorage) {
    return;
  }

  try {
    localStorage.removeItem(AUTH_LOCAL_STORAGE_KEY);
  } catch (error) {
    console.error('AUTH LOCAL STORAGE REMOVE ERROR', error);
  }
};

export function setupAxios(axios: any) {
  axios.defaults.headers.Accept = 'application/json';
  axios.interceptors.request.use(
    (config: { headers: { Authorization: string } }) => {
      const auth = getAuth();

      if (auth?.access_token) {
        config.headers.Authorization = `Bearer ${auth.access_token}`;
      }

      return config;
    },
    async (err: any) => await Promise.reject(err)
  );
}

export { AUTH_LOCAL_STORAGE_KEY, getAuth, removeAuth, setAuth };

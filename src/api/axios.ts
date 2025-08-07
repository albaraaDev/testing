import axios from 'axios';
import * as authHelper from '../auth/_helpers';
import { getData } from '../utils';
import { TLanguage } from '../i18n';

const I18N_CONFIG_KEY = 'i18nConfig';

const instance = axios.create({
  baseURL: import.meta.env.VITE_APP_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

const getCurrentLanguageCode = (): string => {
  const currentLanguage = getData(I18N_CONFIG_KEY) as TLanguage | undefined;
  return currentLanguage?.code || 'en';
};

instance.interceptors.request.use(
  (config) => {
    const token = authHelper.getAuth()?.access_token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const languageCode = getCurrentLanguageCode();
    config.headers['Accept-Language'] = languageCode;

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const statusRangeMin = 200;
const statusRangeMax = 299;
const isStatusInRange = (status: number): boolean => {
  return status >= statusRangeMin && status <= statusRangeMax;
};
instance.interceptors.response.use(
  (response) => {
    if (response.data && response.data.success === false && !isStatusInRange(response.status)) {
      return Promise.reject({
        message: response.data.message,
        response: response.data
      });
    }
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export { instance as axios };

import '@/components/keenicons/assets/duotone/style.css';
import '@/components/keenicons/assets/outline/style.css';
import '@/components/keenicons/assets/filled/style.css';
import '@/components/keenicons/assets/solid/style.css';
import './css/styles.css';

import axios from 'axios';
import ReactDOM from 'react-dom/client';

import { App } from './App';
import { setupAxios } from './auth';
import { ProvidersWrapper } from './providers';
import countries from 'i18n-iso-countries';
import en from 'i18n-iso-countries/langs/en.json';
import tr from 'i18n-iso-countries/langs/tr.json';
import ar from 'i18n-iso-countries/langs/ar.json';
import { getDomainConfig } from './config/domainConfig';
import { setFavicons } from './config/setFavIcons';

countries.registerLocale(en);
countries.registerLocale(tr);
countries.registerLocale(ar);

/**
 * Inject interceptors for axios.
 *
 * @see https://github.com/axios/axios#interceptors
 */
setupAxios(axios);
const { logoname } = getDomainConfig();
setFavicons(logoname);

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  // <React.StrictMode>
  <ProvidersWrapper>
    <App />
  </ProvidersWrapper>
  // </React.StrictMode>
);

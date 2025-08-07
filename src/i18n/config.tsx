import { toAbsoluteUrl } from '@/utils';
import arMessages from './messages/ar.json';
import enMessages from './messages/en.json';
import trMessages from './messages/tr.json';
import { type TLanguage } from './types.d';

const I18N_MESSAGES = {
  en: enMessages,
  ar: arMessages,
  tr: trMessages
};

const I18N_CONFIG_KEY = 'i18nConfig';

const I18N_LANGUAGES: readonly TLanguage[] = [
  {
    label: 'English',
    code: 'en',
    direction: 'ltr',
    flag: toAbsoluteUrl('/media/flags/united-states.svg'),
    messages: I18N_MESSAGES.en
  },
  {
    label: 'العربية / Arabic',
    code: 'ar',
    direction: 'rtl',
    flag: toAbsoluteUrl('/media/flags/saudi-arabia.svg'),
    messages: I18N_MESSAGES.ar
  },
  {
    label: 'Türkçe / Turkish',
    code: 'tr',
    direction: 'ltr',
    flag: toAbsoluteUrl('/media/flags/turkey.svg'),
    messages: I18N_MESSAGES.tr
  }
];

const I18N_DEFAULT_LANGUAGE: TLanguage = I18N_LANGUAGES[0];

export { I18N_CONFIG_KEY, I18N_DEFAULT_LANGUAGE, I18N_LANGUAGES, I18N_MESSAGES };

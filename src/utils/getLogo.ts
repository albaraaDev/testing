import { getDomainConfig } from '@/config/domainConfig';
import { toAbsoluteUrl } from './Assets';

const getLogoNamed = (name: string): string => {
  const config = getDomainConfig();
  return toAbsoluteUrl(`/media/app/logos/${config.logoname}/${name}`);
};
export const getMiniLogo = (): string => getLogoNamed(`mini-logo.svg`);
export const getLogo = (): string => getLogoNamed(`logo.svg`);
export const getDefaultLogo = (): string => getLogoNamed(`default-logo.svg`);
export const getDefaultDarkLogo = (): string => getLogoNamed(`default-logo-dark.svg`);

type LogoName = 'hedeftakippro' | 'electrotaxi';

export const domainConfigs: Record<string, { logoname: LogoName }> = {
  localhost: {
    logoname: 'hedeftakippro'
  },
  'gps.taxielectro.com': {
    logoname: 'electrotaxi'
  }
};

export const getDomainConfig = () => {
  const domain = window.location.hostname;
  return domainConfigs[domain] || { logoname: 'hedeftakippro' };
};

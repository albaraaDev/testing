type AppType = 'hedeftakip' | 'rentacar';
const appType = import.meta.env.VITE_APP_TYPE as AppType;
export const isAppHedefTakip = appType === 'hedeftakip';
export const isAppRentACar = appType === 'rentacar';

import { PropsWithChildren } from 'react';

import { AuthProvider } from '@/auth/providers/JWTProvider';
import {
  LayoutProvider,
  LoadersProvider,
  MenusProvider,
  SettingsProvider,
  SnackbarProvider,
  TranslationProvider
} from '@/providers';
import { HelmetProvider } from 'react-helmet-async';
import { MqttProvider } from './MqttProvider';
import { DeviceProvider } from './DeviceProvider';
import { DialogsProvider } from '@toolpad/core/useDialogs';
import { QueryProvider } from './QueryProvider';

const ProvidersWrapper = ({ children }: PropsWithChildren) => {
  return (
    <QueryProvider>
      <AuthProvider>
        <SettingsProvider>
          <TranslationProvider>
            <SnackbarProvider>
              <DialogsProvider>
                <HelmetProvider>
                  <LayoutProvider>
                    <LoadersProvider>
                      <DeviceProvider>
                        <MqttProvider>
                          <MenusProvider>{children}</MenusProvider>
                        </MqttProvider>
                      </DeviceProvider>
                    </LoadersProvider>
                  </LayoutProvider>
                </HelmetProvider>
              </DialogsProvider>
            </SnackbarProvider>
          </TranslationProvider>
        </SettingsProvider>
      </AuthProvider>
    </QueryProvider>
  );
};

export { ProvidersWrapper };

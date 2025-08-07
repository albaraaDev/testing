import { SolidSnackbar } from '@/components/snackbar';
import { SnackbarProvider as CustomSnackbarProvider } from 'notistack';
import { type PropsWithChildren } from 'react';
import { useLanguage } from './TranslationProvider';

const SnackbarProvider = ({ children }: PropsWithChildren) => {
  const { isRTL } = useLanguage();
  return (
    <CustomSnackbarProvider
      autoHideDuration={2000}
      maxSnack={3}
      anchorOrigin={{ vertical: 'bottom', horizontal: isRTL() ? 'right' : 'left' }}
      Components={{
        solid: SolidSnackbar
      }}
    >
      {children}
    </CustomSnackbarProvider>
  );
};

export { SnackbarProvider };

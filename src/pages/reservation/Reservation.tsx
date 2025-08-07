import { Container } from '@/components/container';
import { ReservationPage } from './index.ts';
import { ExportLoadingProvider } from '../reports/context/ExportLoadingContext.tsx';

const Reservations = () => {
  return (
    <ExportLoadingProvider>
      <Container className="h-full">
        <ReservationPage />
      </Container>
    </ExportLoadingProvider>
  );
};

export { Reservations };

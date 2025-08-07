import { Container } from '@/components/container';
import { CustomerPage } from './index.ts';
import { ExportLoadingProvider } from '../reports/context/ExportLoadingContext.tsx';

const Customers = () => {
  return (
    <ExportLoadingProvider>
      <Container className="h-full">
        <CustomerPage />
      </Container>
    </ExportLoadingProvider>
  );
};

export { Customers };

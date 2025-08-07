import { MonitoringProvider } from './providers/MonitoringProvider';
import { MonitoringMap } from './MonitoringMap';

const MonitoringPage = () => {
  return (
    <MonitoringProvider>
      <MonitoringMap />
    </MonitoringProvider>
  );
};

export { MonitoringPage };

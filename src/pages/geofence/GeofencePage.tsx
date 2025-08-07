import { GeofenceProvider } from './providers/GeofenceContext';
import { GeofenceMap } from './GeofenceMap';

const GeofencePage = () => {
  return (
    <div className="size-full">
      <GeofenceProvider>
        <GeofenceMap />
      </GeofenceProvider>
    </div>
  );
};

export { GeofencePage };

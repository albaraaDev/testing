import { General, Device } from './blocks';
import { GeofenceDTO } from '@/api/geofence';

export interface AddGeofencePageProps {
  geofence?: GeofenceDTO;
}

const AddGeofencePage = ({ geofence }: AddGeofencePageProps) => {
  return (
    <div className="flex flex-col gap-[30px] mx-auto">
      <div>
        <General geofence={geofence} />
      </div>
      <div>
        <Device geofence={geofence} />
      </div>
    </div>
  );
};

export { AddGeofencePage };

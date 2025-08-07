import AppMap from '@/components/AppMap';
import { toAbsoluteUrl } from '@/utils';
import L from 'leaflet';
import { useMemo, useCallback, useEffect } from 'react';
import { RotatableMarker } from '../monitoring/blocks/RotatableMarker';
import { useMap } from 'react-leaflet';

interface MapProps {
  location?: {
    lat: number;
    lng: number;
  };
  direction?: number;
  online?: boolean;
  engineStatus?: boolean;
  hidden?: boolean;
}
const Map = ({ location, direction, online, engineStatus, hidden = false }: MapProps) => {
  const icon = useMemo(
    () => ({
      green: L.icon({
        iconUrl: toAbsoluteUrl('/media/icons/car-marker-green.png'),
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      }),
      red: L.icon({
        iconUrl: toAbsoluteUrl('/media/icons/car-marker-red.png'),
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      }),
      gray: L.icon({
        iconUrl: toAbsoluteUrl('/media/icons/car-marker-gray.png'),
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      })
    }),
    []
  );

  const getIcon = useCallback(() => {
    if (!online) {
      return icon.gray;
    }

    if (engineStatus) {
      return icon.green;
    }

    return icon.red;
  }, [engineStatus, icon.gray, icon.green, icon.red, online]);
  if (!location || !direction) {
    return (
      <div className="w-full h-full rounded-lg overflow-hidden shadow-lg">
        <AppMap zoom={13} dragging={false} mapControlSize={hidden ? 'hidden' : 'small'} />
      </div>
    );
  }
  return (
    <div className="w-full h-full rounded-lg overflow-hidden shadow-lg">
      <AppMap
        center={[location.lat, location.lng]}
        zoom={13}
        dragging={false}
        mapControlSize={hidden ? 'hidden' : 'small'}
      >
        <RotatableMarker
          position={[location.lat, location.lng]}
          rotationAngle={direction}
          icon={getIcon()}
        />
        <Center location={[location.lat, location.lng]} />
      </AppMap>
    </div>
  );
};

export default Map;

const Center = ({ location }: { location: [number, number] }) => {
  const map = useMap();

  useEffect(() => {
    map.flyTo(location);
  }, [location, map]);

  return <></>;
};

import { ReactNode, RefAttributes } from 'react';
import { Map as LeafletMap } from 'leaflet';
import { AttributionControl, MapContainer, MapContainerProps, TileLayer } from 'react-leaflet';
import clsx from 'clsx';
import { ZoomControl } from '@/pages/monitoring/blocks/ZoomControl';
import { OtherControls } from '@/pages/monitoring/blocks/OtherControls';
import { MapControls } from '@/pages/monitoring/blocks/MapControls';
import CurrentLocationMarker from './CurrentLocationMarker';
import { LayerProvider, useLayer } from './contexts/LayerProvider';

const ProvidedTileLayer = () => {
  const { layerUrl, attribution } = useLayer();

  return <TileLayer url={layerUrl} attribution={attribution} />;
};

interface AppMapProps extends MapContainerProps {
  mapControls?: ReactNode;
  mapControlSize?: 'small' | 'large' | 'hidden';
}

const AppMap = ({
  className,
  children,
  mapControls,
  mapControlSize,
  ...props
}: AppMapProps & RefAttributes<LeafletMap>) => {
  return (
    <MapContainer
      center={[38.9637, 35.2433]}
      zoom={7}
      className={clsx('size-full [direction:ltr]', className)}
      zoomControl={false}
      attributionControl={false}
      minZoom={3}
      {...props}
    >
      <LayerProvider>
        <ProvidedTileLayer />
        {mapControlSize !== 'hidden' && <AttributionControl prefix="Leaflet" />}
        <MapControls size={mapControlSize}>
          <ZoomControl />
          <OtherControls />
          {mapControls}
        </MapControls>
        <CurrentLocationMarker />
        {children}
      </LayerProvider>
    </MapContainer>
  );
};

export default AppMap;

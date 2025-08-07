import React, { useState } from 'react';
import { Marker, Circle, useMapEvent } from 'react-leaflet';
import L, { LatLngExpression } from 'leaflet';

const CurrentLocationMarker = () => {
  const [position, setPosition] = useState<LatLngExpression | null>(null);
  const [accuracy, setAccuracy] = useState<number>(0);

  // Listen for locationfound events to update position and accuracy
  useMapEvent('locationfound', (e) => {
    setPosition(e.latlng);
    setAccuracy(e.accuracy);
  });
  useMapEvent('locationerror', () => {
    setPosition(null);
    setAccuracy(0);
  });

  // Define a custom DivIcon styled like Google's blue dot
  const blueDotIcon = L.divIcon({
    html: '<div style="background: #4285F4; width: 12px; height: 12px; border: 2px solid white; border-radius: 50%; margin: 2px;"></div>',
    className: '',
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  });

  if (!position) return null;

  return (
    <>
      <Marker position={position} icon={blueDotIcon} />
      <Circle
        center={position}
        radius={accuracy}
        pathOptions={{ color: '#4285F4', opacity: 0.3, fillOpacity: 0.1 }}
      />
    </>
  );
};

export default CurrentLocationMarker;

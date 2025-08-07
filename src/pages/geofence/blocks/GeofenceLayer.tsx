import { useMap } from 'react-leaflet';
import 'leaflet-rotatedmarker';
import L from 'leaflet';
import { useGeofenceContext } from '../providers/GeofenceContext';
import { useEffect } from 'react';
import { useLanguage } from '@/i18n';

export const GeofenceLayer = () => {
  const map = useMap();
  const { isRTL } = useLanguage();
  const { selectedGeofence } = useGeofenceContext();

  useEffect(() => {
    if (selectedGeofence?.type === 'circle') {
      let circle: L.Circle;
      const center = selectedGeofence?.center;
      if (center) {
        circle = L.circle(
          { lat: center.latitude, lng: center.longitude },
          {
            radius: selectedGeofence.radius ?? 0
          }
        );
        circle.addTo(map);
        map.flyToBounds(circle.getBounds(), {
          ...(isRTL()
            ? { paddingTopLeft: [100, 20], paddingBottomRight: [300, 20] }
            : { paddingTopLeft: [300, 20], paddingBottomRight: [100, 20] }),
          duration: 3
        });
      }
      return () => {
        if (circle) {
          map.removeLayer(circle);
        }
      };
    }

    if (selectedGeofence?.type === 'polygon') {
      let polygon: L.Polygon;
      const positions = selectedGeofence?.geom;
      if (positions) {
        polygon = L.polygon(positions.map((pos) => [pos.latitude, pos.longitude]));
        polygon.addTo(map);
        map.flyToBounds(polygon.getBounds(), {
          ...(isRTL()
            ? { paddingTopLeft: [100, 20], paddingBottomRight: [300, 20] }
            : { paddingTopLeft: [300, 20], paddingBottomRight: [100, 20] }),
          duration: 3
        });
      }
      return () => {
        if (polygon) {
          map.removeLayer(polygon);
        }
      };
    }

    return () => {};
  }, [selectedGeofence, map, isRTL]);

  return null;
};

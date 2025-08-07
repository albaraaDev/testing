import { Tooltip, useMap } from 'react-leaflet';
import 'leaflet-rotatedmarker';
import { toAbsoluteUrl } from '@/utils';
import L from 'leaflet';
import { useMonitoringProvider } from '../providers/MonitoringProvider';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { VehicleLocation } from '@/api/cars';
import { RotatableMarker } from './RotatableMarker';
import { CarPlate } from '@/pages/dashboards/blocks/CarPlate';

export const CarsLayer = () => {
  const map = useMap();
  const [firstLoad, setFirstLoad] = useState(true);
  const { locations, selectedLocation, setSelectedLocation, showImei } = useMonitoringProvider();

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

  const getIcon = useCallback(
    (location: VehicleLocation) => {
      if (!location.online) {
        return icon.gray;
      }

      if (location.status.engineStatus) {
        return icon.green;
      }

      return icon.red;
    },
    [icon.gray, icon.green, icon.red]
  );

  useEffect(() => {
    if (!selectedLocation) {
      if (firstLoad) {
        setFirstLoad(false);
        return;
      }
      map.zoomOut(7, { animate: true });
      return;
    }

    map.flyTo([selectedLocation.lat, selectedLocation.long], 16, {
      animate: true
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, selectedLocation]);

  return (
    <MarkerClusterGroup
      key={showImei ? 'show-imei' : 'hide-imei'}
      chunkedLoading
      removeOutsideVisibleBounds
      disableClusteringAtZoom={12}
      animate={false}
      spiderfyOnMaxZoom={false}
      spiderfyOnEveryZoom
      zoomToBoundsOnClick={false}
      spiderfyDistanceMultiplier={4}
      spiderfyShapePositions={(count, centerPt) => {
        // Draw circles and keep increasing the radius until all markers are inside the circle
        var distance = 100;
        var increaseOn = 5;
        var angleStep = (2 * Math.PI) / increaseOn;
        var iterations = 0;
        var currentIteration = 0;
        const positions = [];

        for (let i = 0; i < count; i++) {
          const angle = i * angleStep + iterations * (Math.PI / 4);
          const pos = L.point(
            centerPt.x + distance * Math.cos(angle),
            centerPt.y + distance * Math.sin(angle)
          );
          positions.push(pos);
          currentIteration++;
          if (increaseOn === currentIteration) {
            currentIteration = 0;
            distance += 125;
            increaseOn *= 2;
            angleStep = (2 * Math.PI) / increaseOn;
            iterations++;
          }
        }

        return positions;
      }}
    >
      {selectedLocation
        ? selectedLocation.lat &&
          selectedLocation.long && (
            <RotatableMarker
              key={selectedLocation.vehicle.imei}
              position={[selectedLocation.lat, selectedLocation.long]}
              rotationAngle={selectedLocation.angle}
              icon={getIcon(selectedLocation)}
              eventHandlers={{
                click: () => {
                  setSelectedLocation(undefined);
                }
              }}
            >
              {showImei && (
                <Tooltip
                  direction="top"
                  offset={[0, -20]}
                  permanent
                  className="bg-transparent border-0 shadow-none p-0"
                  interactive
                  eventHandlers={{
                    click: () => {
                      setSelectedLocation(undefined);
                    }
                  }}
                >
                  <CarPlate
                    plate={selectedLocation.vehicle.plate}
                    className="shadow-lg"
                    showTooltip={false}
                  />
                </Tooltip>
              )}
            </RotatableMarker>
          )
        : locations
            ?.map(
              (location) =>
                location.lat &&
                location.long && (
                  <RotatableMarker
                    key={location.vehicle.imei}
                    position={[location.lat, location.long]}
                    rotationAngle={location.angle}
                    icon={getIcon(location)}
                    eventHandlers={{
                      click: () => {
                        setSelectedLocation(location);
                      }
                    }}
                  >
                    {showImei && (
                      <Tooltip
                        direction="top"
                        offset={[0, -20]}
                        permanent
                        className="bg-transparent border-0 shadow-none p-0"
                        interactive
                        eventHandlers={{
                          click: () => {
                            setSelectedLocation(location);
                          }
                        }}
                      >
                        <CarPlate
                          plate={location.vehicle.plate}
                          className="shadow-lg"
                          showTooltip={false}
                        />
                      </Tooltip>
                    )}
                  </RotatableMarker>
                )
            )
            .filter(Boolean)}
    </MarkerClusterGroup>
  );
};

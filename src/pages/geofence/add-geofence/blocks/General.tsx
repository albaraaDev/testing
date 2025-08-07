import AppMap from '@/components/AppMap';
import { AddGeofencePageProps } from '../AddGeofencePage';
import { useCallback, useMemo, useState } from 'react';
import { Circle, Marker, Polygon, useMapEvent } from 'react-leaflet';
import { FormattedMessage, useIntl } from 'react-intl';
import { GeoFenceType } from '@/api/geofence';
import { KeenIcon } from '@/components';

interface GeofenceMarkerProps {
  position: { lat: number; lng: number };
  setPosition: (position: { lat: number; lng: number }) => void;
}

const GeofenceMarker = ({ position, setPosition }: GeofenceMarkerProps) => {
  useMapEvent('click', (e) => {
    setPosition(e.latlng);
  });

  return (
    <Marker
      position={position}
      draggable={true}
      eventHandlers={{
        drag: (e) => {
          setPosition(e.target.getLatLng());
        }
      }}
    />
  );
};

interface PolygonGeofenceMarkerProps {
  position: { lat: number; lng: number };
  index: number;
  isSelected: boolean;
  onSelect: (index: number) => void;
  dragEnd: (position: { lat: number; lng: number }) => void;
}

const PolygonGeofenceMarker = ({
  position,
  index,
  isSelected,
  onSelect,
  dragEnd
}: PolygonGeofenceMarkerProps) => {
  return (
    <Marker
      position={position}
      draggable={true}
      opacity={isSelected ? 1 : 0.8}
      zIndexOffset={isSelected ? 1000 : 0}
      eventHandlers={{
        click: () => {
          onSelect(index);
        },
        dragend: (e) => {
          dragEnd(e.target.getLatLng());
        }
      }}
    />
  );
};

export const MIN_POLYGON_POINTS = 3;

interface PolygonMapClickHandlerProps {
  onMapClick: (position: { lat: number; lng: number }) => void;
  selectedMarkerIndex: number | null;
  setSelectedMarkerPosition: (position: { lat: number; lng: number }) => void;
}

const PolygonMapClickHandler = ({
  onMapClick,
  selectedMarkerIndex,
  setSelectedMarkerPosition
}: PolygonMapClickHandlerProps) => {
  useMapEvent('click', (e) => {
    if (selectedMarkerIndex !== null) {
      // Move the selected marker to the clicked position
      setSelectedMarkerPosition(e.latlng);
    } else {
      // Add a new point
      onMapClick(e.latlng);
    }
  });

  return null;
};

const [defaultLat, defaultLng] = [38.9637, 35.2433];

const General = ({ geofence }: AddGeofencePageProps) => {
  const intl = useIntl();

  const geom = geofence?.geom || [];
  const [positions, _setPositions] = useState<{ lat: number; lng: number }[]>(
    Array(3)
      .fill(null)
      .map((_, idx) => {
        if (geom.length > idx) {
          return {
            lat: geom[idx].latitude,
            lng: geom[idx].longitude
          };
        }

        return {
          lat: defaultLat + idx * 0.05,
          lng: defaultLng + idx * 0.05
        };
      })
  );

  /**
   * Sets positions in a sorted order around their center to ensure points create a proper polygon.
   *
   * This function:
   * 1. Calculates the center point of all positions
   * 2. Sorts the points in a clockwise order around this center by calculating angles
   * 3. The clockwise ordering ensures that when lines are drawn between consecutive points
   *    and finally back to the first point, they form a valid polygon without lines crossing
   *
   * @param newPositions - Array of latitude and longitude coordinate objects
   */
  const setPositionsSorted = useCallback(
    (newPositions: { lat: number; lng: number }[]) => {
      const center = {
        lat: newPositions.reduce((sum, p) => sum + p.lat, 0) / newPositions.length,
        lng: newPositions.reduce((sum, p) => sum + p.lng, 0) / newPositions.length
      };

      const sorted = newPositions.sort((a, b) => {
        const angleA = Math.atan2(a.lat - center.lat, a.lng - center.lng);
        const angleB = Math.atan2(b.lat - center.lat, b.lng - center.lng);
        return angleA - angleB;
      });

      _setPositions(sorted);
    },
    [_setPositions]
  );

  const position = useMemo(() => {
    return positions[0] || { lat: defaultLat, lng: defaultLng };
  }, [positions]);
  const setPosition = useCallback(
    (newPosition: { lat: number; lng: number }) => {
      setPositionsSorted([newPosition]);
    },
    [setPositionsSorted]
  );

  const [radius, setRadius] = useState<number>(geofence?.radius || 100);

  const [selectedTypeId, setSelectedTypeId] = useState<GeoFenceType>(geofence?.type || 'circle');

  const [selectedMarkerIndex, setSelectedMarkerIndex] = useState<number | null>(null);

  const types = useMemo<Record<GeoFenceType, string>>(() => {
    return {
      circle: intl.formatMessage({ id: 'GEOFENCE.FORM.TYPE.CIRCLE' }),
      polygon: intl.formatMessage({ id: 'GEOFENCE.FORM.TYPE.POLYGON' })
    };
  }, [intl]);

  const canDeletePoint = useMemo(() => {
    return selectedTypeId === 'polygon' && positions.length > MIN_POLYGON_POINTS;
  }, [selectedTypeId, positions.length]);

  // Polygon-specific handlers
  const handleAddPolygonPoint = useCallback(
    (newPosition: { lat: number; lng: number }) => {
      setPositionsSorted([...positions, newPosition]);
    },
    [positions, setPositionsSorted]
  );

  const handleSelectMarker = useCallback(
    (index: number) => {
      setSelectedMarkerIndex(selectedMarkerIndex === index ? null : index);
    },
    [selectedMarkerIndex]
  );

  const handleSetSelectedMarkerPosition = useCallback(
    (newPosition: { lat: number; lng: number }) => {
      if (selectedMarkerIndex !== null) {
        const newPositions = [...positions];
        newPositions[selectedMarkerIndex] = newPosition;
        setPositionsSorted(newPositions);
        setSelectedMarkerIndex(null); // Deselect after moving
      }
    },
    [selectedMarkerIndex, positions, setPositionsSorted]
  );

  return (
    <div className="card pb-2.5">
      <div className="card-header" id="general_settings">
        <h3 className="card-title">
          <FormattedMessage id="GEOFENCE.FORM.GENERAL" />
        </h3>
      </div>
      <div className="card-body grid gap-5">
        <div className="grid lg:grid-cols-2 gap-5">
          <div className="flex flex-col gap-2.5">
            <label className="form-label">
              <FormattedMessage id="GEOFENCE.FORM.NAME" />
            </label>
            <input
              required
              type="text"
              className="input"
              name="name"
              placeholder={intl.formatMessage({ id: 'GEOFENCE.FORM.NAME.PLACEHOLDER' })}
              defaultValue={geofence?.name}
            />
          </div>
          <div className="flex flex-col gap-2.5">
            <label className="form-label">
              <FormattedMessage id="GEOFENCE.FORM.TYPE" />
            </label>
            <select
              className="select"
              name="type"
              required
              defaultValue={geofence?.type}
              onChange={(e) => {
                setSelectedTypeId(e.target.value as GeoFenceType);
                setSelectedMarkerIndex(null); // Clear selection when changing type
              }}
              value={selectedTypeId}
            >
              <option value="">
                <FormattedMessage id="GEOFENCE.FORM.TYPE.PLACEHOLDER" />
              </option>
              {Object.entries(types).map(([id, data]) => (
                <option key={id} value={id}>
                  {data}
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedTypeId === 'circle' && (
          <>
            <div className="grid lg:grid-cols-2 gap-5">
              <div className="flex flex-col gap-2.5">
                <label className="form-label">
                  <FormattedMessage id="GEOFENCE.FORM.LATITUDE" />
                </label>
                <input
                  required
                  className="input"
                  inputMode="decimal"
                  pattern="[0-9]*[.,]?[0-9]*"
                  name="latitude"
                  placeholder={intl.formatMessage({ id: 'GEOFENCE.FORM.LATITUDE.PLACEHOLDER' })}
                  value={position?.lat}
                  onChange={(e) =>
                    setPosition({ lat: parseFloat(e.target.value), lng: position.lng })
                  }
                />
              </div>
              <div className="flex flex-col gap-2.5">
                <label className="form-label">
                  <FormattedMessage id="GEOFENCE.FORM.LONGITUDE" />
                </label>
                <input
                  required
                  className="input"
                  inputMode="decimal"
                  pattern="[0-9]*[.,]?[0-9]*"
                  name="longitude"
                  placeholder={intl.formatMessage({ id: 'GEOFENCE.FORM.LONGITUDE.PLACEHOLDER' })}
                  value={position?.lng}
                  onChange={(e) =>
                    setPosition({ lat: position.lat, lng: parseFloat(e.target.value) })
                  }
                />
              </div>
              <div className="flex flex-col gap-2.5">
                <label className="form-label">
                  <FormattedMessage id="GEOFENCE.FORM.RADIUS" />
                </label>
                <input
                  required
                  type="text"
                  className="input"
                  inputMode="decimal"
                  pattern="[0-9]*[.,]?[0-9]*"
                  name="radius"
                  placeholder={intl.formatMessage({ id: 'GEOFENCE.FORM.RADIUS.PLACEHOLDER' })}
                  value={radius}
                  onChange={(e) => {
                    return setRadius(e.target.value === '' ? 1 : parseFloat(e.target.value));
                  }}
                />
              </div>
            </div>
          </>
        )}

        {selectedTypeId === 'polygon' && (
          <>
            <div className="flex flex-row gap-2.5">
              <div className="grid lg:grid-cols-2 gap-5 flex-grow">
                <div className="flex flex-col gap-2.5">
                  <label className="form-label">
                    <FormattedMessage id="GEOFENCE.FORM.LATITUDE" />
                  </label>
                </div>
                <div className="flex flex-col gap-2.5">
                  <label className="form-label">
                    <FormattedMessage id="GEOFENCE.FORM.LONGITUDE" />
                  </label>
                </div>
              </div>
              <div className="w-12"></div>
            </div>
            {positions.map((pos, index) => {
              const setLng = (lng: number) => {
                const newPositions = [...positions];
                newPositions[index] = { lat: pos.lat, lng };
                setPositionsSorted(newPositions);
              };
              const setLat = (lat: number) => {
                const newPositions = [...positions];
                newPositions[index] = { lat, lng: pos.lng };
                setPositionsSorted(newPositions);
              };

              return (
                <div
                  key={index}
                  className={`flex flex-row gap-2.5 ${
                    selectedMarkerIndex === index
                      ? 'bg-blue-50 border border-blue-200 rounded-lg p-3'
                      : ''
                  }`}
                >
                  <div className="grid lg:grid-cols-2 gap-5 flex-grow">
                    <input
                      required
                      className={`input ${
                        selectedMarkerIndex === index
                          ? 'border-blue-400 focus:border-blue-500 bg-blue-25'
                          : ''
                      }`}
                      inputMode="decimal"
                      pattern="[0-9]*[.,]?[0-9]*"
                      name={`latitude-${index}`}
                      placeholder={intl.formatMessage({
                        id: 'GEOFENCE.FORM.LATITUDE.PLACEHOLDER'
                      })}
                      value={pos.lat}
                      onChange={(e) => setLat(parseFloat(e.target.value))}
                      onFocus={() => setSelectedMarkerIndex(index)}
                    />
                    <input
                      required
                      className={`input ${
                        selectedMarkerIndex === index
                          ? 'border-blue-400 focus:border-blue-500 bg-blue-25'
                          : ''
                      }`}
                      inputMode="decimal"
                      pattern="[0-9]*[.,]?[0-9]*"
                      name={`longitude-${index}`}
                      placeholder={intl.formatMessage({
                        id: 'GEOFENCE.FORM.LONGITUDE.PLACEHOLDER'
                      })}
                      value={pos.lng}
                      onChange={(e) => setLng(parseFloat(e.target.value))}
                      onFocus={() => setSelectedMarkerIndex(index)}
                    />
                  </div>
                  <div className="w-12">
                    <button
                      type="button"
                      onClick={() => {
                        const newPositions = positions.filter((_, i) => i !== index);
                        setPositionsSorted(newPositions);
                        // Clear selection if deleting the selected marker
                        if (selectedMarkerIndex === index) {
                          setSelectedMarkerIndex(null);
                        } else if (selectedMarkerIndex !== null && selectedMarkerIndex > index) {
                          // Adjust selected index if deleting a marker before the selected one
                          setSelectedMarkerIndex(selectedMarkerIndex - 1);
                        }
                      }}
                      disabled={!canDeletePoint}
                      className="btn btn-danger"
                    >
                      <KeenIcon icon="cross" />
                    </button>
                  </div>
                </div>
              );
            })}

            <div className="flex justify-end">
              <button
                type="button"
                className="btn btn-primary mt-2"
                onClick={() =>
                  handleAddPolygonPoint({
                    lat: positions[positions.length - 1].lat + 0.05,
                    lng: positions[positions.length - 1].lng + 0.05
                  })
                }
              >
                <FormattedMessage id="GEOFENCE.FORM.ADD_POINT" />
              </button>
            </div>
          </>
        )}

        <div className="rounded-md w-full h-[512px]">
          <AppMap mapControlSize="small">
            {selectedTypeId === 'polygon' && (
              <>
                <PolygonMapClickHandler
                  onMapClick={handleAddPolygonPoint}
                  selectedMarkerIndex={selectedMarkerIndex}
                  setSelectedMarkerPosition={handleSetSelectedMarkerPosition}
                />
                {/* Draw polygon lines */}
                {positions.length >= 3 && (
                  <Polygon
                    positions={positions.map((pos) => [pos.lat, pos.lng])}
                    pathOptions={{
                      fillColor: '#3388ff',
                      color: '#3388ff',
                      weight: 2,
                      opacity: 0.8,
                      fillOpacity: 0.2
                    }}
                  />
                )}
                {/* Render markers */}
                {positions.map((pos, index) => {
                  const setPos = (newPos: { lat: number; lng: number }) => {
                    const newPositions = [...positions];
                    newPositions[index] = newPos;
                    setPositionsSorted(newPositions);
                  };
                  return (
                    <PolygonGeofenceMarker
                      key={index}
                      position={pos}
                      dragEnd={setPos}
                      index={index}
                      isSelected={selectedMarkerIndex === index}
                      onSelect={handleSelectMarker}
                    />
                  );
                })}
              </>
            )}
            {selectedTypeId === 'circle' && (
              <>
                <GeofenceMarker position={position} setPosition={setPosition} />
                {radius > 0 && <Circle center={position} radius={radius} />}
              </>
            )}
          </AppMap>
        </div>
      </div>
    </div>
  );
};

export { General };

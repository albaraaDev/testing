import { ForwardedRef, forwardRef, RefAttributes, useEffect, useRef } from 'react';
import { Marker, MarkerProps } from 'react-leaflet';
import * as L from 'leaflet';

type Props = MarkerProps & RefAttributes<L.Marker<any>>;

// see https://github.com/bbecquet/Leaflet.RotatedMarker/issues/23#issuecomment-1011836375
export const RotatableMarker = forwardRef(
  ({ children, ...props }: Props, forwardRef: ForwardedRef<any>) => {
    const markerRef = useRef<L.Marker>(null);

    const { rotationAngle, rotationOrigin } = props;
    useEffect(() => {
      if (markerRef.current == null) {
        return;
      }
      const marker: L.Marker = markerRef.current;
      marker.setRotationAngle(rotationAngle ?? 0);
      marker.setRotationOrigin(rotationOrigin ?? 'center');
    }, [rotationAngle, rotationOrigin]);

    return (
      <Marker
        ref={(ref) => {
          markerRef.current = ref as L.Marker<any>;
          if (forwardRef != null) {
            (forwardRef as any).current = ref;
          }
        }}
        {...props}
      >
        {children}
      </Marker>
    );
  }
);

import { ReactElement } from 'react';
import { useMap } from 'react-leaflet';
import { useLanguage } from '@/i18n';
import clsx from 'clsx';

export const SubControl = ({ children }: { children: ReactElement[] | ReactElement }) => {
  const { isRTL } = useLanguage();
  const map = useMap();

  return (
    <div
      className={clsx(
        isRTL() ? 'leaflet-right [direction:rtl]' : 'leaflet-left [direction:ltr]',
        'leaflet-bottom flex items-stretch'
      )}
      onMouseOver={() => {
        map.doubleClickZoom.disable();
        map.dragging.disable();
        map.scrollWheelZoom.disable();
      }}
      onMouseOut={() => {
        map.doubleClickZoom.enable();
        map.dragging.enable();
        map.scrollWheelZoom.enable();
      }}
    >
      <div className="leaflet-control flex flex-col gap-[10px] !ms-[475px] !mb-6 font-sans">
        {children}
      </div>
    </div>
  );
};

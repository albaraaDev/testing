import { PropsWithChildren } from 'react';
import { useMap } from 'react-leaflet';
import { SizeContext } from './provider';
import { useLanguage } from '@/i18n';
import clsx from 'clsx';

interface MapControlsProps extends PropsWithChildren {
  size?: 'small' | 'large' | 'hidden';
}

export const MapControls = ({ children, size = 'large' }: MapControlsProps) => {
  const { isRTL } = useLanguage();
  const map = useMap();

  if (size === 'hidden') {
    return <></>;
  }

  return (
    <div
      className={clsx(
        isRTL() ? 'leaflet-left [direction:rtl]' : 'leaflet-right [direction:ltr]',
        'leaflet-top max-h-screen flex items-stretch group data-[size=large]:!mt-16 data-[size=large]:!ms-7 data-[size=large]:!mb-6 font-sans'
      )}
      onMouseOver={() => map.doubleClickZoom.disable()}
      onMouseOut={() => map.doubleClickZoom.enable()}
    >
      <div
        data-size={size}
        className="leaflet-control flex flex-col gap-[10px] data-[size=large]:!mt-20 data-[size=large]:!me-5 data-[size=large]:md:!mt-[90px] data-[size=large]:md:!me-5"
      >
        <SizeContext.Provider value={{ size }}>{children}</SizeContext.Provider>
      </div>
    </div>
  );
};

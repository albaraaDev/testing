import { KeenIcon } from '@/components';
import { Collapse } from '@mui/material';
import { PropsWithChildren, ReactElement, useState } from 'react';
import { useMap } from 'react-leaflet';
import { useLanguage } from '@/i18n';
import clsx from 'clsx';

export interface MainControlProps extends PropsWithChildren {
  title: string;
  bar?: ReactElement;
  fullHeight?: boolean;
}

export const MainControl = ({ children, title, bar, fullHeight = true }: MainControlProps) => {
  const { isRTL } = useLanguage();
  const map = useMap();
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div
      className={clsx(
        isRTL() ? 'leaflet-right [direction:rtl]' : 'leaflet-left [direction:ltr]',
        'leaflet-top max-h-screen flex items-stretch group data-[open=true]:h-screen'
      )}
      data-open={isOpen}
    >
      <div className="leaflet-control flex flex-col gap-[10px] !mx-4 md:!mt-16 md:!ms-7 md:!mb-6 font-sans">
        <div
          className={clsx('card', {
            'group-data-[open=true]:h-full': fullHeight
          })}
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
          <div
            className="card-header border-dashed border-0 group-data-[open=true]:border-b-2"
            onClick={() => setIsOpen((open) => !open)}
          >
            <div className="card-title font-bold text-[22px]">
              <h3>{title}</h3>
            </div>
            <div className="flex items-center gap-2">
              {bar}
              {isOpen ? <KeenIcon icon="up" /> : <KeenIcon icon="down" />}
            </div>
          </div>

          <Collapse in={isOpen} className="flex-grow" classes={{ wrapper: 'h-full' }}>
            {children}
          </Collapse>
        </div>
      </div>
    </div>
  );
};

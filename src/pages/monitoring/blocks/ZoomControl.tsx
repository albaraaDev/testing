import { toAbsoluteUrl } from '@/utils';
import { useMap } from 'react-leaflet';
import { useControl } from './MapControls/provider';

export const ZoomControl = () => {
  const map = useMap();
  const { size } = useControl();

  return (
    <>
      <div
        data-size={size}
        className="bg-white rounded-lg data-[size=large]:size-[46px] data-[size=small]:size-[28px] flex justify-center items-center shadow-lg cursor-pointer"
        onClick={() => map.zoomIn()}
      >
        <img src={toAbsoluteUrl('/media/icons/plus.svg')} />
      </div>
      <div
        data-size={size}
        className="bg-white rounded-lg data-[size=large]:size-[46px] data-[size=small]:size-[28px] flex justify-center items-center shadow-lg cursor-pointer"
        onClick={() => map.zoomOut()}
      >
        <img src={toAbsoluteUrl('/media/icons/minus.svg')} />
      </div>
    </>
  );
};

import { toAbsoluteUrl } from '@/utils';
import { useMap } from 'react-leaflet';
import { useControl } from './MapControls/provider';
import { LayerType, useLayer } from '@/components/AppMap/contexts/LayerProvider';
import {
  Menu,
  MenuItem,
  MenuToggle,
  MenuSub,
  MenuLink,
  MenuTitle,
  MenuIcon
} from '@/components/menu';
import { KeenIcon } from '@/components';
import { useRef } from 'react';

type LayerOption = {
  key: LayerType;
  label: string;
  icon: string;
};

const layerOptions: LayerOption[] = [
  { key: 'openstreetmap', label: 'OpenStreetMap', icon: 'map' },
  { key: 'google-road', label: 'Google Road', icon: 'route' },
  { key: 'google-satellite', label: 'Google Satellite', icon: 'satellite' },
  { key: 'google-hybrid', label: 'Google Hybrid', icon: 'abstract-1' },
  { key: 'carto-base', label: 'Carto Base', icon: 'compass' }
];

export const OtherControls = () => {
  const map = useMap();
  const { size } = useControl();
  const { layer, setLayer } = useLayer();
  const layerMenuRef = useRef<any>(null);

  const handleLayerChange = (layerKey: LayerOption['key']) => {
    setLayer(layerKey);
    layerMenuRef.current?.hide();
  };

  return (
    <div className="group bg-white rounded-lg shadow-lg cursor-pointer" data-size={size}>
      <div
        className="group-data-[size=large]:size-[46px] group-data-[size=small]:size-[28px] flex justify-center items-center"
        onClick={() => {
          // Open the same view on google maps
          window.open(
            `https://www.google.com/maps/@${map.getCenter().lat},${map.getCenter().lng},${map.getZoom()}z`
          );
        }}
      >
        <img
          src={toAbsoluteUrl('/media/icons/marker-on-map.svg')}
          className="group-data-[size=small]:size-[20px]"
        />
      </div>

      {/* Layer Dropdown */}
      <Menu>
        <MenuItem
          ref={layerMenuRef}
          toggle="dropdown"
          trigger="click"
          dropdownProps={{
            placement: 'bottom-end',
            modifiers: [
              {
                name: 'offset',
                options: {
                  offset: [0, 5]
                }
              }
            ]
          }}
        >
          <MenuToggle className="group-data-[size=large]:size-[46px] group-data-[size=small]:size-[28px] flex justify-center items-center hover:bg-gray-50">
            <img
              src={toAbsoluteUrl('/media/icons/satellite.svg')}
              className="group-data-[size=small]:size-[20px]"
            />
          </MenuToggle>
          <MenuSub className="menu-default" rootClassName="w-full max-w-[180px]">
            {layerOptions.map((option) => (
              <MenuItem key={option.key} onClick={() => handleLayerChange(option.key)}>
                <MenuLink className={`${layer === option.key ? 'bg-gray-100' : ''}`}>
                  <MenuIcon>
                    <KeenIcon icon={option.icon} />
                  </MenuIcon>
                  <MenuTitle>{option.label}</MenuTitle>
                </MenuLink>
              </MenuItem>
            ))}
          </MenuSub>
        </MenuItem>
      </Menu>

      <div
        className="group-data-[size=large]:size-[46px] group-data-[size=small]:size-[28px] flex justify-center items-center"
        onClick={() => {
          // Fly to current location
          map.stopLocate();
          map.locate({
            watch: true,
            enableHighAccuracy: true
          });
          map.once('locationfound', (e) => {
            map.flyTo(e.latlng, map.getZoom());
          });
        }}
      >
        <img
          src={toAbsoluteUrl('/media/icons/marker-pulse.svg')}
          className="group-data-[size=small]:size-[20px]"
        />
      </div>
    </div>
  );
};

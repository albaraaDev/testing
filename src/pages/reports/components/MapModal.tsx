import AppMap from '@/components/AppMap';
import { toAbsoluteUrl } from '@/utils';
import { Modal } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { renderToString } from 'react-dom/server';
import { useIntl } from 'react-intl';
import L, { LatLngExpression } from 'leaflet';
import { Marker, Polyline, Popup, Tooltip, useMap } from 'react-leaflet';
import ParkingMarker from '@/pages/replay/components/ParkingMarker';
import { TripPoint } from '@/api/trips';

type MapModalProps = {
  children?: React.ReactNode;
};

export default function MapModal({ children }: MapModalProps) {
  const intl = useIntl();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Modal open={isModalOpen} onClose={handleCloseModal}>
        <div className="w-[500px] h-[500px] card absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-dark rounded-lg shadow-lg p-4 flex justify-center items-center">
          <AppMap mapControlSize="small">{children}</AppMap>
        </div>
      </Modal>

      <button
        className="p-2 w-8 h-8 flex items-center justify-center rounded-full bg-[#5271FF]/10"
        title={intl.formatMessage({ id: 'VEHICLE.GRID.ACTION.VIEW' })}
        onClick={handleOpenModal}
      >
        <img
          src={toAbsoluteUrl('/media/icons/view-light.svg')}
          alt={intl.formatMessage({ id: 'COMMON.VIEW' })}
        />
      </button>
    </>
  );
}

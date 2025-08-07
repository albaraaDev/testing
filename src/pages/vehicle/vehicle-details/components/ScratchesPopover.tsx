import { ScratchDTO } from '@/api/cars';
import { KeenIcon } from '@/components';
import { DownloadableImage } from '@/components/DownloadableImage';
import { Popover } from '@mui/material';
import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

export type Scratch = {
  date: string;
  description: string;
  image: string;
};

type ScratchesPopoverProps = {
  className?: string;
  scratches?: ScratchDTO[];
};

export default function ScratchesPopover({ className, scratches }: ScratchesPopoverProps) {
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;
  return (
    <>
      <button className={className} aria-describedby={id} onClick={handleClick}>
        {scratches ? scratches.length : '0'}
      </button>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        className="rounded-lg max-h-[350px]"
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
      >
        <div>
          {scratches?.length ? (
            scratches.map((scratch, index) => (
              <div key={index} className="px-3">
                <ScratchDetailCard {...scratch} />
                {index < scratches.length - 1 && <hr className="border-gray-200" />}
              </div>
            ))
          ) : (
            <p className="p-3 text-center text-gray-500">
              <FormattedMessage id="VEHICLE.SCRATCHES.POPOVER.NO_SCRATCHES" />
            </p>
          )}
        </div>
      </Popover>
    </>
  );
}

function ScratchDetailCard({ updatedAt, explanationOf, image }: ScratchDTO) {
  const intl = useIntl();
  const formattedUpdatedAt = updatedAt
    ? intl.formatDate(new Date(updatedAt), {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    : intl.formatMessage({ id: 'COMMON.INVALID_DATE' });

  return (
    <div className="flex gap-4 py-3 justify-start items-start">
      <div className="w-32 h-32 rounded-md overflow-hidden">
        {image && (
          <DownloadableImage
            src={image}
            alt={intl.formatMessage({ id: 'VEHICLE.SCRATCHES.POPOVER.IMAGE_ALT' })}
            className="object-cover"
          />
        )}
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex gap-2 items-start justify-start">
          <span className="bg-gray-100 p-2 h-10 w-10 flex items-center justify-center rounded-lg">
            <KeenIcon icon="calendar" className="text-info text-2xl" />
          </span>
          <p className="text-sm">{formattedUpdatedAt}</p>
        </div>
        <p className="text-gray-700 text-md max-w-96">{explanationOf}</p>
      </div>
    </div>
  );
}

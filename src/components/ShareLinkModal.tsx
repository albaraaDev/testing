import { Popover } from '@mui/material';
import { useSnackbar } from 'notistack';
import React, { useState } from 'react';
import { KeenIcon } from './keenicons';
import { FormattedMessage } from 'react-intl';

export default function ShareLinkModal({
  children,
  link
}: {
  children: React.ReactNode;
  link: string;
}) {
  const { enqueueSnackbar } = useSnackbar();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(link).then(() => {
      enqueueSnackbar(<FormattedMessage id="COMMON.COPIED_TO_CLIPBOARD" />, {
        variant: 'success',
        autoHideDuration: 2000
      });
    });
  };

  const handleButtonClick = () => {
    setIsModalOpen((prev) => !prev);
  };

  return (
    <>
      <button ref={buttonRef} onClick={handleButtonClick}>
        {children}
      </button>
      <Popover
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center'
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center'
        }}
        anchorEl={buttonRef.current}
      >
        <div className="p-2">
          <div className="flex items-center justify-center border-2 border-gray-200 bg-gray-50 rounded-lg overflow-hidden">
            <p className="text-sm font-monospace px-2">{link}</p>
            <button
              onClick={handleCopyLink}
              className="p-2 border-s-2 flex items-center justify-center bg-white text-info hover:bg-[#9d9de94b]"
            >
              <KeenIcon icon="copy" />
            </button>
          </div>
        </div>
      </Popover>
    </>
  );
}

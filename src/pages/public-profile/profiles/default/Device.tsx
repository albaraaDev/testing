import { Fragment } from 'react';

import { toAbsoluteUrl } from '@/utils/Assets';
import { Container } from '@/components/container';

import { ProfileDefaultContent } from '.';

const Device = () => {
  const image = (
    <img
      src={toAbsoluteUrl('/media/avatars/300-1.png')}
      className="rounded-full border-3 border-success size-[100px] shrink-0"
    />
  );

  return (
    <Fragment>
      <Container>
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-xl text-gray-800">Device List</h3>

          <a href="/devices/add-device">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm ml-auto">
              New Device
            </button>
          </a>
        </div>

        <ProfileDefaultContent />
      </Container>
    </Fragment>
  );
};

export { Device };

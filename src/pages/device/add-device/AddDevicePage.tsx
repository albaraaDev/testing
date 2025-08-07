import React, { useRef, useState } from 'react';
import { Information, User } from './blocks';
import { DeviceDTO } from '@/api/devices';
import { FormattedMessage } from 'react-intl';

export interface AddDevicePageProps {
  device?: DeviceDTO;
}

const AddDevicePage = ({ device }: AddDevicePageProps) => {
  const [activeTab, setActiveTab] = useState<'information' | 'company'>('information');

  const informationRef = useRef<HTMLDivElement>(null);
  const companyRef = useRef<HTMLDivElement>(null);

  const handleTabClick = (
    ref: React.RefObject<HTMLDivElement | null>,
    tab: 'information' | 'company'
  ) => {
    setActiveTab(tab);

    ref.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });

    const header = ref.current?.querySelector('h2');
    if (header) {
      header.setAttribute('tabindex', '-1');
      header.focus();
    }
  };

  return (
    <div className="grid gap-5 lg:gap-7.5 xl:w-[60rem] mx-auto">
      <div className="tabs flex">
        <button
          className={`tab px-4 py-2 font-medium text-lg border-b-4 ${
            activeTab === 'information'
              ? 'text-primary border-primary'
              : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
          }`}
          onClick={() => handleTabClick(informationRef, 'information')}
        >
          <FormattedMessage id="DEVICE.ADD.TAB.INFORMATION" />
        </button>
        <button
          className={`tab px-4 py-2 font-medium text-lg border-b-4 ${
            activeTab === 'company'
              ? 'text-primary border-primary'
              : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
          }`}
          onClick={() => handleTabClick(companyRef, 'company')}
        >
          <FormattedMessage id="DEVICE.ADD.TAB.COMPANY" />
        </button>
      </div>

      <div ref={informationRef}>
        <Information device={device} />
      </div>
      <div ref={companyRef}>
        <User device={device} />
      </div>
    </div>
  );
};

export { AddDevicePage };

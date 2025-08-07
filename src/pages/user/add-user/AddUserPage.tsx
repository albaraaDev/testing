import React, { useEffect, useRef, useState } from 'react';
import { InformationBlock, InformationAccountBlock, ContactBlock } from './blocks';
import { FormUserModel } from '@/api/user';
import { CompanyInformationBlock } from './blocks/CompanyInformation';
import { DeviceBlock } from './blocks/Device';
import { useLocation } from 'react-router';
import { FormattedMessage } from 'react-intl';

export interface AddUserPageProps {
  user?: FormUserModel | undefined;
  roleEditable?: boolean | undefined;
}

const AddUserPage = ({ user }: AddUserPageProps) => {
  const { hash } = useLocation();
  const [activeTab, setActiveTab] = useState<
    'information' | 'account' | 'contact' | 'company info' | 'device'
  >('information');

  const informationRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);
  const companyInformationRef = useRef<HTMLDivElement>(null);
  const deviceRef = useRef<HTMLDivElement>(null);

  const handleTabClick = (
    ref: React.RefObject<HTMLDivElement | null>,
    tab: 'information' | 'account' | 'contact' | 'company info' | 'device'
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

  useEffect(() => {
    if (hash === '#account') {
      handleTabClick(accountRef, 'account');
    } else if (hash === '#contact') {
      handleTabClick(contactRef, 'contact');
    } else if (hash === '#company-info') {
      handleTabClick(companyInformationRef, 'company info');
    } else if (hash === '#devices') {
      handleTabClick(deviceRef, 'device');
    }
  }, [hash]);

  return (
    <div className="grid gap-5 lg:gap-7.5 xl:w-[60rem] mx-auto">
      <div className="tabs flex " data-tabs="true">
        <button
          type="button"
          className={`tab px-4 py-2 font-medium text-lg border-b-4 ${
            activeTab === 'information'
              ? 'text-primary border-primary'
              : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
          }`}
          onClick={() => handleTabClick(informationRef, 'information')}
        >
          <FormattedMessage id="USER.ADD.TAB.INFORMATION" />
        </button>
        <button
          type="button"
          className={`tab px-4 py-2 font-medium text-lg border-b-4 ${
            activeTab === 'account'
              ? 'text-primary border-primary'
              : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
          }`}
          onClick={() => handleTabClick(accountRef, 'account')}
        >
          <FormattedMessage id="USER.ADD.TAB.ACCOUNT" />
        </button>
        <button
          type="button"
          className={`tab px-4 py-2 font-medium text-lg border-b-4 ${
            activeTab === 'contact'
              ? 'text-primary border-primary'
              : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
          }`}
          onClick={() => handleTabClick(contactRef, 'contact')}
        >
          <FormattedMessage id="USER.ADD.TAB.CONTACT" />
        </button>
        <button
          type="button"
          className={`tab px-4 py-2 font-medium text-lg border-b-4 ${
            activeTab === 'company info'
              ? 'text-primary border-primary'
              : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
          }`}
          onClick={() => handleTabClick(companyInformationRef, 'company info')}
        >
          <FormattedMessage id="USER.ADD.TAB.COMPANY_INFORMATION" />
        </button>
        <button
          type="button"
          className={`tab px-4 py-2 font-medium text-lg border-b-4 ${
            activeTab === 'device'
              ? 'text-primary border-primary'
              : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
          }`}
          onClick={() => handleTabClick(deviceRef, 'device')}
        >
          <FormattedMessage id="USER.ADD.TAB.DEVICE" />
        </button>
      </div>

      <div ref={informationRef}>
        <InformationBlock user={user} roleEditable={true} />
      </div>
      <div ref={accountRef}>
        <InformationAccountBlock user={user} />
      </div>
      <div ref={contactRef}>
        <ContactBlock user={user} />
      </div>
      <div ref={companyInformationRef}>
        <CompanyInformationBlock user={user} />
      </div>
      {user && (
        <div ref={deviceRef}>
          <DeviceBlock user={user} />
        </div>
      )}
    </div>
  );
};

export { AddUserPage };

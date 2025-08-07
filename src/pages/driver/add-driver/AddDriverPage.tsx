import React, { useRef, useState } from 'react';
import { Information, InformationAccount, Contact, Documents } from './blocks';
import { DriverDetails } from '@/api/drivers';
import { FormattedMessage } from 'react-intl';

export interface AddDriverPageProps {
  driver?: DriverDetails;
}

const AddDriverPage = ({ driver }: AddDriverPageProps) => {
  const [activeTab, setActiveTab] = useState<'information' | 'account' | 'documents' | 'contact'>(
    'information'
  );

  const informationRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);
  const documentRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);

  const handleTabClick = (
    ref: React.RefObject<HTMLDivElement | null>,
    tab: 'information' | 'account' | 'documents' | 'contact'
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
      <div className="tabs flex" data-tabs="true">
        <button
          type="button"
          className={`tab px-4 py-2 font-medium text-lg border-b-4 ${
            activeTab === 'information'
              ? 'text-primary border-primary'
              : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
          }`}
          onClick={() => handleTabClick(informationRef, 'information')}
        >
          <FormattedMessage id="DRIVER.ADD.TAB.INFORMATION" />
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
          <FormattedMessage id="DRIVER.ADD.TAB.ACCOUNT" />
        </button>
        <button
          type="button"
          className={`tab px-4 py-2 font-medium text-lg border-b-4 ${
            activeTab === 'documents'
              ? 'text-primary border-primary'
              : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
          }`}
          onClick={() => handleTabClick(documentRef, 'documents')}
        >
          <FormattedMessage id="DRIVER.ADD.TAB.DOCUMENTS" />
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
          <FormattedMessage id="DRIVER.ADD.TAB.CONTACT" />
        </button>
      </div>

      <div ref={informationRef}>
        <Information driver={driver} />
      </div>
      <div ref={accountRef}>
        <InformationAccount driver={driver} />
      </div>
      <div ref={documentRef}>
        <Documents driver={driver} />
      </div>
      <div ref={contactRef}>
        <Contact driver={driver} />
      </div>
    </div>
  );
};

export { AddDriverPage };

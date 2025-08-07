import React, { useEffect, useRef, useState } from 'react';
import { InformationBlock, InformationAccountBlock, ContactBlock } from './blocks';
import { useLocation } from 'react-router';
import { FormattedMessage } from 'react-intl';
import { CustomerDetails, IdentityType } from '@/api/customers';
import { DocumentsBlock } from './blocks/Documents';
import FormTab from '@/components/FormTab';

export interface AddCustomerPageProps {
  customer?: CustomerDetails | undefined;
  customerIdentityType?: IdentityType;
}

type ActiveTabType = 'information' | 'account' | 'documents' | 'contact';

const AddCustomerPage = ({ customer }: AddCustomerPageProps) => {
  const { hash } = useLocation();
  const [activeTab, setActiveTab] = useState<ActiveTabType>('information');
  const [customerIdentityType, setCustomerIdentityType] = useState<IdentityType>('turkish');

  const informationRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);
  const documentsRef = useRef<HTMLDivElement>(null);

  const handleTabClick = (ref: React.RefObject<HTMLDivElement | null>, tab: ActiveTabType) => {
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
    }
  }, [hash]);

  return (
    <div className="grid gap-5 lg:gap-7.5 xl:w-[60rem] mx-auto">
      <div className="tabs flex " data-tabs="true">
        <FormTab
          tabKey="turkish"
          label={<FormattedMessage id="CUSTOMER.IDENTITY.TAB.TURKISH" />}
          activeTab={customerIdentityType}
          onClick={() => setCustomerIdentityType('turkish')}
        />
        <FormTab
          tabKey="foreign"
          label={<FormattedMessage id="CUSTOMER.IDENTITY.TAB.FOREIGN" />}
          activeTab={customerIdentityType}
          onClick={() => setCustomerIdentityType('foreign')}
        />
        <FormTab
          tabKey="company"
          label={<FormattedMessage id="CUSTOMER.IDENTITY.TAB.COMPANY" />}
          activeTab={customerIdentityType}
          onClick={() => setCustomerIdentityType('company')}
        />
        <input hidden value={customerIdentityType} name="identityType" readOnly />
      </div>
      <div className="tabs flex " data-tabs="true">
        <FormTab
          tabKey="information"
          label={<FormattedMessage id="CUSTOMER.ADD.TAB.INFORMATION" />}
          activeTab={activeTab}
          onClick={() => handleTabClick(informationRef, 'information')}
        />
        <FormTab
          tabKey="account"
          label={<FormattedMessage id="CUSTOMER.ADD.TAB.ACCOUNT" />}
          activeTab={activeTab}
          onClick={() => handleTabClick(accountRef, 'account')}
        />
        {(customerIdentityType === 'turkish' || customerIdentityType === 'foreign') && (
          <FormTab
            tabKey="documents"
            label={<FormattedMessage id="CUSTOMER.ADD.TAB.DOCUMENTS" />}
            activeTab={activeTab}
            onClick={() => handleTabClick(documentsRef, 'documents')}
          />
        )}
        <FormTab
          tabKey="contact"
          label={<FormattedMessage id="CUSTOMER.ADD.TAB.CONTACT" />}
          activeTab={activeTab}
          onClick={() => handleTabClick(contactRef, 'contact')}
        />
      </div>

      <div ref={informationRef}>
        <InformationBlock customer={customer} customerIdentityType={customerIdentityType} />
      </div>
      <div ref={accountRef}>
        <InformationAccountBlock customer={customer} customerIdentityType={customerIdentityType} />
      </div>
      {(customerIdentityType === 'turkish' || customerIdentityType === 'foreign') && (
        <div ref={documentsRef}>
          <DocumentsBlock customer={customer} customerIdentityType={customerIdentityType} />
        </div>
      )}
      <div ref={contactRef}>
        <ContactBlock customer={customer} customerIdentityType={customerIdentityType} />
      </div>
      <input type="hidden" name="type" value={"Driver's License"} />
    </div>
  );
};

export { AddCustomerPage };

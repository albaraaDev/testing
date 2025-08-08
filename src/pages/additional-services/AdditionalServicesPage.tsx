import { Container } from '@/components';
import React, { Fragment } from 'react';
import { FormattedMessage } from 'react-intl';
import { AdditionalServicesList } from './AdditionalServicesList';

const AdditionalServicesPage = () => {
  return (
    <Fragment>
      <Container>
        <div className="grid gap-5 lg:gap-7.5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xl text-gray-800">
              <FormattedMessage
                id="ADDITIONAL_SERVICES.PAGE.TITLE"
                defaultMessage="Additional Services"
              />
            </h3>
          </div>
          <AdditionalServicesList />
        </div>
      </Container>
    </Fragment>
  );
};

export { AdditionalServicesPage };

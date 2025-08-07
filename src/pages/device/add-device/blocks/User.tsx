import { ParentUserPicker } from '@/components/ParentUserPicker';
import { AddDevicePageProps } from '../AddDevicePage';
import { FormattedMessage } from 'react-intl';

export const User = ({ device }: AddDevicePageProps) => {
  return (
    <div className="card pb-2.5">
      <div className="card-header" id="company_settings">
        <h3 className="card-title">
          <FormattedMessage id="DEVICE.FORM.USER" />
        </h3>
      </div>

      <div className="card-body">
        <ParentUserPicker userId={device?.userId} fieldName="userId" />
      </div>
    </div>
  );
};

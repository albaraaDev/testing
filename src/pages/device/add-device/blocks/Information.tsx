import PhoneInput from '@/components/PhoneInput';
import { AddDevicePageProps } from '../AddDevicePage';
import { useDeviceProvider } from '@/providers/DeviceProvider';
import { useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useAuthContext } from '@/auth';
import { addYears } from 'date-fns';
import { getFormattedDate } from '@/utils';
import { getInstallationStatusOptions, InstallationStatusOption } from '@/api/devices';
import { DistributorDropdown } from './DistributorDropdown';

const Information = ({ device }: AddDevicePageProps) => {
  const { protocols, types, getTypesOfProtocol } = useDeviceProvider();
  const [protocolId, setProtocolId] = useState<string>();
  const [typeId, setTypeId] = useState<string>();
  const { formatMessage } = useIntl();
  const { currentUser } = useAuthContext();
  const [installationStatusOptions, setInstallationStatusOptions] = useState<
    InstallationStatusOption[]
  >([]);

  const isEdit = useMemo(() => !!device, [device]);

  const fetchInstallationStatusOptions = async () => {
    try {
      const res = await getInstallationStatusOptions();
      setInstallationStatusOptions(res);
    } catch (error) {
      console.error('Error fetching installation status options:', error);
    }
  };

  useEffect(() => {
    if (device?.protocolId && protocols && types) {
      setProtocolId(device.protocolId);
      setTypeId(device.typeId);
    }
  }, [device, protocols, types]);

  useEffect(() => {
    fetchInstallationStatusOptions();
  }, []);

  return (
    <div className="card pb-2.5">
      <div className="card-header" id="general_settings">
        <h3 className="card-title">
          <FormattedMessage id="DEVICE.FORM.INFORMATION" />
        </h3>
      </div>
      <div className="card-body grid gap-5">
        <div className="grid lg:grid-cols-2 gap-5">
          <div className="grid gap-2.5">
            <label className="form-label">
              <FormattedMessage id="DEVICE.FORM.NAME" />
            </label>
            <input
              type="text"
              className="input"
              name="name"
              required
              placeholder={formatMessage({ id: 'DEVICE.FORM.NAME.PLACEHOLDER' })}
              defaultValue={device?.name}
            />
          </div>

          <div className="grid gap-2.5">
            <label className="form-label">
              <FormattedMessage id="DEVICE.FORM.IDENTIFY_NUMBER" />
            </label>
            <input
              type="text"
              className="input"
              name="ident"
              required
              placeholder={formatMessage({ id: 'DEVICE.FORM.IDENTIFY_NUMBER.PLACEHOLDER' })}
              defaultValue={device?.ident}
              disabled={isEdit}
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-5">
          <div className="grid gap-2.5">
            <label className="form-label">
              <FormattedMessage id="DEVICE.FORM.PHONE" />
            </label>
            <PhoneInput
              required
              phoneCodeName="phoneCode"
              phoneCodeInitialValue={device?.phoneCode ? device?.phoneCode : '+90'}
              name="phone"
              initialValue={device?.phone}
            />
          </div>

          <div className="grid gap-2.5">
            <label className="form-label">
              <FormattedMessage id="DEVICE.FORM.PROTOCOL" />
            </label>
            <select
              className="select"
              name="protocolId"
              required
              defaultValue={device?.protocolId}
              onChange={(e) => setProtocolId(e.target.value)}
              value={protocolId}
            >
              <option value="">
                <FormattedMessage id="DEVICE.FORM.SELECT_PROTOCOL" />
              </option>
              {Object.entries(protocols).map(([id, data]) => (
                <option key={id} value={id}>
                  {data}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-5">
          <div className="grid gap-2.5">
            <label className="form-label">
              <FormattedMessage id="DEVICE.FORM.TYPE" />
            </label>
            <select
              required
              className="select"
              name="typeId"
              defaultValue={device?.typeId}
              value={typeId}
              onChange={(e) => setTypeId(e.target.value)}
            >
              {protocolId ? (
                <>
                  <option value="">
                    <FormattedMessage id="DEVICE.FORM.SELECT_TYPE" />
                  </option>
                  {getTypesOfProtocol(protocolId).map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </>
              ) : (
                <option>
                  <FormattedMessage id="DEVICE.FORM.SELECT_PROTOCOL_FIRST" />
                </option>
              )}
            </select>
          </div>

          <div className="grid gap-2.5">
            <label className="form-label">
              <FormattedMessage id="DEVICE.FORM.PLATE" />
            </label>
            <input
              type="text"
              className="input"
              name="vehiclePlate"
              placeholder={formatMessage({ id: 'DEVICE.FORM.PLATE.PLACEHOLDER' })}
              defaultValue={device?.vehiclePlate}
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-5">
          <div className="grid gap-2.5">
            <label className="form-label">
              <FormattedMessage id="DEVICE.FORM.SUBSCRIPTION_START_DATE" />
            </label>
            <input
              type="date"
              className="input w-full dark:[color-scheme:dark]"
              name="subscriptionStartDate"
              placeholder="DD/MM/YYYY"
              defaultValue={
                device?.subscriptionStartDate || getFormattedDate(undefined, currentUser?.timezone)
              }
            />
          </div>

          <div className="grid gap-2.5">
            <label className="form-label">
              <FormattedMessage id="DEVICE.FORM.SUBSCRIPTION_END_DATE" />
            </label>
            <input
              type="date"
              className="input w-full dark:[color-scheme:dark]"
              name="subscriptionEndDate"
              placeholder="DD/MM/YYYY"
              defaultValue={
                device?.subscriptionEndDate ||
                getFormattedDate((d) => addYears(d, 1), currentUser?.timezone)
              }
            />
          </div>
        </div>
        <div className="grid lg:grid-cols-2 gap-5">
          <div className="grid gap-2.5">
            <label className="form-label">
              <FormattedMessage id="DEVICE.FORM.INSTALATION_STATUS" />
            </label>
            <select
              className="select"
              name="installationStatus"
              defaultValue={device?.installationStatus}
            >
              {installationStatusOptions.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-2.5">
            <label className="form-label">
              <FormattedMessage id="DEVICE.FORM.INSTALATION_DATE" />
            </label>
            <input
              type="date"
              className="input w-full dark:[color-scheme:dark]"
              name="installationDate"
              placeholder="DD/MM/YYYY"
              defaultValue={
                device?.installationDate || getFormattedDate(undefined, currentUser?.timezone)
              }
            />
          </div>
        </div>
        <div className="grid lg:grid-cols-2 gap-5">
          <DistributorDropdown device={device} required={false} />
          <div className="grid gap-2.5">
            <label className="form-label">
              <FormattedMessage id="DEVICE.FORM.ODOMETER" />
            </label>
            <input
              type="number"
              className="input w-full dark:[color-scheme:dark]"
              name="currentMileage"
              defaultValue={device?.currentMileage}
              placeholder={formatMessage({ id: 'DEVICE.FORM.ODOMETER.PLACEHOLDER' })}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export { Information };

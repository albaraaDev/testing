import PhoneInput from '@/components/PhoneInput';
import { Select, Option } from '@/components/Select';
import { SelectOption } from '@mui/base';
import { countries, getCountryCode } from 'countries-list';
import translatedCountries from 'i18n-iso-countries';
import { AddDriverPageProps } from '../AddDriverPage';
import { FormattedMessage, useIntl } from 'react-intl';
import { useLanguage } from '@/i18n';

const Contact = ({ driver }: AddDriverPageProps) => {
  const intl = useIntl();
  const { currentLanguage } = useLanguage();

  return (
    <div className="card pb-2.5">
      <div className="card-header" id="company_settings">
        <h3 className="card-title">
          <FormattedMessage id="DRIVER.ADD.TAB.CONTACT" />
        </h3>
      </div>
      <div className="card-body grid gap-5">
        <div className="grid lg:grid-cols-3 gap-5">
          <div className="flex flex-col gap-2.5">
            <label className="form-label">
              <FormattedMessage id="USER.ADD.CONTACT.PHONE" />
            </label>
            <PhoneInput
              required
              phoneCodeName="firstPhoneCode"
              phoneCodeInitialValue={driver?.phoneParts ? driver.phoneParts.code : '+90'}
              name="firstPhone"
              initialValue={driver?.phoneParts.phone}
            />
          </div>
          <div className="grid gap-2.5">
            <label className="form-label">
              <FormattedMessage id="USER.ADD.CONTACT.EMAIL" />
            </label>
            <input
              required
              className="input"
              name="email"
              placeholder={intl.formatMessage({ id: 'USER.ADD.CONTACT.EMAIL.PLACEHOLDER' })}
              type="text"
              defaultValue={driver?.driver.email}
            />
          </div>
          <div className="grid gap-2.5">
            <label className="form-label">
              <FormattedMessage id="USER.ADD.CONTACT.PHONE2" />
            </label>
            <PhoneInput
              required
              phoneCodeName="secondPhoneCode"
              phoneCodeInitialValue={driver?.phone2Parts ? driver.phone2Parts.code : '+90'}
              name="secondPhone"
              initialValue={driver?.phone2Parts.phone}
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          <div className="grid gap-2.5">
            <label className="form-label">
              <FormattedMessage id="USER.ADD.CONTACT.COUNTRY" />
            </label>
            <Select
              name="country"
              defaultValue={driver?.country ? driver.country : 'Turkey'}
              renderValue={(option) => {
                if (!option) return null;
                const code = getCountryCode((option as SelectOption<string>).value) as string;

                return (
                  <div className="flex gap-1">
                    <span className={`fi fis fi-${code.toLowerCase()} rounded-full !size-5`} />
                    <span>
                      {translatedCountries.getName(code, currentLanguage.code, {
                        select: 'official'
                      })}
                    </span>
                  </div>
                );
              }}
            >
              {Object.entries(countries).map(([code, country]) => (
                <Option key={code} value={country.name}>
                  <div className="flex gap-1">
                    <span className={`fi fis fi-${code.toLowerCase()} rounded-full !size-5`} />
                    <span>
                      {translatedCountries.getName(code, currentLanguage.code, {
                        select: 'official'
                      })}
                    </span>
                  </div>
                </Option>
              ))}
            </Select>
          </div>

          <div className="grid gap-2.5">
            <label className="form-label">
              <FormattedMessage id="USER.ADD.CONTACT.CITY" />
            </label>
            <input
              required
              type="text"
              className="input"
              placeholder={intl.formatMessage({ id: 'USER.ADD.CONTACT.CITY.PLACEHOLDER' })}
              name="city"
              defaultValue={driver?.city}
            />
          </div>
          <div className="grid gap-2.5">
            <label className="form-label">
              <FormattedMessage id="USER.ADD.CONTACT.AREA" />
            </label>
            <input
              required
              type="text"
              className="input"
              placeholder={intl.formatMessage({ id: 'USER.ADD.CONTACT.AREA.PLACEHOLDER' })}
              name="state"
              defaultValue={driver?.state}
            />
          </div>
        </div>
        <div className="grid gap-2.5">
          <label className="form-label">
            <FormattedMessage id="USER.ADD.CONTACT.ADDRESS" />
          </label>
          <input
            required
            type="text"
            className="input"
            placeholder={intl.formatMessage({ id: 'USER.ADD.CONTACT.ADDRESS.PLACEHOLDER' })}
            name="address"
            defaultValue={driver?.address}
          />
        </div>
      </div>
    </div>
  );
};

export { Contact };

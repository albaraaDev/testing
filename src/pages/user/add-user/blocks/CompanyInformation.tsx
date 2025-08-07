import FileUpload from '@/components/FileUpload';
import { FormattedMessage, useIntl } from 'react-intl';
import { AddUserPageProps } from '../AddUserPage';

const CompanyInformation = ({ user }: AddUserPageProps) => {
  const intl = useIntl();
  return (
    <>
      <div className="card-header" id="general_settings">
        <h3 className="card-title">
          <FormattedMessage id="USER.ADD.COMPANY_INFO.TITLE" />
        </h3>
      </div>
      <div className="card-body grid gap-5">
        <div className="grid lg:grid-cols-3 gap-5">
          <div className="flex flex-col gap-2.5">
            <label className="form-label">
              <FormattedMessage id="USER.ADD.COMPANY_INFO.TAX_NUMBER" />
            </label>
            <input
              type="text"
              className="input"
              name="companyTaxNumber"
              placeholder={intl.formatMessage({
                id: 'USER.ADD.COMPANY_INFO.TAX_NUMBER.PLACEHOLDER'
              })}
              defaultValue={user?.companyTaxNumber ?? ''}
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-5">
          <div className="flex flex-col gap-2.5">
            <label className="form-label">
              <FormattedMessage id="USER.ADD.COMPANY_INFO.CONTRACT_PDF" />
            </label>
            <FileUpload name="contractPdfFile" isUploaded={!!user?.contractPdf} />
          </div>
          <div className="grid gap-2.5">
            <label className="form-label">
              <FormattedMessage id="USER.ADD.COMPANY_INFO.TAX_PLATE" />
            </label>
            <FileUpload name="taxPlateFile" isUploaded={!!user?.taxPlate} />
          </div>
        </div>
      </div>
    </>
  );
};

const CompanyInformationBlock = ({ user }: AddUserPageProps) => {
  return (
    <div className="card pb-2.5">
      <CompanyInformation user={user} />
    </div>
  );
};

export { CompanyInformation, CompanyInformationBlock };

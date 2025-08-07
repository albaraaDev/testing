import { IMaintenanceTypeTableData } from '@/api/maintenance-type';
import { FormattedMessage, useIntl } from 'react-intl';

export interface AddMaintenanceTypePageProps {
  type?: IMaintenanceTypeTableData;
}

const AddMaintenanceTypePage = ({ type }: AddMaintenanceTypePageProps) => {
  const intl = useIntl();

  return (
    <div className="grid gap-5 lg:gap-7.5 xl:w-[60rem] mx-auto">
      <div className="card">
        <div className="card-header" id="maintenance_settings">
          <h3 className="card-title">
            <FormattedMessage id="MAINTENANCE_TYPE.FORM.TITLE" />
          </h3>
        </div>
        <div className="card-body grid lg:grid-cols-2 gap-5">
          <div className="grid gap-2.5">
            <label className="form-label">
              <FormattedMessage id="MAINTENANCE_TYPE.FORM.FIELD.TITLE_EN" />
            </label>
            <input
              type="text"
              id="titleEn"
              name="titleEn"
              className="input"
              placeholder={intl.formatMessage({
                id: 'MAINTENANCE_TYPE.FORM.FIELD.TITLE_EN.PLACEHOLDER'
              })}
              defaultValue={type?.title?.en}
            />
          </div>

          <div className="grid gap-2.5">
            <label className="form-label">
              <FormattedMessage id="MAINTENANCE_TYPE.FORM.FIELD.TITLE_AR" />
            </label>
            <input
              type="text"
              id="titleAr"
              name="titleAr"
              className="input"
              placeholder={intl.formatMessage({
                id: 'MAINTENANCE_TYPE.FORM.FIELD.TITLE_AR.PLACEHOLDER'
              })}
              defaultValue={type?.title?.ar}
            />
          </div>

          <div className="grid gap-2.5">
            <label className="form-label">
              <FormattedMessage id="MAINTENANCE_TYPE.FORM.FIELD.TITLE_TR" />
            </label>
            <input
              type="text"
              id="titleTr"
              name="titleTr"
              className="input"
              placeholder={intl.formatMessage({
                id: 'MAINTENANCE_TYPE.FORM.FIELD.TITLE_TR.PLACEHOLDER'
              })}
              defaultValue={type?.title?.tr}
            />
          </div>

          <div className="grid gap-2.5">
            <label className="form-label">
              <FormattedMessage id="MAINTENANCE_TYPE.FORM.FIELD.CODE" />
            </label>
            <input
              type="text"
              id="code"
              name="code"
              className="input"
              placeholder={intl.formatMessage({
                id: 'MAINTENANCE_TYPE.FORM.FIELD.CODE.PLACEHOLDER'
              })}
              defaultValue={type?.code}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export { AddMaintenanceTypePage };

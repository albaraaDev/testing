import FileUpload from '@/components/FileUpload';
import { AddUserPageProps } from '../AddUserPage';
import { useEffect, useMemo, useState } from 'react';
import { useAuthContext } from '@/auth';
import RoleComponent from '@/components/RoleComponent';
import { FormattedMessage, useIntl } from 'react-intl';
import { getFormattedDate } from '@/utils';
import { getRoles, Role } from '@/api/roles';

const Information = (props: AddUserPageProps) => {
  const { user } = props;

  const { currentUser } = useAuthContext();
  const [status, setStatus] = useState<boolean>(true);
  const intl = useIntl();

  useEffect(() => {
    if (user?.status) {
      setStatus(user.status);
    }
  }, [user]);

  return (
    <>
      <div className="card-header" id="general_settings">
        <h3 className="card-title">
          <FormattedMessage id="USER.ADD.INFORMATION.TITLE" />
        </h3>
      </div>
      <div className="card-body grid gap-5">
        <div className="grid lg:grid-cols-2 gap-5">
          <div className="flex flex-col gap-2.5">
            <label className="form-label">
              <FormattedMessage id="USER.ADD.INFORMATION.NAME" />
            </label>
            <input
              required
              type="text"
              className="input"
              name="name"
              placeholder={intl.formatMessage({ id: 'USER.ADD.INFORMATION.NAME.PLACEHOLDER' })}
              defaultValue={user?.name || undefined}
            />
          </div>
          <div className="flex flex-col gap-2.5">
            <label className="form-label">
              <FormattedMessage id="USER.ADD.INFORMATION.IDENTIFY_NUMBER" />
            </label>
            <input
              required
              type="text"
              className="input"
              name="identifyNumber"
              placeholder={intl.formatMessage({
                id: 'USER.ADD.INFORMATION.IDENTIFY_NUMBER.PLACEHOLDER'
              })}
              defaultValue={user?.identifyNumber || undefined}
            />
          </div>
          <div className="flex flex-col gap-2.5">
            <label className="form-label">
              <FormattedMessage id="USER.ADD.INFORMATION.SUBSCRIPTION_START_DATE" />
            </label>
            <input
              required
              type="date"
              className="input w-full dark:[color-scheme:dark]"
              name="subscriptionStartDate"
              placeholder={intl.formatMessage({ id: 'COMMON.DATE.FORMAT' })}
              defaultValue={
                user?.subscriptionStartDate ||
                getFormattedDate(undefined, currentUser?.timezone || undefined)
              }
            />
          </div>
          <div className="flex flex-col gap-2.5">
            <label className="form-label">
              <FormattedMessage id="USER.ADD.INFORMATION.TIMEZONE" />
            </label>
            <select
              required
              className="select"
              name="timezone"
              defaultValue={user?.timezone ? user.timezone : 'Europe/Istanbul'}
            >
              {Intl.supportedValuesOf('timeZone').map((timezone) => (
                <option key={timezone} value={timezone}>
                  {timezone}
                </option>
              ))}
            </select>
          </div>

          <RoleComponent role={['ADMIN', 'SUPER_ADMIN', 'MANAGER']}>
            <RoleSelect {...props} />
          </RoleComponent>
          <RoleComponent role="user">
            <input type="hidden" name="role" value="user" />
          </RoleComponent>
        </div>

        <div className="grid lg:grid-cols-2 gap-5">
          <div className="flex flex-col gap-2.5">
            <label className="form-label">
              <FormattedMessage id="USER.ADD.INFORMATION.FRONT_PHOTO" />
            </label>
            <FileUpload name="frontPhotoNationalIdFile" isUploaded={!!user?.frontPhotoNationalId} />
          </div>
          <div className="flex flex-col gap-2.5">
            <label className="form-label">
              <FormattedMessage id="USER.ADD.INFORMATION.BACK_PHOTO" />
            </label>
            <FileUpload name="nationalIdBackgroundFile" isUploaded={!!user?.nationalIdBackground} />
          </div>
        </div>
        <RoleComponent role={['ADMIN', 'SUPER_ADMIN', 'MANAGER']}>
          <div className="grid gap-2.5">
            <label className="form-label">
              <FormattedMessage id="USER.ADD.INFORMATION.STATUS" />
            </label>
            <div className="flex items-center">
              <div className="flex items-center gap-2.5">
                <div className="switch switch-sm">
                  <input
                    name="status"
                    type="checkbox"
                    value="true"
                    checked={status}
                    onChange={() => setStatus((s) => !s)}
                  />
                </div>
              </div>
            </div>
          </div>
        </RoleComponent>
        <RoleComponent role="user">
          <input type="hidden" name="status" value={`${user?.status || false}`} />
        </RoleComponent>
      </div>
    </>
  );
};

const InformationBlock = (props: AddUserPageProps) => {
  return (
    <div className="card pb-2.5">
      <Information {...props} />
    </div>
  );
};

const RoleSelect = (props: AddUserPageProps) => {
  const user = props.user;
  const roleEditable = props?.roleEditable !== false;

  const [userRoles, setUserRoles] = useState<Role[]>([]);

  const roleSelectKey = useMemo(() => {
    return userRoles.map((role) => role.name).join(',');
  }, [userRoles]);
  const roleDefaultValue = useMemo(() => {
    return user?.role ? user.role : 'user';
  }, [user]);

  const getUserRoles = async () => {
    try {
      const response = await getRoles();
      setUserRoles(response);
    } catch (error) {
      console.error('Error fetching user roles:', error);
    }
  };

  useEffect(() => {
    getUserRoles();
  }, []);

  const options = useMemo(() => {
    return userRoles.map((role) => (
      <option key={role.id} value={role.name}>
        {role.name}
      </option>
    ));
  }, [userRoles]);

  return (
    <div className="flex flex-col gap-2.5">
      <label className="form-label">
        <FormattedMessage id="USER.ADD.INFORMATION.ROLE" />
      </label>
      <select
        key={'visible' + roleSelectKey}
        required={roleEditable}
        className="select"
        name={roleEditable ? 'role' : 'role-hidden'}
        defaultValue={roleDefaultValue}
        disabled={!roleEditable}
      >
        {options}
      </select>
      {/* with roleEditable set to false, we dont want the user to edit the role, but still wanna send the payload with the selected role. so we need to have a hidden input with the correct name and options */}
      {!roleEditable && (
        <select key={'hidden' + roleSelectKey} hidden name="role" value={roleDefaultValue}>
          {options}
        </select>
      )}
    </div>
  );
};

export { Information, InformationBlock };

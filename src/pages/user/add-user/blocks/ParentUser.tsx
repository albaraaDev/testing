import { FormattedMessage } from 'react-intl';
import { AddUserPageProps } from '../AddUserPage';
import { ParentUserPicker } from '@/components/ParentUserPicker';

const ParentUser = ({ user }: AddUserPageProps) => {
  return (
    <>
      <div className="card-header" id="general_settings">
        <h3 className="card-title">
          <FormattedMessage id="USER.ADD.PARENT_USER.TITLE" />
        </h3>
      </div>
      <div className="card-body grid gap-5">
        <ParentUserPicker userId={user?.parentId || undefined} fieldName="parentId" />
      </div>
    </>
  );
};

export { ParentUser };

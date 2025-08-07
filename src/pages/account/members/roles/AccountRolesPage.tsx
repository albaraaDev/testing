import { Fragment, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { Container } from '@/components/container';
import {
  Toolbar,
  ToolbarActions,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle
} from '@/partials/toolbar';
import { PageNavbar } from '@/pages/account';

import { AccountRolesContent } from '.';
import { useLayout } from '@/providers';
import { RoleModal } from './blocks';

const AccountRolesPage = () => {
  const { currentLayout } = useLayout();
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  return (
    <Fragment>
      <PageNavbar />

      {currentLayout?.name === 'demo1-layout' && (
        <Container>
          <Toolbar>
            <ToolbarHeading>
              <ToolbarPageTitle />
              <ToolbarDescription>
                <FormattedMessage id="ROLES.PAGE.OVERVIEW" />
              </ToolbarDescription>
            </ToolbarHeading>{' '}
            <ToolbarActions>
              <button className="btn btn-sm btn-light" onClick={() => setIsRoleModalOpen(true)}>
                <FormattedMessage id="ROLES.PAGE.NEW_ROLE" />
              </button>
            </ToolbarActions>
          </Toolbar>
        </Container>
      )}

      <Container>
        <AccountRolesContent />
      </Container>

      {/* Role Modal */}
      <RoleModal
        open={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        onSuccess={() => {
          // Need to refresh the roles list in AccountRolesContent
          // We can use a window.location.reload() or implement a more elegant state management
          // For now, just reload the page after successful role creation
          window.location.reload();
        }}
      />
    </Fragment>
  );
};

export { AccountRolesPage };

import { Fragment, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useIntl } from 'react-intl';

import { Container } from '@/components/container';
import { Toolbar, ToolbarActions, ToolbarHeading, ToolbarPageTitle } from '@/partials/toolbar';
import { PageNavbar } from '@/pages/account';

import { AccountPermissionsCheckContent } from '.';
import { useLayout } from '@/providers';
import { Role, getRole } from '@/api/roles';

const AccountPermissionsCheckPage = () => {
  const intl = useIntl();
  const { currentLayout } = useLayout();
  const { id } = useParams<{ id: string }>();
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRole = async () => {
      if (!id) {
        setError('Role ID not provided');
        return;
      }

      setLoading(true);
      try {
        const roleData = await getRole(id);
        setRole(roleData);
      } catch (err) {
        console.error('Error fetching role:', err);
        setError('Failed to load role information');
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, [id]);

  return (
    <Fragment>
      <PageNavbar />

      {currentLayout?.name === 'demo1-layout' && (
        <Container>
          <Toolbar>
            <ToolbarHeading>
              <ToolbarPageTitle />
            </ToolbarHeading>
            <ToolbarActions>
              <a href="/roles/list" className="btn btn-sm btn-light">
                {intl.formatMessage({ id: 'ROLES.PERMISSIONS.BACK_TO_ROLES' })}
              </a>
            </ToolbarActions>
          </Toolbar>
        </Container>
      )}

      <Container>
        {loading ? (
          <div className="card p-6">
            <div className="text-center">Loading role information...</div>
          </div>
        ) : error ? (
          <div className="card p-6">
            <div className="text-center text-red-500">{error}</div>
          </div>
        ) : (
          <AccountPermissionsCheckContent role={role} />
        )}
      </Container>
    </Fragment>
  );
};

export { AccountPermissionsCheckPage };

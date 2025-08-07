import { Container } from '@/components/container';
import { Toolbar, ToolbarHeading } from '@/layouts/demo1/toolbar';

import { DashboardContent } from '.';
import { FormattedMessage } from 'react-intl';

const DashboardPage = () => {
  return (
    <>
      <Container>
        <Toolbar>
          <ToolbarHeading title={<FormattedMessage id="SIDEBAR.MENU.DASHBOARD" />} description="" />
        </Toolbar>

        <DashboardContent />
      </Container>
    </>
  );
};

export { DashboardPage };

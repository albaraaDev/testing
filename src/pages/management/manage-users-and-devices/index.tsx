import { Container } from '@/components';
import clsx from 'clsx';
import { FormattedMessage } from 'react-intl';
import { NavLink, Outlet, Navigate, useLocation } from 'react-router-dom';

const navLinks = [
  { to: 'users', label: <FormattedMessage id="SIDEBAR.MENU.MANAGEMENT.USERS" /> },
  { to: 'devices', label: <FormattedMessage id="SIDEBAR.MENU.MANAGEMENT.DEVICES" /> },
  {
    to: 'distributors',
    label: <FormattedMessage id="SIDEBAR.MENU.MANAGEMENT.DISTRIBUTORS" />
  }
];

export default function ManageUsersAndDevices() {
  const location = useLocation();

  if (location.pathname.endsWith('/management')) {
    return <Navigate to="users" replace />;
  }

  return (
    <Container>
      <div className="grid gap-4 grid-cols-4 lg:grid-cols-8 mb-4">
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              clsx(
                'items-center btn h-full justify-center p-2 text-sm rounded-lg border-2',
                isActive ? 'btn-info' : 'btn-light text-info hover:text-info'
              )
            }
          >
            {link.label}
          </NavLink>
        ))}
      </div>
      <Outlet />
    </Container>
  );
}

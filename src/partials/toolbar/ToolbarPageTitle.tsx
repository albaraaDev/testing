import { useLocation } from 'react-router';

import { useMenuCurrentItem } from '@/components/menu';
import { useMenus } from '@/providers';

import { IToolbarPageTitleProps } from './types';
import { useIntl } from 'react-intl';

const ToolbarPageTitle = ({ text }: IToolbarPageTitleProps) => {
  const intl = useIntl();
  const { pathname } = useLocation();
  const { getMenuConfig } = useMenus();
  const menuConfig = getMenuConfig('primary');
  const menuItem = useMenuCurrentItem(pathname, menuConfig);

  return (
    <h1 className="text-xl font-medium leading-none text-gray-900">
      {text ?? (menuItem?.title && intl.formatMessage({ id: menuItem?.title }))}
    </h1>
  );
};

export { ToolbarPageTitle };

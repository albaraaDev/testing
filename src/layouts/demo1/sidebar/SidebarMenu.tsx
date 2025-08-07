import clsx from 'clsx';
import { KeenIcon } from '@/components/keenicons';
import {
  IMenuItemConfig,
  Menu,
  MenuArrow,
  MenuBadge,
  MenuBullet,
  TMenuConfig,
  MenuHeading,
  MenuIcon,
  MenuItem,
  MenuLabel,
  MenuLink,
  MenuSub,
  MenuTitle
} from '@/components/menu';

import { useMenus } from '@/providers';
import { toAbsoluteUrl } from '@/utils';
import RoleComponent from '@/components/RoleComponent';
import { FormattedMessage } from 'react-intl';
import { useLocation } from 'react-router-dom';
// Import icon components from menu-icons-tsx
import * as MenuIcons from '@/assets/svg/menu-icons-tsx';

const SidebarMenu = () => {
  const linkPl = 'ps-[10px]';
  const linkPr = 'pe-[10px]';
  const linkPy = 'py-[6px]';
  const itemsGap = 'gap-0.5';
  const subLinkPy = 'py-[8px]';
  const rightOffset = 'me-[-10px]';
  const iconWidth = 'w-[20px]';
  const iconSize = 'text-lg';
  const accordionLinkPl = 'ps-[10px]';
  const accordionLinkGap = [
    'gap-[10px]',
    'gap-[14px]',
    'gap-[5px]',
    'gap-[5px]',
    'gap-[5px]',
    'gap-[5px]'
  ];
  const accordionPl = [
    'ps-[10px]',
    'ps-[22px]',
    'ps-[22px]',
    'ps-[22px]',
    'ps-[22px]',
    'ps-[22px]'
  ];
  const accordionBorderLeft = [
    'before:start-[20px]',
    'before:start-[32px]',
    'before:start-[32px]',
    'before:start-[32px]',
    'before:start-[32px]'
  ];

  const { pathname } = useLocation();

  const isPathActive = (itemPath?: string) => {
    if (!itemPath) return false;
    return pathname === itemPath || pathname.startsWith(`${itemPath}/`);
  };

  const buildMenu = (items: TMenuConfig) => {
    return items.map((item, index) => {
      if (item.heading) {
        return buildMenuHeading(item, index);
      } else if (item.disabled) {
        return buildMenuItemRootDisabled(item, index);
      } else {
        return buildMenuItemRoot(item, index);
      }
    });
  };

  const buildMenuItemRoot = (item: IMenuItemConfig, index: number) => {
    const isActive = isPathActive(item.path);

    if (item.children) {
      return (
        <RoleComponent key={index} role={item.role}>
          <MenuItem
            {...(item.toggle && { toggle: item.toggle })}
            {...(item.trigger && { trigger: item.trigger })}
          >
            <MenuLink
              className={clsx(
                'flex items-center grow cursor-pointer border border-transparent',
                accordionLinkGap[0],
                linkPl,
                linkPr,
                linkPy
              )}
            >
              <MenuIcon className={clsx('items-start text-gray-500 dark:text-gray-400', iconWidth)}>
                <>
                  {item.icon && <KeenIcon icon={item.icon} className={iconSize} />}
                  {item.externalIcon && getMenuIcon(item.externalIcon, isActive)}
                </>
              </MenuIcon>
              <MenuTitle className="text-sm font-medium text-gray-800 menu-item-active:text-primary menu-link-hover:!text-primary">
                <FormattedMessage id={item.title} />
              </MenuTitle>
              {buildMenuArrow()}
            </MenuLink>
            <MenuSub
              className={clsx(
                'relative before:absolute before:top-0 before:bottom-0 before:border-s before:border-gray-200',
                itemsGap,
                accordionBorderLeft[0],
                accordionPl[0]
              )}
            >
              {buildMenuItemChildren(item.children, index, 1)}
            </MenuSub>
          </MenuItem>
        </RoleComponent>
      );
    } else {
      return (
        <RoleComponent key={index} role={item.role}>
          <MenuItem>
            <MenuLink
              path={item.path}
              className={clsx(
                'border border-transparent menu-item-active:bg-secondary-active dark:menu-item-active:bg-coal-300 dark:menu-item-active:border-gray-100 menu-item-active:rounded-lg hover:bg-secondary-active dark:hover:bg-coal-300 dark:hover:border-gray-100 hover:rounded-lg',
                accordionLinkGap[0],
                linkPy,
                linkPl,
                linkPr
              )}
            >
              <MenuIcon
                className={clsx(
                  'items-start text-gray-600 dark:text-gray-500 menu-item-active:text-primary menu-link-hover:!text-primary',
                  iconWidth
                )}
              >
                {item.icon && <KeenIcon icon={item.icon} className={iconSize} />}
                {item.externalIcon && getMenuIcon(item.externalIcon, isActive)}
              </MenuIcon>
              <MenuTitle className="text-sm font-medium text-gray-800 menu-item-active:text-primary menu-link-hover:!text-primary">
                <FormattedMessage id={item.title} />
              </MenuTitle>
            </MenuLink>
          </MenuItem>
        </RoleComponent>
      );
    }
  };

  const buildMenuItemRootDisabled = (item: IMenuItemConfig, index: number) => {
    return (
      <MenuItem key={index}>
        <MenuLabel
          className={clsx('border border-transparent', accordionLinkGap[0], linkPy, linkPl, linkPr)}
        >
          <MenuIcon className={clsx('items-start text-gray-500 dark:text-gray-400', iconWidth)}>
            {item.icon && <KeenIcon icon={item.icon} className={iconSize} />}
          </MenuIcon>
          <MenuTitle className="text-sm font-medium text-gray-800">
            <FormattedMessage id={item.title} />
          </MenuTitle>

          {item.disabled && buildMenuSoon()}
        </MenuLabel>
      </MenuItem>
    );
  };

  const buildMenuItemChildren = (items: TMenuConfig, index: number, level: number = 0) => {
    return items.map((item, index) => {
      if (item.disabled) {
        return buildMenuItemChildDisabled(item, index, level);
      } else {
        return buildMenuItemChild(item, index, level);
      }
    });
  };

  const buildMenuItemChild = (item: IMenuItemConfig, index: number, level: number = 0) => {
    const isActive = isPathActive(item.path);

    if (item.children) {
      return (
        <RoleComponent key={index} role={item.role}>
          <MenuItem
            {...(item.toggle && { toggle: item.toggle })}
            {...(item.trigger && { trigger: item.trigger })}
            className={clsx(item.collapse && 'flex-col-reverse')}
          >
            <MenuLink
              className={clsx(
                'border border-transparent grow cursor-pointer',
                accordionLinkGap[level],
                accordionLinkPl,
                linkPr,
                subLinkPy
              )}
            >
              {buildMenuBullet()}

              {item.collapse ? (
                <MenuTitle className="text-2sm font-normal text-gray-600 dark:text-gray-500">
                  <span className="hidden menu-item-show:!flex">{item.collapseTitle}</span>
                  <span className="flex menu-item-show:hidden">{item.expandTitle}</span>
                </MenuTitle>
              ) : (
                <MenuTitle
                  className={clsx(
                    'text-2sm font-normal me-1 text-gray-800 menu-link-hover:!text-primary',
                    isActive && 'text-primary font-medium'
                  )}
                >
                  <FormattedMessage id={item.title} />
                </MenuTitle>
              )}

              {buildMenuArrow()}
            </MenuLink>
            <MenuSub
              className={clsx(
                !item.collapse &&
                  'relative before:absolute before:top-0 before:bottom-0 before:border-s before:border-gray-200',
                itemsGap,
                !item.collapse && accordionBorderLeft[level],
                !item.collapse && accordionPl[level],
                !item.collapse && 'relative before:absolute'
              )}
            >
              {buildMenuItemChildren(item.children, index, item.collapse ? level : level + 1)}
            </MenuSub>
          </MenuItem>
        </RoleComponent>
      );
    } else {
      return (
        <RoleComponent key={index} role={item.role}>
          <MenuItem>
            <MenuLink
              path={item.path}
              className={clsx(
                'border border-transparent items-center grow hover:bg-secondary-active dark:hover:bg-coal-300 dark:hover:border-gray-100 hover:rounded-lg',
                isActive && 'bg-secondary-active dark:bg-coal-300 dark:border-gray-100 rounded-lg',
                accordionLinkGap[level],
                accordionLinkPl,
                linkPr,
                subLinkPy
              )}
            >
              {buildMenuBullet()}
              <MenuTitle
                className={clsx(
                  'text-2sm font-normal text-gray-800 menu-link-hover:!text-primary',
                  isActive && 'text-primary font-semibold'
                )}
              >
                <FormattedMessage id={item.title} />
              </MenuTitle>
            </MenuLink>
          </MenuItem>
        </RoleComponent>
      );
    }
  };

  const buildMenuItemChildDisabled = (item: IMenuItemConfig, index: number, level: number = 0) => {
    return (
      <MenuItem key={index}>
        <MenuLabel
          className={clsx(
            'border border-transparent items-center grow',
            accordionLinkGap[level],
            accordionLinkPl,
            linkPr,
            subLinkPy
          )}
        >
          {buildMenuBullet()}
          <MenuTitle className="text-2sm font-normal text-gray-800">
            <FormattedMessage id={item.title} />
          </MenuTitle>
          {item.disabled && buildMenuSoon()}
        </MenuLabel>
      </MenuItem>
    );
  };

  const buildMenuHeading = (item: IMenuItemConfig, index: number) => {
    return (
      <MenuItem key={index} className="pt-2.25 pb-px">
        <MenuHeading
          className={clsx('uppercase text-2sm font-medium text-gray-500', linkPl, linkPr)}
        >
          {item.heading}
        </MenuHeading>
      </MenuItem>
    );
  };

  const buildMenuArrow = () => {
    return (
      <MenuArrow className={clsx('text-gray-400 w-[20px] shrink-0 justify-end ms-1', rightOffset)}>
        <KeenIcon icon="plus" className="text-2xs menu-item-show:hidden" />
        <KeenIcon icon="minus" className="text-2xs hidden menu-item-show:inline-flex" />
      </MenuArrow>
    );
  };

  const buildMenuBullet = () => {
    return (
      <MenuBullet className="flex w-[6px] relative before:absolute before:top-0 before:size-[6px] before:rounded-full rtl:before:translate-x-1/2 before:-translate-y-1/2 menu-item-active:before:bg-primary menu-item-hover:before:bg-primary"></MenuBullet>
    );
  };

  const buildMenuSoon = () => {
    return (
      <MenuBadge className={rightOffset}>
        <span className="badge badge-xs">Soon</span>
      </MenuBadge>
    );
  };

  // Helper function to get the correct icon component
  const getMenuIcon = (iconName: string, isActive: boolean) => {
    const iconComponentName = `${iconName.charAt(0).toUpperCase() + iconName.slice(1)}Icon`;
    const IconComponent = MenuIcons[iconComponentName as keyof typeof MenuIcons];
    return IconComponent ? (
      <IconComponent className={iconSize} fill={isActive ? '#5271FF' : '#4A4B68'} />
    ) : null;
  };

  const { getMenuConfig } = useMenus();
  const menuConfig = getMenuConfig('primary');

  return (
    <Menu highlight={false} multipleExpand={true} className={clsx('flex flex-col grow', itemsGap)}>
      {menuConfig && buildMenu(menuConfig)}
    </Menu>
  );
};

export { SidebarMenu };

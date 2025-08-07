import { useRef } from 'react';
import { toAbsoluteUrl } from '@/utils';
import { Menu, MenuItem, MenuToggle } from '@/components';
import { DropdownUser } from '@/partials/dropdowns/user';
import { useLanguage } from '@/i18n';
import { NotificationsDropdown } from '@/layouts/demo1/header/notifications';

const HeaderTopbar = () => {
  const { isRTL } = useLanguage();
  const itemUserRef = useRef<any>(null);
  const itemNotificationsRef = useRef<any>(null);

  const handleShow = () => {
    window.dispatchEvent(new Event('resize'));
  };

  return (
    <div className="flex items-center gap-2 lg:gap-3.5">
      <Menu>
        <MenuItem
          ref={itemNotificationsRef}
          onShow={handleShow}
          toggle="dropdown"
          trigger="click"
          dropdownProps={{
            placement: isRTL() ? 'bottom-start' : 'bottom-end',
            modifiers: [
              {
                name: 'offset',
                options: {
                  offset: isRTL() ? [-170, 10] : [170, 10]
                }
              }
            ]
          }}
        >
          <MenuToggle className="btn btn-icon btn-icon-lg size-9 rounded-full bg-white dark:bg-[#0D0E12] hover:bg-primary-light hover:text-primary dropdown-open:bg-primary-light dropdown-open:text-primary text-gray-500">
            <img src={toAbsoluteUrl('/media/icons/notifications.svg')} alt="notifications" />
          </MenuToggle>
          {NotificationsDropdown({ menuItemRef: itemNotificationsRef })}
        </MenuItem>
      </Menu>

      <Menu>
        <MenuItem
          ref={itemUserRef}
          toggle="dropdown"
          trigger="click"
          dropdownProps={{
            placement: isRTL() ? 'bottom-start' : 'bottom-end',
            modifiers: [
              {
                name: 'offset',
                options: {
                  offset: isRTL() ? [-20, 10] : [20, 10] // [skid, distance]
                }
              }
            ]
          }}
        >
          <MenuToggle className="btn btn-icon rounded-full">
            <img
              className="size-9 rounded-full border-2 border-success shrink-0"
              src={toAbsoluteUrl('/media/avatars/avatar-placeholder.png')}
              alt=""
            />
          </MenuToggle>
          {DropdownUser({ menuItemRef: itemUserRef })}
        </MenuItem>
      </Menu>
    </div>
  );
};

export { HeaderTopbar };

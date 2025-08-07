import { KeenIcon, Menu, MenuItem, MenuLink, MenuSub, MenuTitle, MenuToggle } from '@/components';
import { useIntl } from 'react-intl';
import { useState, useEffect } from 'react';

export interface StatusDropdownProps {
  selected: string;
  // eslint-disable-next-line no-unused-vars
  setSelected: (value: string) => void;
  readOnly?: boolean;
  options: Record<
    string,
    {
      color: string;
      backgroundColor: string;
      name?: string;
      nameKey?: string; // new property to support translation keys
    }
  >;
}

export const StatusDropdown = ({
  selected,
  setSelected,
  options,
  readOnly = false
}: StatusDropdownProps) => {
  const intl = useIntl();
  // Local state to provide immediate visual feedback
  const [localSelected, setLocalSelected] = useState(selected);

  // Update local state when prop changes
  useEffect(() => {
    setLocalSelected(selected);
  }, [selected]);

  const getOptionLabel = (key: string) => {
    const option = options[key];
    if (option?.nameKey) {
      return intl.formatMessage({ id: option.nameKey, defaultMessage: option.name || key });
    }
    return option?.name || key;
  };

  if (readOnly) {
    return (
      <div
        className="btn btn-clear font-bold text-xs h-fit px-3 py-[6px] cursor-default"
        style={{
          color: options[selected]?.color ? options[selected]?.color + 'AA' : 'white',
          backgroundColor: options[selected]?.backgroundColor ?? 'gray'
        }}
      >
        {getOptionLabel(selected)}
      </div>
    );
  }

  return (
    <Menu>
      <MenuItem
        toggle="dropdown"
        trigger="click"
        dropdownProps={{
          placement: 'bottom-start',
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [0, 10] // [skid, distance]
              }
            }
          ]
        }}
      >
        <MenuToggle
          className="btn btn-clear font-bold text-xs h-fit px-3 py-[6px]"
          style={{
            color: options[localSelected]?.color ?? 'white',
            backgroundColor: options[localSelected]?.color
              ? options[localSelected]?.color + '22'
              : 'gray'
          }}
        >
          {getOptionLabel(localSelected)}
          <KeenIcon icon="down" className="!text-inherit !text-xs" />
        </MenuToggle>
        <MenuSub className="menu-default" rootClassName="w-full max-w-[200px]">
          {Object.entries(options).map(([key, option]) => (
            <MenuItem
              key={key}
              onClick={() => {
                // Update local state immediately for visual feedback
                setLocalSelected(key);
                // Update actual state through callback
                setSelected(key);
              }}
            >
              <MenuLink>
                <MenuTitle>
                  <div style={{ color: option.color }}>
                    {option.nameKey
                      ? intl.formatMessage({
                          id: option.nameKey,
                          defaultMessage: option.name || key
                        })
                      : option.name || key}
                  </div>
                </MenuTitle>
              </MenuLink>
            </MenuItem>
          ))}
        </MenuSub>
      </MenuItem>
    </Menu>
  );
};

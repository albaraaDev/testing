import * as React from 'react';
import { useAutocomplete, UseAutocompleteProps } from '@mui/base/useAutocomplete';
import { Popper } from '@mui/base/Popper';
import { unstable_useForkRef as useForkRef } from '@mui/utils';
import clsx from 'clsx';

interface AdditionalProps<T> {
  // eslint-disable-next-line no-unused-vars
  renderValue: (option: T) => React.ReactNode;
  // eslint-disable-next-line no-unused-vars
  renderPrefix?: (option: T) => React.ReactNode;
  direction?: 'ltr' | 'rtl';
}

export const Autocomplete = React.forwardRef(function Autocomplete(
  props: UseAutocompleteProps<string, false, false, false> & AdditionalProps<string>,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  const {
    disabled = false,
    readOnly = false,
    renderValue,
    renderPrefix,
    value,
    direction,
    ...other
  } = props;

  const {
    getRootProps,
    getInputProps,
    getListboxProps,
    getOptionProps,
    groupedOptions,
    id,
    popupOpen,
    anchorEl,
    setAnchorEl
  } = useAutocomplete({
    ...props,
    componentName: 'PhoneAutoComplete'
  });

  const rootRef = useForkRef(ref, setAnchorEl);

  return (
    <React.Fragment>
      <div
        {...getRootProps(other)}
        ref={rootRef}
        className={clsx(
          'h-full flex gap-[5px] px-[5px] overflow-hidden w-30 rounded-md border-r focus-within:border-primary items-center'
        )}
      >
        {renderPrefix && value && renderPrefix(value)}
        <input
          id={id}
          disabled={disabled}
          readOnly={readOnly}
          required
          {...getInputProps()}
          className={clsx(
            direction &&
              (direction === 'rtl'
                ? '![background-position-x:left]'
                : '![background-position-x:right]'),
            'select text-sm leading-[1.5] text-gray-900 dark:text-gray-300 bg-inherit border-0 rounded-[inherit] px-1 py-2 outline-0'
          )}
        />
      </div>
      {anchorEl && (
        <Popper
          open={popupOpen}
          anchorEl={anchorEl}
          slotProps={{
            root: {
              className: 'relative z-[1001] w-30' // z-index: 1001 is needed to override ComponentPageTabs with z-index: 1000
            }
          }}
          modifiers={[
            { name: 'flip', enabled: false },
            { name: 'preventOverflow', enabled: false }
          ]}
        >
          <ul
            {...getListboxProps()}
            className="text-sm box-border p-1.5 my-3 mx-0 min-w-[120px] rounded-xl scrollable-y outline-0 max-h-[300px] z-[1] bg-white dark:bg-gray-800 border border-solid border-gray-200 dark:border-gray-900 text-gray-900 dark:text-gray-200 shadow-[0_4px_30px_transparent] shadow-gray-200 dark:shadow-gray-900"
          >
            {(groupedOptions as string[]).map((option, index) => {
              const optionProps = getOptionProps({ option, index });

              return (
                <li
                  {...optionProps}
                  key={index}
                  className={clsx(
                    'p-2 cursor-pointer',
                    optionProps['aria-selected'] && 'bg-violet-100 dark:bg-violet-900'
                  )}
                >
                  {renderValue(option)}
                </li>
              );
            })}

            {groupedOptions.length === 0 && (
              <li className="list-none p-2 cursor-default">No results</li>
            )}
          </ul>
        </Popper>
      )}
    </React.Fragment>
  );
});

import React, { InputHTMLAttributes } from 'react';
import { KeenIcon } from '@/components';
import clsx from 'clsx';

interface TimePickerProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  clearable?: boolean;
}

export const TimePicker: React.FC<TimePickerProps> = ({
  value,
  onChange,
  className = '',
  clearable = true,
  ...restProps
}) => {
  return (
    <div className={clsx('input input-sm h-[34px] shrink-0 relative', className)}>
      <input
        type="time"
        value={value || ''}
        onChange={(e) => {
          onChange(e.target.value);
        }}
        {...restProps}
      />
      {clearable && value && (
        <button
          className="absolute right-7 top-1/2 -translate-y-1/2 text-gray-700 hover:text-gray-600"
          onClick={() => onChange('')}
          type="button"
        >
          <KeenIcon icon="cross" />
        </button>
      )}
    </div>
  );
};

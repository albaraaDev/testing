import clsx from 'clsx';
import { useField } from 'formik';
import React from 'react';

type FormRadioButtonProps = {
  name: string;
  value: string;
  label: string;
  icon?: React.ReactNode;
};

export default function FormRadioButton({ name, value, label, icon }: FormRadioButtonProps) {
  const [field] = useField({ name, type: 'radio', value });

  return (
    <label
      className={clsx(
        'px-6 py-2 border-2 border-dashed rounded-md dark:bg-light-active dark:light-active w-full h-12',
        'hover:bg-gray-200 bg-neutral-50 transition-colors',
        'flex items-center justify-between cursor-pointer',
        {
          'border-info': field.checked,
          'border-gray-300': !field.checked
        }
      )}
    >
      <div className="flex gap-2 items-center">
        <input type="radio" {...field} checked={field.checked} className="hidden" />
        <div
          className={clsx('w-4 h-4 rounded-full bg-gray-200', {
            'border-4 border-info': field.checked,
            'border-2 border-gray-300': !field.checked
          })}
        />
        <span className="text-sm">{label}</span>
      </div>
      {icon && (
        <div className="bg-neutral-100 rounded-full size-9 flex items-center justify-center p-2">
          {icon}
        </div>
      )}
    </label>
  );
}

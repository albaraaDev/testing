import { ReactNode } from 'react';

export interface ChipRadioGroupProps<T = string> {
  selection: T;
  setSelection: (value: T) => void;
  selections: T[];
  translations?: Record<string, string>;
  className?: string;
  gap?: 1 | 4;
  heightFull?: boolean;
  prefix?: Record<string, ReactNode>;
  suffix?: Record<string, ReactNode>;
  disabled?: boolean;
}

export const ChipRadioGroup = <T extends string | number>({
  selection,
  setSelection,
  selections,
  prefix,
  suffix,
  translations,
  className = 'btn data-[selected=true]:btn-dark btn-light data-[selected=false]:btn-clear',
  gap = 4,
  heightFull = false,
  disabled
}: ChipRadioGroupProps<T>) => {
  return (
    <div className={`flex ${gap == 1 ? 'gap-1' : 'gap-4'} ${heightFull ? 'h-full' : ''}`}>
      {selections.map((value, index) => (
        <>
          <button
            key={String(value)}
            data-selected={selection === value}
            className={`${className} flex flex-col items-center justify-center px-2 py-1 rounded ${gap == 1 ? 'gap-1' : 'gap-4'} ${heightFull ? 'h-full' : ''}`}
            onClick={() => setSelection(value)}
            disabled={disabled}
          >
            <div>{prefix?.[String(value)] ?? ''}</div>
            <div>{translations?.[String(value)] ?? value}</div>
            <div>{suffix?.[String(value)] ?? ''}</div>
          </button>
          {index < selections.length - 1 && <div className="flex-grow border-l border-gray-200" />}
        </>
      ))}
    </div>
  );
};

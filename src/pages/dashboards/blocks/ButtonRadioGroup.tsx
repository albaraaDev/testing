export interface ButtonRadioGroupProps<T = string> {
  selection: T;
  setSelection: (value: T) => void;
  selections: T[];
  translations?: Record<string, string>;
  className?: string;
  gap?: 1 | 4;
  heightFull?: boolean;
  suffix?: Record<string, string>;
  disabled?: boolean;
}

export const ButtonRadioGroup = <T extends string | number>({
  selection,
  setSelection,
  selections,
  suffix,
  translations,
  className = 'btn data-[selected=true]:btn-dark btn-light data-[selected=false]:btn-clear',
  gap = 4,
  heightFull = false,
  disabled
}: ButtonRadioGroupProps<T>) => {
  return (
    <div className={`flex ${gap == 1 ? 'gap-1' : 'gap-4'} ${heightFull ? 'h-full' : ''}`}>
      {selections.map((value) => (
        <button
          key={String(value)}
          data-selected={selection === value}
          className={`${className} ${heightFull ? 'h-full' : ''}`}
          onClick={() => setSelection(value)}
          disabled={disabled}
        >
          {translations?.[String(value)] ?? value}
          {suffix?.[String(value)] ?? ''}
        </button>
      ))}
    </div>
  );
};

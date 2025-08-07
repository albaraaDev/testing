import { useDebounce } from '@/hooks/useDebounce';
import React from 'react';

type DebouncedSearchInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value'> & {
  value?: string;
  onDebounce: (value: string) => void;
};
export default function DebouncedSearchInput({ onDebounce, ...props }: DebouncedSearchInputProps) {
  const [inputValue, setInputValue] = React.useState<string>(props.value || '');
  const debouncedValue = useDebounce(inputValue);

  React.useEffect(() => {
    onDebounce(debouncedValue);
  }, [debouncedValue]);

  return <input {...props} value={inputValue} onChange={(e) => setInputValue(e.target.value)} />;
}

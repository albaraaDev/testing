import { useCallback, useState } from 'react';
import { useSearchParams } from 'react-router';

export default function useSetSearchParam(param: string) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [value, setValue] = useState(searchParams.get(param) || '');

  const setSearchParam = useCallback(
    (newValue: string) => {
      setSearchParams((params) => {
        if (!newValue || newValue.trim() === '') {
          params.delete(param);
          setValue('');
          return params;
        }
        params.set(param, newValue);
        setValue(newValue);
        return params;
      });
    },
    [param, setSearchParams]
  );

  return { value, setValue, setSearchParam };
}

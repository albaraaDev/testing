import { createContext, useContext } from 'react';

interface SizeContextProps {
  size: 'small' | 'large' | 'hidden';
}

export const SizeContext = createContext<SizeContextProps>({ size: 'small' });

export const useControl = () => {
  return useContext(SizeContext);
};

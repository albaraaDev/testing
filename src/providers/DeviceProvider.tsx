import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState
} from 'react';
import { useAuthContext } from '@/auth';
import { useGetProtocols, useGetTypes } from '@/api/hooks/deviceHooks';
import { DeviceTypeDTO } from '@/api/devices';

interface DeviceContextProps {
  protocols: Record<string, string>;
  types: Awaited<DeviceTypeDTO>;
  getProtocolName: (protocolId: string) => string;
  getTypeName: (typeId: string) => string;
  getTypesOfProtocol: (protocolId: string) => { id: string; name: string; protocolId: string }[];
}

const DeviceContext = createContext<DeviceContextProps>({
  getProtocolName: () => '',
  getTypeName: () => '',
  getTypesOfProtocol: () => [],
  protocols: {},
  types: {}
});

export const DeviceProvider = ({ children }: PropsWithChildren) => {
  const getProtocols = useGetProtocols();
  const getTypes = useGetTypes();
  const auth = useAuthContext();
  const [protocols, setProtocols] = useState<Record<string, string>>({});
  const [types, setTypes] = useState<Awaited<DeviceTypeDTO>>({});

  useEffect(() => {
    if (!auth.currentUser) {
      return;
    }
    if (getProtocols.isSuccess) {
      setProtocols(getProtocols.data);
    } else {
      getProtocols.refetch();
    }

    if (getTypes.isSuccess) {
      setTypes(getTypes.data);
    } else {
      getTypes.refetch();
    }
  }, [auth.currentUser, getProtocols, getTypes]);

  const getTypesOfProtocol = useCallback(
    (protocolId: string) =>
      Object.entries(types)
        .filter(([, type]) => type.protocolId === protocolId)
        .map(([id, type]) => ({ ...type, id })),
    [types]
  );

  return (
    <DeviceContext.Provider
      value={{
        getProtocolName: (protocolId: string) => protocols[protocolId] || '',
        getTypeName: (typeId: string) => types[typeId]?.name || '',
        protocols,
        types,
        getTypesOfProtocol
      }}
    >
      {children}
    </DeviceContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useDeviceProvider = () => {
  return useContext(DeviceContext);
};

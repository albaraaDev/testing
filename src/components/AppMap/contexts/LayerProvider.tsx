import { createContext, useContext, ReactNode, useState } from 'react';

export type LayerType =
  | 'openstreetmap'
  | 'google-road'
  | 'google-satellite'
  | 'google-hybrid'
  | 'carto-base';

interface LayerContextProps {
  layerUrl: string;
  attribution: string;
  layer: LayerType;
  // eslint-disable-next-line no-unused-vars
  setLayer: (layer: LayerType) => void;
}

const getGoogleMapsUrl = (type: 'roadmap' | 'satellite' | 'hybrid') => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    console.warn('VITE_GOOGLE_MAPS_API_KEY not found. Google Maps layers may not work properly.');
    const layerType = type === 'roadmap' ? 'm' : type === 'satellite' ? 's' : 'y';
    return `https://mt1.google.com/vt/lyrs=${layerType}&x={x}&y={y}&z={z}`;
  }

  const layerType = type === 'roadmap' ? 'm' : type === 'satellite' ? 's' : 'y';
  return `https://mt1.google.com/vt/lyrs=${layerType}&x={x}&y={y}&z={z}&key=${apiKey}`;
};

const layerInfo: Record<LayerType, { layerUrl: string; attribution: string; layer: LayerType }> = {
  openstreetmap: {
    layerUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    layer: 'openstreetmap'
  },
  'google-road': {
    layerUrl: getGoogleMapsUrl('roadmap'),
    attribution: '&copy; <a href="https://www.google.com/maps/">Google Maps</a>',
    layer: 'google-road'
  },
  'google-satellite': {
    layerUrl: getGoogleMapsUrl('satellite'),
    attribution: '&copy; <a href="https://www.google.com/maps/">Google Maps</a>',
    layer: 'google-satellite'
  },
  'google-hybrid': {
    layerUrl: getGoogleMapsUrl('hybrid'),
    attribution: '&copy; <a href="https://www.google.com/maps/">Google Maps</a>',
    layer: 'google-hybrid'
  },
  'carto-base': {
    layerUrl: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    layer: 'carto-base'
  }
};

const LayerContext = createContext<LayerContextProps>({
  layerUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  layer: 'openstreetmap',
  setLayer: () => {}
});

export const LayerProvider = ({ children }: { children: ReactNode }) => {
  const [layer, setLayer] = useState<LayerType>('openstreetmap');

  return (
    <LayerContext.Provider
      value={{
        ...layerInfo[layer],
        layer,
        setLayer
      }}
    >
      {children}
    </LayerContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useLayer = () => useContext(LayerContext);

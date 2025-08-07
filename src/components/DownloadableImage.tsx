import React, { DetailedHTMLProps, useEffect } from 'react';
import { getDocumentBase64 } from '@/api/documents';

export const DownloadableImage = ({
  src,
  ...other
}: DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>) => {
  const [image, setImage] = React.useState<string>();

  useEffect(() => {
    if (!src) {
      setImage(undefined);
      return;
    }
    getDocumentBase64(src).then((res) => {
      setImage(res);
    });
  }, [src]);

  if (!image) return null;

  return <img src={`data:image;base64${image}`} {...other} />;
};

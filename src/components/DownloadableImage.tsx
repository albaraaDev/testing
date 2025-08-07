import { getDocumentBase64 } from '@/api/documents';
import { CircularProgress } from '@mui/material';
import React, { DetailedHTMLProps, useEffect, useState } from 'react';

export const DownloadableImage = ({
  src,
  ...other
}: DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>) => {
  const [image, setImage] = React.useState<string>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!src) {
      setImage(undefined);
      return;
    }
    setLoading(true);
    getDocumentBase64(src).then((res) => {
      setImage(res);
      setLoading(false);
    });
  }, [src]);

  if (loading) {
    return (
      <div className="grid place-content-center size-full">
        <CircularProgress />
      </div>
    );
  }

  if (!image) return null;

  return <img src={`data:image;base64${image}`} {...other} />;
};

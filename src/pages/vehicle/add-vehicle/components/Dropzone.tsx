import React from 'react';
import { useDropzone } from 'react-dropzone';

interface DropzoneProps {
  // eslint-disable-next-line no-unused-vars
  onDrop: (file: File | null) => void;
  children: React.ReactNode;
}

export default function Dropzone({ onDrop, children }: DropzoneProps) {
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => {
      const imageFile = acceptedFiles.find((file) => file.type.startsWith('image/'));
      if (imageFile) {
        onDrop(imageFile);
      }
    },
    accept: { 'image/*': [] },
    multiple: false
  });

  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
      {children}
    </div>
  );
}

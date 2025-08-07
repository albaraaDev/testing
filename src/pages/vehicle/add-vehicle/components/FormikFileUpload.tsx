import FileUpload from '@/components/FileUpload';
import { useFormikContext } from 'formik';
import React, { ChangeEvent } from 'react';

// This wrapper connects FileUpload with Formik.
export default function FormikFileUpload({
  name,
  ...props
}: { name: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  const { setFieldValue, values } = useFormikContext<any>();

  // Wrap the onChange handler to update Formik's field value.
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFieldValue(name, e.target.files[0]);
    }
  };

  return (
    <FileUpload
      {...props}
      isUploaded={!!values[name]}
      onChange={handleChange} // This will be called in addition to the internal state update.
    />
  );
}

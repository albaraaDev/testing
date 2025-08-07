import React from 'react';

interface UploadedFileIconProps {
  fileExtension: string;
}

const UploadedFileIcon: React.FC<UploadedFileIconProps> = ({ fileExtension }) => {
  const getColorForExtension = (extension?: string) => {
    if (!extension) return '#9FA5B2';
    switch (extension.toLowerCase()) {
      case 'jpg':
      case 'jpeg':
      case 'png':
        return '#D946EF';
      default:
        return '#9FA5B2';
    }
  };

  const color = getColorForExtension(fileExtension);

  return (
    <div className="flex items-center gap-2">
      <svg
        width="40"
        height="41"
        viewBox="0 0 40 41"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M9.5 7.5C9.5 5.567 11.067 4 13 4H24.1716C24.5694 4 24.9509 4.15804 25.2322 4.43934L34.0607 13.2678C34.342 13.5491 34.5 13.9306 34.5 14.3284V33.5C34.5 35.433 32.933 37 31 37H13C11.067 37 9.5 35.433 9.5 33.5V7.5Z"
          fill="white"
          stroke="#9FA5B2"
        />
        <path
          d="M24.5 4.06488V9.7143C24.5 11.9234 26.2909 13.7143 28.5 13.7143H34.0414"
          stroke="#9FA5B2"
        />
        <rect x="4" y="20" width="24" height="15" rx="3" fill={color} />
        <text
          x="16"
          y="29"
          textAnchor="middle"
          fontSize="10"
          fill="white"
          dominantBaseline="middle"
        >
          {fileExtension ? fileExtension.toUpperCase() : 'File'}
        </text>
      </svg>
    </div>
  );
};

export default UploadedFileIcon;

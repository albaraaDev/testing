import React from 'react';

const FormTab = ({
  tabKey,
  label,
  activeTab,
  onClick
}: {
  tabKey: string;
  label: React.ReactNode;
  activeTab: string;
  onClick: () => void;
}) => {
  return (
    <button
      type="button"
      className={`tab px-4 py-2 font-medium text-lg border-b-4 ${
        activeTab === tabKey
          ? 'text-primary border-primary'
          : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
      }`}
      onClick={onClick}
    >
      {label}
    </button>
  );
};

export default FormTab;

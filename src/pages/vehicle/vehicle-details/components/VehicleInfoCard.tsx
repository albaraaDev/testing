import React from 'react';

type VehicleInfoCardProps = {
  label: string;
  value: string;
  icon: React.ReactNode;
};

export default function VehicleInfoCard({ label, value, icon }: VehicleInfoCardProps) {
  return (
    <div className="card p-4 rounded-lg hover:shadow-md flex flex-col gap-2 justify-between h-full w-full">
      <span className="text-gray-600 mb-3 text-[47px]">{icon}</span>
      <span className="text-xs text-gray-500 font-medium">{label}</span>
      <span className="text-base font-semibold text-gray-900 capitalize">{value}</span>
    </div>
  );
}

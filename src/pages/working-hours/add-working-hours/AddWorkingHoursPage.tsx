import React from 'react';
import { WorkingPeriodModel } from '@/api/working-hours';
import { WorkingHoursForm } from './blocks';

interface AddWorkingHoursPageProps {
  onSubmit: (values: WorkingPeriodModel) => Promise<void>;
}

const AddWorkingHoursPage: React.FC<AddWorkingHoursPageProps> = ({ onSubmit }) => {
  return <WorkingHoursForm onSubmit={onSubmit} />;
};

export { AddWorkingHoursPage };

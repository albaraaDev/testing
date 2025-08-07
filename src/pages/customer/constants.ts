type StatusOption = {
  color: string;
  backgroundColor: string;
  nameKey: string;
};

export const STATUS_OPTIONS: Record<string, StatusOption> = {
  true: {
    color: '#50CD89',
    backgroundColor: '#EEFAF4',
    nameKey: 'CUSTOMER.STATUS.ACTIVE'
  },
  false: {
    color: '#FFA800',
    backgroundColor: '#FFF8EA',
    nameKey: 'CUSTOMER.STATUS.UNDER_REVIEW'
  }
};

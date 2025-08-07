type StatusOption = {
  color: string;
  backgroundColor: string;
  nameKey: string;
};

// color: '#F1416C',
// backgroundColor: '#FFF5F8',
// color: '#FFA800',
// backgroundColor: '#FFF8EA',
// color: '#50CD89',
// backgroundColor: '#EEFAF4',

export const STATUS_OPTIONS: Record<string, StatusOption> = {
  true: {
    color: '#50CD89',
    backgroundColor: '#EEFAF4',
    nameKey: 'RESERVATION.STATUS.ACTIVE'
  },
  false: {
    color: '#FFA800',
    backgroundColor: '#FFF8EA',
    nameKey: 'RESERVATION.STATUS.UNDER_REVIEW'
  }
};

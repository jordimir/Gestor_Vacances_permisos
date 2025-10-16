export interface LeaveDay {
  type: string;
  status: 'requested' | 'approved';
}

export interface LeaveTypeInfo {
  label: string;
  color: string;
  textColor: string;
  total: number;
}

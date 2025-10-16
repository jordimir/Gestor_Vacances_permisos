// FIX: Define and export interfaces instead of constants to resolve circular dependencies and module errors.
export interface LeaveTypeInfo {
  label: string;
  color: string;
  textColor: string;
  total: number;
}

export interface LeaveDay {
  type: string;
  status: 'requested' | 'approved';
}

export interface Holiday {
    name: string;
    type: 'national' | 'catalan' | 'local' | 'patron';
}

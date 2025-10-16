export interface UserProfile {
  id: string;
  name: string;
  dni: string;
  department: string;
}

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

// A type for leave days that are ready to be displayed, including user info
export interface DisplayLeaveDay extends LeaveDay {
  user: UserProfile;
}

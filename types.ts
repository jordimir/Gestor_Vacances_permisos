export interface UserProfile {
  id: string;
  name: string;
  dni: string;
  department: string;
  hireDate: string; // Data d'inici per calcular antiguitat
}

export interface UserData {
  leaveDays: Record<string, LeaveDay>;
  leaveTypes: Record<string, LeaveTypeInfo>;
  workDays: boolean[];
}

export interface LeaveTypeInfo {
  label: string;
  color: string;
  textColor: string;
  total: number;
}

export interface Holiday {
  name:string;
  type: 'national' | 'catalan' | 'local' | 'patron';
}

export interface LeaveDay {
  type: string;
  status: 'requested' | 'approved';
}

// Per a vistes multi-usuari (Informes)
export interface DisplayLeaveDay extends LeaveDay {
  user: UserProfile;
}

export interface LeaveDayStats {
    approved: number;
    requested: number;
    approvedDates: { date: string; user: UserProfile }[];
    requestedDates: { date: string; user: UserProfile }[];
}

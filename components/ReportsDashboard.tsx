

import React, { useMemo } from 'react';
import { UserProfile, LeaveTypeInfo, LeaveDay } from '../types';
import ReportKpi from './reports/ReportKpi';
import TypePieChart from './reports/TypePieChart';
import UsersBarChart from './reports/UsersBarChart';
import YearlyHeatmap from './reports/YearlyHeatmap';
import ExportControls from './reports/ExportControls';
import { format, parseISO } from 'date-fns';

interface ReportsDashboardProps {
  filters: { selectedTypes: string[], selectedUserIds: string[] };
  allUsers: UserProfile[];
  allUsersData: Record<string, { leaveDays: Record<string, LeaveDay>, leaveTypes: Record<string, LeaveTypeInfo> }>;
  allLeaveTypes: Record<string, LeaveTypeInfo>;
  year: number;
}

const ReportsDashboard: React.FC<ReportsDashboardProps> = ({ filters, allUsers, allUsersData, allLeaveTypes, year }) => {
  const { filteredUsers, flatLeaveDays, totalDaysAvailable, statsByType, statsByUser, statsByDate } = useMemo(() => {
    const selectedUserIds = filters.selectedUserIds.length > 0 ? new Set(filters.selectedUserIds) : new Set(allUsers.map(u => u.id));
    const selectedTypes = filters.selectedTypes.length > 0 ? new Set(filters.selectedTypes) : new Set(Object.keys(allLeaveTypes));
    
    const filteredUsers = allUsers.filter(u => selectedUserIds.has(u.id));
    const flatLeaveDays: { user: UserProfile, date: string, type: string, status: string }[] = [];
    
    let totalDaysAvailable = 0;

    filteredUsers.forEach(user => {
        const userData = allUsersData[user.id];
        if (!userData) return;

        // FIX: Add explicit type to `typeInfo` to resolve 'total' property access error.
        Object.values(userData.leaveTypes).forEach((typeInfo: LeaveTypeInfo) => {
            if(typeInfo.total > 0) totalDaysAvailable += typeInfo.total;
        });

        // FIX: Add explicit types to destructuring `[date, leaveDay]` to resolve property access and spread errors.
        Object.entries(userData.leaveDays).forEach(([date, leaveDay]: [string, LeaveDay]) => {
            if (parseISO(date).getFullYear() !== year) return;
            if (selectedTypes.has(leaveDay.type)) {
                flatLeaveDays.push({ user, date, ...leaveDay });
            }
        });
    });

    const approvedLeaveDays = flatLeaveDays.filter(d => d.status === 'approved');

    const statsByType = approvedLeaveDays.reduce((acc, day) => {
        acc[day.type] = (acc[day.type] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const statsByUser = approvedLeaveDays.reduce((acc, day) => {
        acc[day.user.id] = (acc[day.user.id] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

     const statsByDate = approvedLeaveDays.reduce((acc, day) => {
        acc[day.date] = (acc[day.date] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return { filteredUsers, flatLeaveDays, totalDaysAvailable, statsByType, statsByUser, statsByDate };
  }, [filters, allUsers, allUsersData, allLeaveTypes, year]);
  
  // FIX: Add explicit types to reducer arguments to handle 'unknown' type inference.
  const totalApprovedDays = Object.values(statsByType).reduce((sum: number, count: number) => sum + count, 0);
  // FIX: This calculation now works because `totalApprovedDays` is correctly typed as a number.
  const consumptionPercentage = totalDaysAvailable > 0 ? Math.round((totalApprovedDays / totalDaysAvailable) * 100) : 0;
  
  // FIX: Cast array values to numbers for sorting to resolve arithmetic operation error.
  const mostUsedType = Object.entries(statsByType).sort((a, b) => (b[1] as number) - (a[1] as number))[0];

  return (
    <div className="h-full flex flex-col gap-6 printable-report">
        <header className="flex justify-between items-center no-print">
            <h1 className="text-2xl font-bold text-gray-800">Informes i Estadístiques ({year})</h1>
            <ExportControls 
                users={filteredUsers}
                leaveDays={flatLeaveDays.filter(d => d.status === 'approved')}
                leaveTypes={allLeaveTypes}
                year={year}
            />
        </header>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <ReportKpi title="Total Dies Aprovats" value={totalApprovedDays.toString()} />
            <ReportKpi title="% Dies Consumits" value={`${consumptionPercentage}%`} description={`sobre ${totalDaysAvailable} totals`} />
            <ReportKpi title="Tipus Més Comú" value={mostUsedType ? allLeaveTypes[mostUsedType[0]]?.label : 'N/A'} description={`${mostUsedType ? mostUsedType[1] : 0} dies`} />
            <ReportKpi title="Persones / Equips" value={filteredUsers.length.toString()} description="a la vista actual" />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
            <div className="bg-white p-4 rounded-lg shadow-md">
                 <h2 className="text-lg font-semibold text-gray-700 mb-3">Distribució per Tipus de Permís</h2>
                 <TypePieChart stats={statsByType} leaveTypes={allLeaveTypes} />
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md">
                <h2 className="text-lg font-semibold text-gray-700 mb-3">Resum per Treballador</h2>
                <UsersBarChart stats={statsByUser} users={allUsers} />
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md lg:col-span-2">
                <h2 className="text-lg font-semibold text-gray-700 mb-3">Heatmap Anual d'Absències</h2>
                <YearlyHeatmap year={year} stats={statsByDate} />
            </div>
        </div>
    </div>
  );
};

export default ReportsDashboard;
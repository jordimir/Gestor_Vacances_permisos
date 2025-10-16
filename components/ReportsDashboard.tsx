import React, { useState, useMemo } from 'react';
import { getYear, parseISO } from 'date-fns';
import { UserProfile, LeaveDay, LeaveTypeInfo, DisplayLeaveDay } from '../types';

import ReportKpi from './reports/ReportKpi';
import TypePieChart from './reports/TypePieChart';
import UsersBarChart from './reports/UsersBarChart';
import YearlyHeatmap from './reports/YearlyHeatmap';
import FilterBar from './FilterBar';
import ExportControls from './reports/ExportControls';

interface ReportsDashboardProps {
  allUsers: UserProfile[];
  allLeaveData: Record<string, Record<string, LeaveDay>>;
  leaveTypes: Record<string, LeaveTypeInfo>;
  year: number;
}

const ReportsDashboard: React.FC<ReportsDashboardProps> = ({ allUsers, allLeaveData, leaveTypes, year }) => {
  const [filters, setFilters] = useState<{ selectedTypes: string[]; selectedUserIds: string[] }>({
    selectedTypes: [],
    selectedUserIds: [],
  });

  const filteredLeaveDays = useMemo(() => {
    const allDays: { user: UserProfile, date: string, type: string, status: string }[] = [];
    for (const user of allUsers) {
        const userData = allLeaveData[user.id] || {};
        for (const date in userData) {
            if (getYear(parseISO(date)) !== year) continue;

            const leave = userData[date];
            allDays.push({ user, date, type: leave.type, status: leave.status });
        }
    }
    
    return allDays.filter(day => 
        (filters.selectedUserIds.length === 0 || filters.selectedUserIds.includes(day.user.id)) &&
        (filters.selectedTypes.length === 0 || filters.selectedTypes.includes(day.type))
    );
  }, [allLeaveData, allUsers, year, filters]);

  const stats = useMemo(() => {
    const totalDays = filteredLeaveDays.length;
    const totalApproved = filteredLeaveDays.filter(d => d.status === 'approved').length;
    const totalRequested = filteredLeaveDays.filter(d => d.status === 'requested').length;
    const uniqueUsers = new Set(filteredLeaveDays.map(d => d.user.id)).size;

    const byType: Record<string, number> = {};
    const byUser: Record<string, number> = {};
    const byDate: Record<string, number> = {};

    for (const day of filteredLeaveDays) {
        byType[day.type] = (byType[day.type] || 0) + 1;
        byUser[day.user.id] = (byUser[day.user.id] || 0) + 1;
        byDate[day.date] = (byDate[day.date] || 0) + 1;
    }

    return { totalDays, totalApproved, totalRequested, uniqueUsers, byType, byUser, byDate };
  }, [filteredLeaveDays]);

  return (
    <div className="h-full flex flex-col bg-gray-50 p-4 rounded-lg shadow-inner overflow-hidden">
      <header className="flex-shrink-0 flex justify-between items-center mb-4 pb-2 border-b no-print">
        <h1 className="text-2xl font-bold text-gray-800">Informe Anual de Permisos - {year}</h1>
        <div className="flex items-center gap-4">
          <FilterBar allUsers={allUsers} allLeaveTypes={leaveTypes} filters={filters} onFilterChange={setFilters} />
          <ExportControls users={allUsers} leaveDays={filteredLeaveDays} leaveTypes={leaveTypes} year={year} />
        </div>
      </header>
      
      <main className="flex-1 overflow-y-auto pr-2 printable-area">
        {/* KPIs */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <ReportKpi title="Total Dies de Permís" value={stats.totalDays.toString()} description="Suma de dies aprovats i demanats" />
          <ReportKpi title="Dies Aprovats" value={stats.totalApproved.toString()} description={`${(stats.totalDays > 0 ? (stats.totalApproved / stats.totalDays * 100) : 0).toFixed(0)}% del total`} />
          <ReportKpi title="Dies Demanats" value={stats.totalRequested.toString()} description="Pendents d'aprovació" />
          <ReportKpi title="Persones Implicades" value={stats.uniqueUsers.toString()} description="d'un total de " />
        </section>

        {/* Charts */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 h-[300px]">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Distribució per Tipus de Permís</h2>
            <TypePieChart stats={stats.byType} leaveTypes={leaveTypes} />
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Dies de Permís per Persona</h2>
            <UsersBarChart stats={stats.byUser} users={allUsers} />
          </div>
        </section>

        {/* Heatmap */}
        <section className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Mapa de Calor d'Absències ({year})</h2>
            <YearlyHeatmap year={year} stats={stats.byDate} />
        </section>
      </main>
    </div>
  );
};

export default ReportsDashboard;

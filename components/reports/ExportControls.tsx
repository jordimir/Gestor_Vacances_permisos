import React, { useState } from 'react';
import { exportToCsv } from '../../utils/export';
import { UserProfile, LeaveDay, LeaveTypeInfo } from '../../types';
import { format, parseISO } from 'date-fns';
import { ca } from 'date-fns/locale';

interface ExportControlsProps {
  users: UserProfile[];
  leaveDays: { user: UserProfile, date: string, type: string, status: string }[];
  leaveTypes: Record<string, LeaveTypeInfo>;
  year: number;
}

const ExportControls: React.FC<ExportControlsProps> = ({ users, leaveDays, leaveTypes, year }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleExport = (formatType: 'csv' | 'excel') => {
    const headers = ['ID Usuari', 'Nom', 'Departament', 'Data', 'Dia Setmana', 'Tipus Permís', 'Estat'];
    const rows = leaveDays.map(day => [
        day.user.id,
        day.user.name,
        day.user.department,
        day.date,
        format(parseISO(day.date), 'EEEE', { locale: ca }),
        leaveTypes[day.type]?.label || day.type,
        day.status === 'approved' ? 'Aprovat' : 'Demanat'
    ]);
    
    exportToCsv(`informe-permisos-${year}.${formatType === 'excel' ? 'xls' : 'csv'}`, [headers, ...rows]);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800 transition-colors flex items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
        Exportar
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-30 border">
          <ul className="py-1">
            <li><button onClick={() => handleExport('csv')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Exportar a CSV</button></li>
            <li><button onClick={() => handleExport('excel')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Exportar a Excel</button></li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default ExportControls;
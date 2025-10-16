import React, { useState } from 'react';
import LeaveTypeItem from './LeaveTypeItem';
import { LeaveTypeInfo, UserProfile } from '../types';
import { LeaveDayStats } from '../App';
import { format, parseISO } from 'date-fns';
import { ca } from 'date-fns/locale';

interface SidebarProps {
  stats: Record<string, LeaveDayStats>;
  leaveTypes: Record<string, LeaveTypeInfo>; // Active user's leave types for dragging
  allLeaveTypes: Record<string, LeaveTypeInfo>; // All types for display info
  onManageClick: () => void;
}

const KpiCard: React.FC<{type: string, info: LeaveTypeInfo, stats: LeaveDayStats}> = ({ type, info, stats }) => {
    const [isOpen, setIsOpen] = useState(false);

    const formatDate = (dateStr: string) => format(parseISO(dateStr), 'd MMM', { locale: ca });
    const getUserInitials = (user: UserProfile) => user.name.split(' ').map(n => n[0]).join('');

    if (stats.approved === 0 && stats.requested === 0) {
        return null;
    }

    return (
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
                <div className="flex items-center">
                    <span className={`w-3 h-3 rounded-full mr-2 ${info.color}`}></span>
                    <span className="font-bold text-gray-800">{info.label}</span>
                </div>
                <div className="flex items-center">
                    <span className="text-sm font-semibold text-gray-700">{stats.approved}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ml-1 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>

            {isOpen && (
                <div className="mt-3 pt-3 border-t border-gray-200 text-xs">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                        <span className="text-gray-500">Autoritzats:</span><span className="font-medium text-right text-green-600">{stats.approved}</span>
                        <span className="text-gray-500">Demanats:</span><span className="font-medium text-right text-orange-500">{stats.requested}</span>
                    </div>

                    {stats.approvedDates.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-dashed">
                            <p className="font-semibold text-green-700">Dates Autoritzades:</p>
                            <p className="text-gray-600 break-words">{stats.approvedDates.map(d => `${formatDate(d.date)} (${getUserInitials(d.user)})`).join(', ')}</p>
                        </div>
                    )}
                    {stats.requestedDates.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-dashed">
                            <p className="font-semibold text-orange-600">Dates Demanades:</p>
                            <p className="text-gray-600 break-words">{stats.requestedDates.map(d => `${formatDate(d.date)} (${getUserInitials(d.user)})`).join(', ')}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const Sidebar: React.FC<SidebarProps> = ({ stats, leaveTypes, allLeaveTypes, onManageClick }) => {

  return (
    <aside className="w-72 bg-white p-4 border-r border-gray-200 flex flex-col no-print">
      <div className="flex-shrink-0">
        <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-bold text-gray-800">Tipus de Permís</h2>
            <button onClick={onManageClick} className="text-sm text-blue-600 hover:underline">Gestionar</button>
        </div>
        <p className="text-xs text-gray-500 mb-4">Arrossega un tipus al calendari.</p>
        
        <div className="space-y-2">
          {Object.keys(leaveTypes).map((type) => (
            <LeaveTypeItem key={type} type={type} info={leaveTypes[type]} />
          ))}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200 flex-1 overflow-y-auto">
        <h3 className="text-lg font-bold text-gray-800 mb-3">Resum (Vista Filtrada)</h3>
        <div className="space-y-2">
          {Object.keys(stats).map((type) => {
            const info = allLeaveTypes[type];
            if (!info) return null;
            return (
              <KpiCard key={type} type={type} info={info} stats={stats[type]} />
            );
          })}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

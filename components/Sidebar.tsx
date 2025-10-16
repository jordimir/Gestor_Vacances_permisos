import React, { useState } from 'react';
import LeaveTypeItem from './LeaveTypeItem';
import { LeaveTypeInfo, UserProfile, LeaveDayStats } from '../types';
import { format, parseISO } from 'date-fns';
import { ca } from 'date-fns/locale';

interface SidebarProps {
  stats: Record<string, LeaveDayStats>;
  leaveTypes: Record<string, LeaveTypeInfo>;
  workDays: boolean[];
  onWorkDaysChange: (newWorkDays: boolean[]) => void;
  onManageClick: () => void;
  onUserChange: () => void;
  activeUser: UserProfile;
}

const KpiCard: React.FC<{info: LeaveTypeInfo, stats: LeaveDayStats}> = ({ info, stats }) => {
    const [isOpen, setIsOpen] = useState(false);

    const formatDate = (dateStr: string) => format(parseISO(dateStr), 'd MMM', { locale: ca });

    if (info.total === 0 && stats.approved === 0 && stats.requested === 0) {
        return null;
    }
    
    const remaining = info.total > 0 ? info.total - stats.approved : 0;

    return (
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
                <div className="flex items-center">
                    <span className={`w-3 h-3 rounded-full mr-2 ${info.color}`}></span>
                    <span className="font-bold text-gray-800">{info.label}</span>
                </div>
                 <div className="flex items-center">
                    <span className="text-sm font-semibold text-gray-700">{stats.approved} / {info.total > 0 ? info.total : '∞'}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ml-1 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>

            {isOpen && (
                <div className="mt-3 pt-3 border-t border-gray-200 text-xs space-y-2">
                    <div className="grid grid-cols-2 gap-x-4">
                        <span className="text-gray-500">Totals:</span><span className="font-medium text-right">{info.total > 0 ? info.total : 'N/A'}</span>
                        <span className="text-gray-500">Autoritzats:</span><span className="font-medium text-right text-green-600">{stats.approved}</span>
                        <span className="text-gray-500">Demanats:</span><span className="font-medium text-right text-orange-500">{stats.requested}</span>
                        <span className="text-gray-500">Restants:</span><span className="font-bold text-right">{info.total > 0 ? remaining : 'N/A'}</span>
                    </div>

                    {stats.approvedDates.length > 0 && (
                        <div className="pt-2 border-t border-dashed">
                            <p className="font-semibold text-green-700">Dates Autoritzades:</p>
                            <p className="text-gray-600 break-words">{stats.approvedDates.map(d => formatDate(d.date)).join(', ')}</p>
                        </div>
                    )}
                    {stats.requestedDates.length > 0 && (
                         <div className="pt-2 border-t border-dashed">
                            <p className="font-semibold text-orange-600">Dates Demanades:</p>
                            <p className="text-gray-600 break-words">{stats.requestedDates.map(d => formatDate(d.date)).join(', ')}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const WorkDaySelector: React.FC<{ workDays: boolean[], onWorkDaysChange: (newDays: boolean[]) => void }> = ({ workDays, onWorkDaysChange }) => {
    const days = ['Dl', 'Dt', 'Dc', 'Dj', 'Dv', 'Ds', 'Dg'];
    
    const handleToggle = (index: number) => {
        const newWorkDays = [...workDays];
        newWorkDays[index] = !newWorkDays[index];
        onWorkDaysChange(newWorkDays);
    };

    return (
        <div>
            <h3 className="text-md font-bold text-gray-800 mb-2">Jornada Setmanal</h3>
            <div className="flex justify-around items-center bg-gray-100 p-2 rounded-lg">
                {days.map((day, index) => (
                    <label key={day} className="flex flex-col items-center cursor-pointer">
                        <span className="text-xs font-medium">{day}</span>
                        <input
                            type="checkbox"
                            checked={workDays[index]}
                            onChange={() => handleToggle(index)}
                            className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                    </label>
                ))}
            </div>
        </div>
    );
};


const Sidebar: React.FC<SidebarProps> = ({ stats, leaveTypes, workDays, onWorkDaysChange, onManageClick, onUserChange, activeUser }) => {

  return (
    <aside className="w-80 bg-white p-4 border-r border-gray-200 flex flex-col no-print">
      <div className="flex-shrink-0">
        <div className="p-2 bg-blue-50 rounded-lg mb-4">
            <p className="text-sm text-gray-600">Usuari Actiu</p>
            <h2 className="text-lg font-bold text-blue-800 truncate">{activeUser.name}</h2>
            <button onClick={onUserChange} className="text-xs text-blue-600 hover:underline font-semibold">Canviar d'usuari</button>
        </div>

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
      
      <div className="my-6 pt-4 border-t border-gray-200">
        <WorkDaySelector workDays={workDays} onWorkDaysChange={onWorkDaysChange} />
      </div>

      <div className="flex-1 overflow-y-auto">
        <h3 className="text-lg font-bold text-gray-800 mb-3">Resum Anual (Any en curs)</h3>
        <div className="space-y-2">
          {Object.keys(leaveTypes).map((type) => {
            const info = leaveTypes[type];
            const statData = stats[type] || { approved: 0, requested: 0, approvedDates: [], requestedDates: [] };
            return (
              <KpiCard key={type} info={info} stats={statData} />
            );
          })}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

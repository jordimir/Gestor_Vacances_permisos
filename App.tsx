import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Calendar from './components/Calendar';
import Sidebar from './components/Sidebar';
import RequestModal from './components/RequestModal';
import ManageLeaveTypesModal from './components/ManageLeaveTypesModal';
import Timeline from './components/Timeline';
import { LeaveDay, LeaveTypeInfo, Holiday } from './types';
import { DEFAULT_LEAVE_TYPES } from './constants';
import { getHolidaysForYear } from './utils/holidays';
import { getYear } from 'date-fns';

export interface LeaveDayStats {
  requested: number;
  approved: number;
  remaining: number;
  requestedDates: string[];
  approvedDates: string[];
}

const App: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(() => {
    const savedDate = localStorage.getItem('currentCalendarDate');
    return savedDate ? new Date(JSON.parse(savedDate)) : new Date();
  });

  const [leaveDays, setLeaveDays] = useState<Record<string, LeaveDay>>(() => {
    const savedDays = localStorage.getItem('leaveDays');
    return savedDays ? JSON.parse(savedDays) : {};
  });

  const [leaveTypes, setLeaveTypes] = useState<Record<string, LeaveTypeInfo>>(() => {
    const savedTypes = localStorage.getItem('leaveTypes');
    return savedTypes ? JSON.parse(savedTypes) : DEFAULT_LEAVE_TYPES;
  });

  const [viewMode, setViewMode] = useState<'calendar' | 'timeline'>('calendar');
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('currentCalendarDate', JSON.stringify(currentDate));
  }, [currentDate]);

  useEffect(() => {
    localStorage.setItem('leaveDays', JSON.stringify(leaveDays));
  }, [leaveDays]);

  useEffect(() => {
    localStorage.setItem('leaveTypes', JSON.stringify(leaveTypes));
  }, [leaveTypes]);

  const holidays = useMemo(() => getHolidaysForYear(getYear(currentDate)), [currentDate]);

  const handleSetLeaveDay = useCallback((date: string, type: string | null) => {
    setLeaveDays(prev => {
      const newLeaveDays = { ...prev };
      if (type === null) {
        delete newLeaveDays[date];
        return newLeaveDays;
      }
      
      if (prev[date]) {
        return prev;
      }

      newLeaveDays[date] = { type, status: 'requested' };
      return newLeaveDays;
    });
  }, []);
  
  const handleApproveDay = useCallback((date: string) => {
    setLeaveDays(prev => {
      if (prev[date] && prev[date].status === 'requested') {
        return { ...prev, [date]: { ...prev[date], status: 'approved' } };
      }
      return prev;
    });
  }, []);

  const leaveDayStats = useMemo(() => {
    const stats: Record<string, LeaveDayStats> = {};

    Object.keys(leaveTypes).forEach(type => {
        stats[type] = { 
            requested: 0, 
            approved: 0, 
            remaining: leaveTypes[type].total, 
            requestedDates: [], 
            approvedDates: [] 
        };
    });

    Object.entries(leaveDays).forEach(([date, day]: [string, LeaveDay]) => {
        if (stats[day.type]) {
            if (day.status === 'approved') {
                stats[day.type].approved++;
                stats[day.type].approvedDates.push(date);
            } else {
                stats[day.type].requested++;
                stats[day.type].requestedDates.push(date);
            }
        }
    });

    Object.keys(leaveTypes).forEach(type => {
        stats[type].remaining = leaveTypes[type].total - stats[type].approved;
        stats[type].requestedDates.sort();
        stats[type].approvedDates.sort();
    });

    return stats;
  }, [leaveDays, leaveTypes]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col h-screen font-sans">
        <header className="bg-white shadow-md p-4 flex justify-between items-center no-print">
          <h1 className="text-2xl font-bold text-gray-800">Gestor de Vacances i Permisos</h1>
          <button
            onClick={() => setIsRequestModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Generar Sol·licitud
          </button>
        </header>
        <div className="flex flex-1 overflow-hidden">
          <Sidebar 
            stats={leaveDayStats} 
            leaveTypes={leaveTypes} 
            onManageClick={() => setIsManageModalOpen(true)}
          />
          <main className="flex-1 p-6 overflow-auto bg-gray-50 flex flex-col">
            <div className="mb-4 bg-white p-2 rounded-md shadow-sm flex items-center gap-2 no-print self-start">
              <span className="text-sm font-semibold text-gray-600">Vista:</span>
              <button 
                  onClick={() => setViewMode('calendar')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${viewMode === 'calendar' ? 'bg-blue-600 text-white shadow' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                  Calendari Mensual
              </button>
              <button 
                  onClick={() => setViewMode('timeline')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${viewMode === 'timeline' ? 'bg-blue-600 text-white shadow' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                  Línia de Temps Anual
              </button>
            </div>
            {viewMode === 'calendar' ? (
              <Calendar
                currentDate={currentDate}
                setCurrentDate={setCurrentDate}
                leaveDays={leaveDays}
                onSetLeaveDay={handleSetLeaveDay}
                onApproveDay={handleApproveDay}
                leaveTypes={leaveTypes}
                holidays={holidays}
              />
            ) : (
              <Timeline
                currentDate={currentDate}
                setCurrentDate={setCurrentDate}
                leaveDays={leaveDays}
                leaveTypes={leaveTypes}
                holidays={holidays}
              />
            )}
          </main>
        </div>
      </div>
      {isRequestModalOpen && <RequestModal leaveDays={leaveDays} leaveTypes={leaveTypes} onClose={() => setIsRequestModalOpen(false)} />}
      {isManageModalOpen && (
        <ManageLeaveTypesModal 
          leaveTypes={leaveTypes}
          setLeaveTypes={setLeaveTypes}
          leaveDays={leaveDays}
          onClose={() => setIsManageModalOpen(false)}
        />
      )}
    </DndProvider>
  );
};

export default App;

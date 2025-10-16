import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { getYear } from 'date-fns';

import Calendar from './components/Calendar';
import Sidebar from './components/Sidebar';
import ManageLeaveTypesModal from './components/ManageLeaveTypesModal';
import RequestModal from './components/RequestModal';
import UserSelection from './components/UserSelection';
import ReportsDashboard from './components/ReportsDashboard';
import Timeline from './components/Timeline';
import YearGrid from './components/YearGrid';

import { UserProfile, UserData, LeaveDay, LeaveTypeInfo, Holiday, LeaveDayStats } from './types';
import { DEFAULT_LEAVE_TYPES } from './constants';
import { getHolidaysForYear } from './utils/holidays';
import { calculateVacationDays } from './utils/vacationCalculator';
import { calculatePersonalLeaveDays } from './utils/personalLeaveCalculator';

type ViewMode = 'calendar' | 'timeline' | 'yearGrid' | 'reports';

const App: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>(() => {
    const savedUsers = localStorage.getItem('users');
    return savedUsers ? JSON.parse(savedUsers) : [];
  });

  const [activeUserId, setActiveUserId] = useState<string | null>(() => localStorage.getItem('activeUserId'));

  const [allUserData, setAllUserData] = useState<Record<string, UserData>>(() => {
    const data: Record<string, UserData> = {};
    users.forEach(user => {
      const savedData = localStorage.getItem(`userData_${user.id}`);
      if (savedData) {
        data[user.id] = JSON.parse(savedData);
      }
    });
    return data;
  });

  const [currentDate, setCurrentDate] = useState(new Date());
  const [holidays, setHolidays] = useState<Record<string, Holiday>>({});

  const [isManagingTypes, setIsManagingTypes] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');

  const activeUser = useMemo(() => users.find(u => u.id === activeUserId), [users, activeUserId]);

  const activeUserData = useMemo(() => {
    if (!activeUserId || !allUserData[activeUserId]) {
        if (!activeUser) return undefined;
        // Create initial data for a user
        const initialLeaveTypes = { ...DEFAULT_LEAVE_TYPES };
        initialLeaveTypes['VACANCES'].total = calculateVacationDays(activeUser.hireDate);
        initialLeaveTypes['ASSUMPTES_PROPIS'].total = calculatePersonalLeaveDays(activeUser.hireDate);

        return {
            leaveDays: {},
            leaveTypes: initialLeaveTypes,
            workDays: [true, true, true, true, true, false, false],
        };
    }
    return allUserData[activeUserId];
  }, [activeUserId, allUserData, activeUser]);
  
  // Load holidays for the current year
  useEffect(() => {
    const year = getYear(currentDate);
    setHolidays(getHolidaysForYear(year));
  }, [currentDate]);

  // Save active user ID to localStorage
  useEffect(() => {
    if (activeUserId) {
      localStorage.setItem('activeUserId', activeUserId);
    } else {
      localStorage.removeItem('activeUserId');
    }
  }, [activeUserId]);

  // Save individual user data when it changes
  useEffect(() => {
    if (activeUserId && activeUserData) {
      localStorage.setItem(`userData_${activeUserId}`, JSON.stringify(activeUserData));
    }
  }, [activeUserId, activeUserData]);

  const handleUserSelect = (userId: string) => {
    setActiveUserId(userId);
  };
  
  const handleUserChange = () => {
      setActiveUserId(null);
  }

  const updateActiveUserData = useCallback((updater: (prev: UserData) => UserData) => {
    if (!activeUserId) return;
    setAllUserData(prevAll => ({
      ...prevAll,
      [activeUserId]: updater(prevAll[activeUserId] || activeUserData!),
    }));
  }, [activeUserId, activeUserData]);

  const handleSetLeaveDay = (date: string, type: string | null) => {
    updateActiveUserData(prev => {
      const newLeaveDays = { ...prev.leaveDays };
      if (type) {
        newLeaveDays[date] = { type, status: 'requested' };
      } else {
        delete newLeaveDays[date];
      }
      return { ...prev, leaveDays: newLeaveDays };
    });
  };

  const handleApproveDay = (date: string) => {
      updateActiveUserData(prev => {
          const newLeaveDays = { ...prev.leaveDays };
          if (newLeaveDays[date]) {
              newLeaveDays[date].status = 'approved';
          }
          return { ...prev, leaveDays: newLeaveDays };
      });
  };

  const handleWorkDaysChange = (newWorkDays: boolean[]) => {
    updateActiveUserData(prev => ({ ...prev, workDays: newWorkDays }));
  };

  const handleSaveLeaveTypes = (updatedLeaveTypes: Record<string, LeaveTypeInfo>) => {
    updateActiveUserData(prev => ({ ...prev, leaveTypes: updatedLeaveTypes }));
    setIsManagingTypes(false);
  };
  
  const stats: Record<string, LeaveDayStats> = useMemo(() => {
    if (!activeUserData) return {};
    const result: Record<string, LeaveDayStats> = {};
    
    for (const typeKey in activeUserData.leaveTypes) {
        result[typeKey] = { approved: 0, requested: 0, approvedDates: [], requestedDates: [] };
    }

    for (const date in activeUserData.leaveDays) {
        const leaveDay = activeUserData.leaveDays[date];
        if (!result[leaveDay.type]) {
            result[leaveDay.type] = { approved: 0, requested: 0, approvedDates: [], requestedDates: [] };
        }
        if (leaveDay.status === 'approved') {
            result[leaveDay.type].approved++;
            if (activeUser) result[leaveDay.type].approvedDates.push({date, user: activeUser});
        } else {
            result[leaveDay.type].requested++;
            if (activeUser) result[leaveDay.type].requestedDates.push({date, user: activeUser});
        }
    }
    return result;
  }, [activeUserData, activeUser]);


  if (!activeUser || !activeUserData) {
    return <UserSelection users={users} setUsers={setUsers} onUserSelect={handleUserSelect} />;
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex h-screen bg-gray-100 font-sans">
        <Sidebar 
          stats={stats} 
          leaveTypes={activeUserData.leaveTypes}
          workDays={activeUserData.workDays}
          onWorkDaysChange={handleWorkDaysChange}
          onManageClick={() => setIsManagingTypes(true)}
          onUserChange={handleUserChange}
          activeUser={activeUser}
        />
        <main className="flex-1 flex flex-col p-4 overflow-auto">
            <header className="flex justify-between items-center mb-4 no-print">
                <div className="flex items-center gap-2">
                    <button onClick={() => setViewMode('calendar')} className={`px-3 py-1.5 text-sm rounded-md ${viewMode === 'calendar' ? 'bg-blue-600 text-white' : 'bg-white'}`}>Calendari Mensual</button>
                    <button onClick={() => setViewMode('yearGrid')} className={`px-3 py-1.5 text-sm rounded-md ${viewMode === 'yearGrid' ? 'bg-blue-600 text-white' : 'bg-white'}`}>Vista Anual</button>
                    <button onClick={() => setViewMode('timeline')} className={`px-3 py-1.5 text-sm rounded-md ${viewMode === 'timeline' ? 'bg-blue-600 text-white' : 'bg-white'}`}>Línia Temporal</button>
                    <button onClick={() => setViewMode('reports')} className={`px-3 py-1.5 text-sm rounded-md ${viewMode === 'reports' ? 'bg-blue-600 text-white' : 'bg-white'}`}>Informes</button>
                </div>
                 <button onClick={() => setIsRequesting(true)} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Generar Sol·licitud</button>
            </header>
            
            {viewMode === 'calendar' && (
              <Calendar
                currentDate={currentDate}
                setCurrentDate={setCurrentDate}
                leaveDays={activeUserData.leaveDays}
                onSetLeaveDay={handleSetLeaveDay}
                onApproveDay={handleApproveDay}
                leaveTypes={activeUserData.leaveTypes}
                holidays={holidays}
                workDays={activeUserData.workDays}
              />
            )}
            {viewMode === 'yearGrid' && (
              <YearGrid 
                currentDate={currentDate} 
                setCurrentDate={setCurrentDate} 
                leaveDays={{[activeUser.id]: activeUserData.leaveDays}}
                leaveTypes={activeUserData.leaveTypes}
                holidays={holidays}
                users={[activeUser]}
              />
            )}
            {viewMode === 'timeline' && (
              <Timeline 
                currentDate={currentDate} 
                setCurrentDate={setCurrentDate} 
                leaveDays={{[activeUser.id]: activeUserData.leaveDays}}
                leaveTypes={activeUserData.leaveTypes}
                holidays={holidays}
                users={[activeUser]}
              />
            )}
            {viewMode === 'reports' && (
              <ReportsDashboard
                allUsers={users}
                allLeaveData={Object.entries(allUserData).reduce((acc, [userId, data]) => {
                  acc[userId] = data.leaveDays;
                  return acc;
                }, {} as Record<string, Record<string, LeaveDay>>)}
                leaveTypes={activeUserData.leaveTypes} // Assuming global leave types for now
                year={getYear(currentDate)}
              />
            )}
        </main>
      </div>
      {isManagingTypes && (
        <ManageLeaveTypesModal
          leaveTypes={activeUserData.leaveTypes}
          onSave={handleSaveLeaveTypes}
          onClose={() => setIsManagingTypes(false)}
        />
      )}
      {isRequesting && (
        <RequestModal
            user={activeUser}
            leaveDays={activeUserData.leaveDays}
            leaveTypes={activeUserData.leaveTypes}
            onClose={() => setIsRequesting(false)}
        />
      )}
    </DndProvider>
  );
};

export default App;

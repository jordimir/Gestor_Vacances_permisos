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

const API_BASE_URL = '/api';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const [allUserData, setAllUserData] = useState<Record<string, UserData>>({});
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [holidays, setHolidays] = useState<Record<string, Holiday>>({});

  const [isManagingTypes, setIsManagingTypes] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [error, setError] = useState<string | null>(null);

  // Load all data from backend API on initial mount
  useEffect(() => {
    const loadData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [usersRes, userDataRes] = await Promise.all([
                fetch(`${API_BASE_URL}/users`),
                fetch(`${API_BASE_URL}/usersdata`),
            ]);

            if (!usersRes.ok || !userDataRes.ok) {
                throw new Error("Failed to fetch data from the server.");
            }

            const usersData = await usersRes.json();
            const allData = await userDataRes.json();
            
            setUsers(usersData);
            setAllUserData(allData);

            const lastActiveId = localStorage.getItem('activeUserId');
            if (lastActiveId && usersData.some((u: UserProfile) => u.id === lastActiveId)) {
                setActiveUserId(lastActiveId);
            }
        } catch (err: any) {
            console.error("Error loading data from API:", err);
            setError("No s'han pogut carregar les dades del servidor. Si us plau, refresca la pàgina.");
        } finally {
            setIsLoading(false);
        }
    };
    loadData();
  }, []);


  const activeUser = useMemo(() => users.find(u => u.id === activeUserId), [users, activeUserId]);

  const activeUserData = useMemo(() => {
    if (!activeUserId) return undefined;
    return allUserData[activeUserId];
  }, [activeUserId, allUserData]);
  
  // Load holidays for the current year
  useEffect(() => {
    const year = getYear(currentDate);
    setHolidays(getHolidaysForYear(year));
  }, [currentDate]);

  // Save active user ID to localStorage for session persistence
  useEffect(() => {
    if (activeUserId) {
      localStorage.setItem('activeUserId', activeUserId);
    } else {
      localStorage.removeItem('activeUserId');
    }
  }, [activeUserId]);

  const handleUserSelect = (userId: string) => {
    setActiveUserId(userId);
  };
  
  const handleUserChange = () => {
      setActiveUserId(null);
  }

  const updateActiveUserData = useCallback(async (updater: (prev: UserData) => UserData) => {
    if (!activeUserId || !activeUserData) return;

    const updatedUserData = updater(activeUserData);
    
    // Optimistic update for better UX
    setAllUserData(prevAll => ({
      ...prevAll,
      [activeUserId]: updatedUserData,
    }));

    // Persist change to the backend
    try {
        const response = await fetch(`${API_BASE_URL}/users/${activeUserId}/data`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedUserData)
        });
        if (!response.ok) {
            throw new Error('Failed to save data');
        }
    } catch (err) {
        console.error("Error saving user data:", err);
        setError("No s'han pogut desar els canvis. Si us plau, torna-ho a provar.");
        // Revert optimistic update on failure
        setAllUserData(prevAll => ({ ...prevAll, [activeUserId]: activeUserData }));
    }
  }, [activeUserId, activeUserData]);

  const handleCreateUser = async (newUser: { name: string; dni: string; department: string; hireDate: string; }) => {
      try {
        const response = await fetch(`${API_BASE_URL}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newUser)
        });
        if (!response.ok) throw new Error('Failed to create user');
        
        const userProfile: UserProfile = await response.json();
        
        // Create initial data client-side for optimistic update
        const initialLeaveTypes = { ...DEFAULT_LEAVE_TYPES };
        initialLeaveTypes['VACANCES'].total = calculateVacationDays(userProfile.hireDate);
        initialLeaveTypes['ASSUMPTES_PROPIS'].total = calculatePersonalLeaveDays(userProfile.hireDate);
        
        const newUserData: UserData = {
            leaveDays: {},
            leaveTypes: initialLeaveTypes,
            workDays: [true, true, true, true, true, false, false],
        };
        
        setUsers(prev => [...prev, userProfile]);
        setAllUserData(prev => ({ ...prev, [userProfile.id]: newUserData }));
        setActiveUserId(userProfile.id);
      } catch (err) {
          console.error("Error creating user:", err);
          setError("No s'ha pogut crear l'usuari.");
      }
  };

  const handleDeleteUser = async (userId: string) => {
      // Optimistic update
      const previousUsers = users;
      const previousAllUserData = allUserData;
      
      setUsers(prev => prev.filter(u => u.id !== userId));
      setAllUserData(prev => {
          const newState = { ...prev };
          delete newState[userId];
          return newState;
      });
      if (activeUserId === userId) {
          setActiveUserId(null);
      }

      try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete user');
      } catch (err) {
          console.error("Error deleting user:", err);
          setError("No s'ha pogut eliminar l'usuari.");
          // Revert on failure
          setUsers(previousUsers);
          setAllUserData(previousAllUserData);
      }
  };

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

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Carregant dades...</div>;
  }

  if (!activeUser || !activeUserData) {
    return <UserSelection users={users} onUserSelect={handleUserSelect} onCreateUser={handleCreateUser} onDeleteUser={handleDeleteUser} />;
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex h-screen bg-gray-100 font-sans">
        {error && (
          <div className="fixed top-4 right-4 bg-red-600 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm" role="alert">
            <div className="flex justify-between items-center">
                <p className="font-bold">Error de l'Aplicació</p>
                <button onClick={() => setError(null)} className="ml-4 font-bold text-xl leading-none">&times;</button>
            </div>
            <p className="mt-2 text-sm">{error}</p>
          </div>
        )}
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
                  acc[userId] = (data as UserData).leaveDays;
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
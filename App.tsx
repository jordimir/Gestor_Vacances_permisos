import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Calendar from './components/Calendar';
import Sidebar from './components/Sidebar';
import RequestModal from './components/RequestModal';
import ManageLeaveTypesModal from './components/ManageLeaveTypesModal';
import Timeline from './components/Timeline';
import YearGrid from './components/YearGrid';
import UserSelection from './components/UserSelection';
import FilterBar from './components/FilterBar';
import ReportsDashboard from './components/ReportsDashboard';
import { LeaveDay, LeaveTypeInfo, Holiday, UserProfile, DisplayLeaveDay } from './types';
import { DEFAULT_LEAVE_TYPES } from './constants';
import { getHolidaysForYear } from './utils/holidays';
import { getYear, parseISO, format } from 'date-fns';

export interface LeaveDayStats {
  requested: number;
  approved: number;
  remaining: number;
  requestedDates: { user: UserProfile, date: string }[];
  approvedDates: { user: UserProfile, date: string }[];
}

// Helper to get user-specific data from localStorage
const loadUserData = <T,>(key: string, defaultValue: T): T => {
  const saved = localStorage.getItem(key);
  return saved ? JSON.parse(saved) : defaultValue;
};

// Initial data seeding for Jordi Mir Gordils
const JORDI_PROFILE: UserProfile = {
  id: 'user-1700000000000-jmg',
  name: 'Jordi Mir Gordils',
  dni: '43671673D',
  department: 'Serveis Tècnics',
};

const JORDI_INITIAL_LEAVE_DAYS: Record<string, LeaveDay> = {
    '2024-03-25': { type: 'VACANCES', status: 'approved' },
    '2024-03-26': { type: 'VACANCES', status: 'approved' },
    '2024-03-27': { type: 'VACANCES', status: 'approved' },
    '2024-03-28': { type: 'VACANCES', status: 'approved' },
    '2024-04-02': { type: 'VACANCES', status: 'approved' },
    '2024-05-02': { type: 'VACANCES', status: 'approved' },
    '2024-05-03': { type: 'VACANCES', status: 'approved' },
    '2024-07-10': { type: 'VACANCES', status: 'approved' },
    '2024-07-11': { type: 'VACANCES', status: 'approved' },
    '2024-07-12': { type: 'VACANCES', status: 'approved' },
    '2024-07-15': { type: 'VACANCES', status: 'approved' },
    '2024-07-16': { type: 'VACANCES', status: 'approved' },
    '2024-07-17': { type: 'VACANCES', status: 'approved' },
    '2024-07-18': { type: 'VACANCES', status: 'approved' },
    '2024-07-19': { type: 'VACANCES', status: 'approved' },
    '2024-07-22': { type: 'VACANCES', status: 'approved' },
    '2024-08-12': { type: 'VACANCES', status: 'approved' },
    '2024-08-13': { type: 'VACANCES', status: 'approved' },
    '2024-08-14': { type: 'VACANCES', status: 'approved' },
    '2024-08-16': { type: 'VACANCES', status: 'approved' },
    '2024-10-31': { type: 'PONT', status: 'approved' },
    '2024-12-05': { type: 'PONT', status: 'approved' },
    '2024-12-23': { type: 'VACANCES', status: 'approved' },
    '2024-12-27': { type: 'VACANCES', status: 'approved' },
    '2024-12-30': { type: 'VACANCES', status: 'approved' },
    '2025-01-02': { type: 'VACANCES', status: 'approved' },
    '2025-01-03': { type: 'VACANCES', status: 'approved' },
    '2025-01-05': { type: 'VACANCES', status: 'approved' },
    '2025-01-07': { type: 'VACANCES', status: 'approved' },
    '2025-02-10': { type: 'VACANCES', status: 'approved' },
    '2025-03-03': { type: 'ASSUMPTES_PROPIS', status: 'approved' },
    '2025-04-14': { type: 'VACANCES', status: 'approved' },
    '2025-04-15': { type: 'VACANCES', status: 'approved' },
    '2025-04-16': { type: 'VACANCES', status: 'approved' },
    '2025-04-17': { type: 'VACANCES', status: 'approved' },
    '2025-04-22': { type: 'VACANCES', status: 'approved' },
    '2025-05-02': { type: 'PONT', status: 'approved' },
    '2025-06-05': { type: 'ASSUMPTES_PROPIS', status: 'approved' },
    '2025-06-23': { type: 'ASSUMPTES_PROPIS', status: 'approved' },
    '2025-07-28': { type: 'VACANCES', status: 'approved' },
    '2025-07-29': { type: 'VACANCES', status: 'approved' },
    '2025-07-30': { type: 'VACANCES', status: 'approved' },
    '2025-07-31': { type: 'VACANCES', status: 'approved' },
    '2025-08-01': { type: 'VACANCES', status: 'approved' },
    '2025-08-04': { type: 'VACANCES', status: 'approved' },
    '2025-08-05': { type: 'VACANCES', status: 'approved' },
    '2025-08-06': { type: 'VACANCES', status: 'approved' },
    '2025-08-07': { type: 'VACANCES', status: 'approved' },
    '2025-08-08': { type: 'VACANCES', status: 'approved' },
    '2025-08-18': { type: 'VACANCES', status: 'approved' },
    '2025-08-19': { type: 'VACANCES', status: 'approved' },
    '2025-08-20': { type: 'VACANCES', status: 'approved' },
    '2025-08-21': { type: 'VACANCES', status: 'approved' },
    '2025-08-22': { type: 'VACANCES', status: 'approved' },
    '2025-09-30': { type: 'ASSUMPTES_PROPIS', status: 'approved' },
    '2025-12-05': { type: 'PONT', status: 'approved' },
    '2025-12-22': { type: 'VACANCES', status: 'approved' },
    '2025-12-23': { type: 'VACANCES', status: 'approved' },
    '2025-12-29': { type: 'VACANCES', status: 'approved' },
    '2025-12-30': { type: 'VACANCES', status: 'approved' },
    '2026-01-02': { type: 'VACANCES', status: 'approved' },
    '2026-01-05': { type: 'VACANCES', status: 'approved' },
    '2026-01-07': { type: 'VACANCES', status: 'approved' },
};

const App: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>(() => {
    const savedUsers = loadUserData<UserProfile[]>('users', []);
    if (savedUsers.length === 0) {
      // First time load: seed Jordi's data
      localStorage.setItem(`leaveDays-${JORDI_PROFILE.id}`, JSON.stringify(JORDI_INITIAL_LEAVE_DAYS));
      localStorage.setItem(`leaveTypes-${JORDI_PROFILE.id}`, JSON.stringify(DEFAULT_LEAVE_TYPES));
      const initialUsers = [JORDI_PROFILE];
      localStorage.setItem('users', JSON.stringify(initialUsers));
      return initialUsers;
    }
    return savedUsers;
  });
  
  const [activeUser, setActiveUser] = useState<UserProfile | null>(() => {
    const activeUserId = localStorage.getItem('activeUserId');
    if (activeUserId) {
      const savedUsers = loadUserData<UserProfile[]>('users', []);
      return savedUsers.find(u => u.id === activeUserId) || null;
    }
    // If no active user, but Jordi was just seeded, make him active.
    const currentUsers = loadUserData<UserProfile[]>('users', []);
    if (!activeUserId && currentUsers.length > 0 && currentUsers[0].id === JORDI_PROFILE.id) {
        return currentUsers[0];
    }
    return null;
  });

  const [currentDate, setCurrentDate] = useState(() => {
    const savedDate = localStorage.getItem('currentCalendarDate');
    return savedDate ? new Date(JSON.parse(savedDate)) : new Date();
  });

  const [viewMode, setViewMode] = useState<'calendar' | 'timeline' | 'yearGrid' | 'reports'>('calendar');
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);

  // Filters State
  const [filters, setFilters] = useState<{ selectedTypes: string[], selectedUserIds: string[] }>({
    selectedTypes: [],
    selectedUserIds: [],
  });

  // Load all users' data into one structure
  const allUsersData = useMemo(() => {
    const data: Record<string, { leaveDays: Record<string, LeaveDay>, leaveTypes: Record<string, LeaveTypeInfo> }> = {};
    users.forEach(user => {
      data[user.id] = {
        leaveDays: loadUserData(`leaveDays-${user.id}`, {}),
        leaveTypes: loadUserData(`leaveTypes-${user.id}`, DEFAULT_LEAVE_TYPES)
      };
    });
    return data;
  }, [users]);

  // Derived state for all available leave types across users for the filter bar
  const allLeaveTypes = useMemo(() => {
    const combined: Record<string, LeaveTypeInfo> = {};
    Object.values(allUsersData).forEach(({ leaveTypes }) => {
      Object.assign(combined, leaveTypes);
    });
    return combined;
  }, [allUsersData]);

  // Filtered leave days for display
  const filteredLeaveDays = useMemo(() => {
    const displayDays: Record<string, DisplayLeaveDay[]> = {};

    users.forEach(user => {
      // Apply user filter
      if (filters.selectedUserIds.length > 0 && !filters.selectedUserIds.includes(user.id)) {
        return;
      }

      const userData = allUsersData[user.id];
      if (!userData) return;

      Object.entries(userData.leaveDays).forEach(([date, leaveDay]: [string, LeaveDay]) => {
        // Apply leave type filter
        if (filters.selectedTypes.length > 0 && !filters.selectedTypes.includes(leaveDay.type)) {
          return;
        }

        if (!displayDays[date]) {
          displayDays[date] = [];
        }
        displayDays[date].push({ ...leaveDay, user });
      });
    });
    return displayDays;
  }, [filters, allUsersData, users]);

  const activeUserLeaveDays = activeUser ? allUsersData[activeUser.id]?.leaveDays : {};
  const activeUserLeaveTypes = activeUser ? allUsersData[activeUser.id]?.leaveTypes : {};
  
  const setActiveUserAndSave = (user: UserProfile | null) => {
    setActiveUser(user);
    if (user) {
      localStorage.setItem('activeUserId', user.id);
    } else {
      localStorage.removeItem('activeUserId');
    }
  };
  
  const saveUsersAndLocalStorage = (newUsers: UserProfile[]) => {
      setUsers(newUsers);
      localStorage.setItem('users', JSON.stringify(newUsers));
  }

  useEffect(() => {
    localStorage.setItem('currentCalendarDate', JSON.stringify(currentDate));
  }, [currentDate]);

  const holidays = useMemo(() => getHolidaysForYear(getYear(currentDate)), [currentDate]);

  const handleSetLeaveDay = useCallback((date: string, type: string | null) => {
    if (!activeUser) return;
    const key = `leaveDays-${activeUser.id}`;
    const currentDays = loadUserData<Record<string, LeaveDay>>(key, {});
    
    let newDays;
    if (type === null) {
      const { [date]: _, ...rest } = currentDays;
      newDays = rest;
    } else {
      if (currentDays[date]) return currentDays; // Day already taken by active user
      newDays = { ...currentDays, [date]: { type, status: 'requested' } };
    }
    localStorage.setItem(key, JSON.stringify(newDays));
    // Force re-read from storage for simplicity, or update allUsersData state
    setUsers(prev => [...prev]); // Trigger re-render and re-memoization
  }, [activeUser]);
  
  const handleApproveDay = useCallback((date: string, userId: string) => {
    const key = `leaveDays-${userId}`;
    const currentDays = loadUserData<Record<string, LeaveDay>>(key, {});
    if (currentDays[date]?.status === 'requested') {
      const newDays = { ...currentDays, [date]: { ...currentDays[date], status: 'approved' } };
      localStorage.setItem(key, JSON.stringify(newDays));
      setUsers(prev => [...prev]); // Trigger re-render
    }
  }, []);

  const handleSetLeaveTypes = (newTypes: Record<string, LeaveTypeInfo>) => {
      if (!activeUser) return;
      const key = `leaveTypes-${activeUser.id}`;
      localStorage.setItem(key, JSON.stringify(newTypes));
      setUsers(prev => [...prev]); // Trigger re-render
  };

  const leaveDayStats = useMemo(() => {
    const stats: Record<string, LeaveDayStats> = {};
    const currentYear = getYear(currentDate);

    Object.keys(allLeaveTypes).forEach(type => {
        stats[type] = { requested: 0, approved: 0, remaining: 0, requestedDates: [], approvedDates: [] };
    });

    Object.entries(filteredLeaveDays).forEach(([date, days]: [string, DisplayLeaveDay[]]) => {
        if (parseISO(date).getFullYear() !== currentYear) {
            return; // Only count days in the current year
        }
        days.forEach(day => {
            if (stats[day.type]) {
                if (day.status === 'approved') {
                    stats[day.type].approved++;
                    stats[day.type].approvedDates.push({ user: day.user, date });
                } else {
                    stats[day.type].requested++;
                    stats[day.type].requestedDates.push({ user: day.user, date });
                }
            }
        });
    });
    
    Object.keys(stats).forEach(type => {
        stats[type].requestedDates.sort((a, b) => a.date.localeCompare(b.date));
        stats[type].approvedDates.sort((a, b) => a.date.localeCompare(b.date));
    });

    return stats;
  }, [filteredLeaveDays, allLeaveTypes, currentDate]);
  
  if (!activeUser) {
      return <UserSelection users={users} setUsers={saveUsersAndLocalStorage} onUserSelect={setActiveUserAndSave} />;
  }

  const renderCurrentView = () => {
    switch(viewMode) {
      case 'calendar':
        return <Calendar
          currentDate={currentDate}
          setCurrentDate={setCurrentDate}
          leaveDays={filteredLeaveDays}
          onSetLeaveDay={handleSetLeaveDay}
          onApproveDay={handleApproveDay}
          leaveTypes={allLeaveTypes}
          holidays={holidays}
          activeUser={activeUser}
        />;
      case 'timeline':
        return <Timeline
          currentDate={currentDate}
          setCurrentDate={setCurrentDate}
          leaveDays={filteredLeaveDays}
          leaveTypes={allLeaveTypes}
          holidays={holidays}
        />;
      case 'yearGrid':
        return <YearGrid
          currentDate={currentDate}
          setCurrentDate={setCurrentDate}
          leaveDays={filteredLeaveDays}
          leaveTypes={allLeaveTypes}
          holidays={holidays}
        />;
      case 'reports':
        return <ReportsDashboard
          filters={filters}
          allUsers={users}
          allUsersData={allUsersData}
          allLeaveTypes={allLeaveTypes}
          year={getYear(currentDate)}
        />;
      default:
        return null;
    }
  };
  
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col h-screen font-sans">
        <header className="bg-white shadow-md p-4 flex justify-between items-center no-print">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Gestor de Permisos</h1>
                <p className="text-sm text-gray-600">Usuari: <span className="font-semibold">{activeUser.name}</span></p>
            </div>
            <div>
                <button
                    onClick={() => setActiveUserAndSave(null)}
                    className="mr-4 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                >
                    Canviar d'Usuari
                </button>
                <button
                    onClick={() => setIsRequestModalOpen(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    Generar Sol·licitud
                </button>
            </div>
        </header>
        <div className="flex flex-1 overflow-hidden">
          <Sidebar 
            stats={leaveDayStats} 
            leaveTypes={activeUserLeaveTypes} // Draggable types are for the active user
            allLeaveTypes={allLeaveTypes}
            onManageClick={() => setIsManageModalOpen(true)}
          />
          <main className="flex-1 p-6 overflow-auto bg-gray-50 flex flex-col">
            <div className="bg-white p-3 rounded-lg shadow-sm no-print mb-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2 self-start">
                  <span className="text-sm font-semibold text-gray-600">Vista:</span>
                  <button onClick={() => setViewMode('calendar')} className={`px-3 py-1 text-sm rounded-md transition-colors ${viewMode === 'calendar' ? 'bg-blue-600 text-white shadow' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>Mensual</button>
                  <button onClick={() => setViewMode('timeline')} className={`px-3 py-1 text-sm rounded-md transition-colors ${viewMode === 'timeline' ? 'bg-blue-600 text-white shadow' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>Línia de Temps</button>
                  <button onClick={() => setViewMode('yearGrid')} className={`px-3 py-1 text-sm rounded-md transition-colors ${viewMode === 'yearGrid' ? 'bg-blue-600 text-white shadow' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>Anual</button>
                  <button onClick={() => setViewMode('reports')} className={`px-3 py-1 text-sm rounded-md transition-colors ${viewMode === 'reports' ? 'bg-blue-600 text-white shadow' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>Informes</button>
                </div>
                <FilterBar allUsers={users} allLeaveTypes={allLeaveTypes} filters={filters} onFilterChange={setFilters} />
            </div>

            {renderCurrentView()}
          </main>
        </div>
      </div>
      {isRequestModalOpen && <RequestModal user={activeUser} leaveDays={activeUserLeaveDays} leaveTypes={activeUserLeaveTypes} onClose={() => setIsRequestModalOpen(false)} />}
      {isManageModalOpen && (
        <ManageLeaveTypesModal 
          leaveTypes={activeUserLeaveTypes}
          setLeaveTypes={handleSetLeaveTypes}
          leaveDays={activeUserLeaveDays}
          onClose={() => setIsManageModalOpen(false)}
        />
      )}
    </DndProvider>
  );
};

export default App;
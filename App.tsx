import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Calendar from './components/Calendar';
import Sidebar from './components/Sidebar';
import UserSelection from './components/UserSelection';
import ManageLeaveTypesModal from './components/ManageLeaveTypesModal';
import RequestModal from './components/RequestModal';
import Timeline from './components/Timeline';
import YearGrid from './components/YearGrid';
import ReportsDashboard from './components/ReportsDashboard';
import FilterBar from './components/FilterBar';
import { getHolidaysForYear } from './utils/holidays';
import { calculateVacationDays } from './utils/vacationCalculator';
import { UserProfile, UserData, LeaveDay, Holiday, LeaveDayStats, LeaveTypeInfo } from './types';
import { DEFAULT_LEAVE_TYPES } from './constants';
import { getYear, format, parseISO } from 'date-fns';

type ViewMode = 'calendar' | 'timeline' | 'yearGrid' | 'reports';

const App: React.FC = () => {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [activeUser, setActiveUser] = useState<UserProfile | null>(null);
    const [activeUserData, setActiveUserData] = useState<UserData | null>(null);
    
    const [currentDate, setCurrentDate] = useState(new Date());
    const [holidays, setHolidays] = useState<Record<string, Holiday>>({});
    
    const [isManageModalOpen, setManageModalOpen] = useState(false);
    const [isRequestModalOpen, setRequestModalOpen] = useState(false);
    
    const [viewMode, setViewMode] = useState<ViewMode>('calendar');
    const [filters, setFilters] = useState<{ selectedTypes: string[]; selectedUserIds: string[] }>({
        selectedTypes: [],
        selectedUserIds: [],
    });

    // Carrega inicial d'usuaris i dades
    useEffect(() => {
        const savedUsers = localStorage.getItem('users');
        const savedActiveUserId = localStorage.getItem('activeUserId');
        
        let initialUsers = savedUsers ? JSON.parse(savedUsers) : [];
        if (initialUsers.length === 0) {
            const defaultUser: UserProfile = { id: 'user-jordi-mir', name: 'Jordi Mir Gordils', dni: '43671673D', department: 'Serveis Tècnics', hireDate: '1988-01-01' };
            initialUsers.push(defaultUser);
            setUsers(initialUsers);
            localStorage.setItem('users', JSON.stringify(initialUsers));
        } else {
            setUsers(initialUsers);
        }

        if (savedActiveUserId) {
            const userToActivate = initialUsers.find((u: UserProfile) => u.id === savedActiveUserId);
            if (userToActivate) {
                handleUserChange(userToActivate.id);
            }
        }
    }, []);

    useEffect(() => {
        setHolidays(getHolidaysForYear(getYear(currentDate)));
    }, [currentDate]);
    
    const handleUserChange = (userId: string | null) => {
        if (userId === null) {
            setActiveUser(null);
            setActiveUserData(null);
            localStorage.removeItem('activeUserId');
            return;
        }

        const user = users.find(u => u.id === userId);
        if (user) {
            const userDataStr = localStorage.getItem(`userData_${userId}`);
            let userData: UserData;
            if (userDataStr) {
                userData = JSON.parse(userDataStr);
            } else {
                userData = {
                    leaveDays: {},
                    leaveTypes: JSON.parse(JSON.stringify(DEFAULT_LEAVE_TYPES)),
                    workDays: [true, true, true, true, true, false, false]
                };
            }

            // Dynamic vacation calculation
            const vacationDays = calculateVacationDays(user.hireDate);
            userData.leaveTypes['VACANCES'].total = vacationDays;
            
            setActiveUser(user);
            setActiveUserData(userData);
            localStorage.setItem('activeUserId', userId);
            localStorage.setItem(`userData_${userId}`, JSON.stringify(userData));
        }
    };
    
    const saveData = (newUserData: UserData) => {
        if (!activeUser) return;
        setActiveUserData(newUserData);
        localStorage.setItem(`userData_${activeUser.id}`, JSON.stringify(newUserData));
    };

    const onSetLeaveDay = useCallback((date: string, type: string | null) => {
        if (!activeUserData) return;
        const newLeaveDays = { ...activeUserData.leaveDays };
        if (type === null) {
            delete newLeaveDays[date];
        } else {
            newLeaveDays[date] = { type, status: 'requested' };
        }
        saveData({ ...activeUserData, leaveDays: newLeaveDays });
    }, [activeUserData]);

    const onApproveDay = useCallback((date: string) => {
        if (!activeUserData) return;
        const newLeaveDays = { ...activeUserData.leaveDays };
        if (newLeaveDays[date]) {
            newLeaveDays[date].status = 'approved';
        }
        saveData({ ...activeUserData, leaveDays: newLeaveDays });
    }, [activeUserData]);

    const onSaveLeaveTypes = (updatedLeaveTypes: Record<string, LeaveTypeInfo>) => {
        if (!activeUserData) return;
        saveData({ ...activeUserData, leaveTypes: updatedLeaveTypes });
        setManageModalOpen(false);
    };

    const onWorkDaysChange = (newWorkDays: boolean[]) => {
        if (!activeUserData) return;
        saveData({ ...activeUserData, workDays: newWorkDays });
    };

    const statsForSidebar = useMemo((): Record<string, LeaveDayStats> => {
        if (!activeUser || !activeUserData) return {};

        const result: Record<string, LeaveDayStats> = {};
        Object.keys(activeUserData.leaveTypes).forEach(key => {
            result[key] = { approved: 0, requested: 0, approvedDates: [], requestedDates: [] };
        });

        Object.entries(activeUserData.leaveDays).forEach(([date, leaveDay]: [string, LeaveDay]) => {
             const stat = result[leaveDay.type];
             if (!stat || getYear(parseISO(date)) !== getYear(currentDate)) return;
            
             // Regla de negoci: no comptar vacances dels primers 15 dies de gener
            const isVacationInEarlyJanuary = leaveDay.type === 'VACANCES' && parseISO(date).getMonth() === 0 && parseISO(date).getDate() <= 15;
            if (isVacationInEarlyJanuary) return;

             if (leaveDay.status === 'approved') {
                 stat.approved++;
                 stat.approvedDates.push({ date, user: activeUser });
             } else {
                 stat.requested++;
                 stat.requestedDates.push({ date, user: activeUser });
             }
        });
        return result;
    }, [activeUser, activeUserData, currentDate]);

    // Per a la vista d'informes, necessitem les dades de tots
    const allUsersDataForReports = useMemo(() => {
        const data: Record<string, UserData> = {};
        users.forEach(user => {
            const userDataStr = localStorage.getItem(`userData_${user.id}`);
            if (userDataStr) {
                data[user.id] = JSON.parse(userDataStr);
            }
        });
        return data;
    }, [users]);
    
    if (!activeUser || !activeUserData) {
        return <UserSelection users={users} setUsers={setUsers} onUserSelect={handleUserChange} />;
    }

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="flex h-screen bg-gray-100 font-sans">
                <Sidebar 
                    stats={statsForSidebar} 
                    leaveTypes={activeUserData.leaveTypes} 
                    workDays={activeUserData.workDays}
                    onWorkDaysChange={onWorkDaysChange}
                    onManageClick={() => setManageModalOpen(true)}
                    onUserChange={() => handleUserChange(null)}
                    activeUser={activeUser}
                />

                <main className="flex-1 flex flex-col p-4 overflow-y-auto">
                    <header className="flex justify-between items-center mb-4 flex-shrink-0 no-print">
                         <div className="flex items-center gap-2">
                            <button onClick={() => setViewMode('calendar')} className={`px-3 py-1 text-sm rounded-md ${viewMode === 'calendar' ? 'bg-blue-600 text-white' : 'bg-white'}`}>Calendari</button>
                            <button onClick={() => setViewMode('timeline')} className={`px-3 py-1 text-sm rounded-md ${viewMode === 'timeline' ? 'bg-blue-600 text-white' : 'bg-white'}`}>Timeline</button>
                            <button onClick={() => setViewMode('yearGrid')} className={`px-3 py-1 text-sm rounded-md ${viewMode === 'yearGrid' ? 'bg-blue-600 text-white' : 'bg-white'}`}>Any</button>
                            <button onClick={() => setViewMode('reports')} className={`px-3 py-1 text-sm rounded-md ${viewMode === 'reports' ? 'bg-blue-600 text-white' : 'bg-white'}`}>Informes</button>
                        </div>
                        <div className="flex items-center gap-4">
                           {viewMode === 'reports' && (
                                <FilterBar 
                                    allUsers={users} 
                                    allLeaveTypes={activeUserData.leaveTypes} 
                                    filters={filters} 
                                    onFilterChange={setFilters} 
                                />
                            )}
                            <button onClick={() => setRequestModalOpen(true)} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Generar Sol·licitud</button>
                        </div>
                    </header>
                    <div className="flex-1 overflow-auto">
                         {viewMode === 'calendar' && <Calendar currentDate={currentDate} setCurrentDate={setCurrentDate} leaveDays={activeUserData.leaveDays} onSetLeaveDay={onSetLeaveDay} onApproveDay={onApproveDay} leaveTypes={activeUserData.leaveTypes} holidays={holidays} workDays={activeUserData.workDays}/>}
                         {viewMode === 'timeline' && <Timeline currentDate={currentDate} setCurrentDate={setCurrentDate} leaveDays={{[activeUser.id]: activeUserData.leaveDays}} leaveTypes={activeUserData.leaveTypes} holidays={holidays} users={[activeUser]}/>}
                         {viewMode === 'yearGrid' && <YearGrid currentDate={currentDate} setCurrentDate={setCurrentDate} leaveDays={{[activeUser.id]: activeUserData.leaveDays}} leaveTypes={activeUserData.leaveTypes} holidays={holidays} users={[activeUser]}/>}
                         {viewMode === 'reports' && <ReportsDashboard filters={filters} allUsers={users} allUsersData={allUsersDataForReports} allLeaveTypes={activeUserData.leaveTypes} year={getYear(currentDate)} />}
                    </div>
                </main>

                {isManageModalOpen && <ManageLeaveTypesModal leaveTypes={activeUserData.leaveTypes} onSave={onSaveLeaveTypes} onClose={() => setManageModalOpen(false)} />}
                {isRequestModalOpen && <RequestModal user={activeUser} leaveDays={activeUserData.leaveDays} leaveTypes={activeUserData.leaveTypes} onClose={() => setRequestModalOpen(false)} />}
            </div>
        </DndProvider>
    );
};

export default App;

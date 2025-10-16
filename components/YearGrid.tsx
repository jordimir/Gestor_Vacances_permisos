import React from 'react';
import { format, getYear, getDaysInMonth, startOfMonth, getDay, addYears, subYears } from 'date-fns';
import { ca } from 'date-fns/locale';
import { LeaveTypeInfo, Holiday, LeaveDay, UserProfile } from '../types';

interface YearGridProps {
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  leaveDays: Record<string, Record<string, LeaveDay>>;
  leaveTypes: Record<string, LeaveTypeInfo>;
  holidays: Record<string, Holiday>;
  users: UserProfile[];
}

const YearGridHeader: React.FC<{ year: number; onPrevYear: () => void; onNextYear: () => void; }> = ({ year, onPrevYear, onNextYear }) => (
    <div className="flex items-center justify-between mb-4">
        <button onClick={onPrevYear} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
        </button>
        <h2 className="text-2xl font-bold text-gray-700">{year}</h2>
        <button onClick={onNextYear} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
        </button>
    </div>
);

const MiniCalendar: React.FC<{ year: number; month: number; userLeaveDays: Record<string, LeaveDay>; leaveTypes: Record<string, LeaveTypeInfo>; holidays: Record<string, Holiday>; }> = ({ year, month, userLeaveDays, leaveTypes, holidays }) => {
    const monthDate = new Date(year, month);
    const monthName = format(monthDate, 'MMMM', { locale: ca });
    const daysInMonth = getDaysInMonth(monthDate);
    const firstDayOfMonth = getDay(startOfMonth(monthDate));
    const startingDayOfWeek = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const emptyDays = Array.from({ length: startingDayOfWeek }, (_, i) => i);
    
    const weekDays = ['Dl', 'Dt', 'Dc', 'Dj', 'Dv', 'Ds', 'Dg'];

    return (
        <div className="bg-white rounded-lg shadow p-3 flex flex-col">
            <h3 className="font-bold text-center text-gray-800 capitalize mb-2">{monthName}</h3>
            <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500">
                {weekDays.map(wd => <div key={wd}>{wd}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1 mt-1 flex-1">
                {emptyDays.map(i => <div key={`empty-${i}`} />)}
                {days.map(day => {
                    const date = new Date(year, month, day);
                    const dateString = format(date, 'yyyy-MM-dd');
                    const dayOfWeek = date.getDay();
                    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                    const holidayInfo = holidays[dateString];
                    const leaveDay = userLeaveDays[dateString];

                    let cellClass = 'w-full h-6 rounded flex items-center justify-center text-xs';
                    let tooltip = '';

                    if (leaveDay) {
                        const leaveInfo = leaveTypes[leaveDay.type];
                        cellClass += ` ${leaveInfo?.color} ${leaveInfo?.textColor} font-bold`;
                        tooltip = leaveInfo?.label || 'Permís';
                    } else if (holidayInfo) {
                        cellClass += ' bg-yellow-300';
                        tooltip = holidayInfo.name;
                    } else if (isWeekend) {
                        cellClass += ' bg-gray-200';
                    } else {
                        cellClass += ' bg-gray-50';
                    }

                    return (
                        <div key={day} className={cellClass} title={tooltip}>
                           {day}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const YearGrid: React.FC<YearGridProps> = ({ currentDate, setCurrentDate, leaveDays, leaveTypes, holidays, users }) => {
    const year = getYear(currentDate);

    const handlePrevYear = () => setCurrentDate(subYears(currentDate, 1));
    const handleNextYear = () => setCurrentDate(addYears(currentDate, 1));

    const user = users[0];
    const userLeaveDays = leaveDays[user.id] || {};

    return (
        <div className="h-full flex flex-col">
            <YearGridHeader year={year} onPrevYear={handlePrevYear} onNextYear={handleNextYear} />
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-y-auto p-1">
                {Array.from({ length: 12 }).map((_, index) => (
                    <MiniCalendar 
                        key={index}
                        year={year}
                        month={index}
                        userLeaveDays={userLeaveDays}
                        leaveTypes={leaveTypes}
                        holidays={holidays}
                    />
                ))}
            </div>
        </div>
    );
};

export default YearGrid;

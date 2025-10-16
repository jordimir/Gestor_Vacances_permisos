import React from 'react';
import { format, getDaysInMonth, getYear, addYears, subYears } from 'date-fns';
import { ca } from 'date-fns/locale';
import { LeaveTypeInfo, Holiday, DisplayLeaveDay } from '../types';

interface TimelineProps {
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  leaveDays: Record<string, DisplayLeaveDay[]>;
  leaveTypes: Record<string, LeaveTypeInfo>;
  holidays: Record<string, Holiday>;
}

const TimelineHeader: React.FC<{ year: number; onPrevYear: () => void; onNextYear: () => void; }> = ({ year, onPrevYear, onNextYear }) => (
    <div className="flex items-center justify-between mb-4 sticky top-0 bg-white py-2 z-20">
        <button onClick={onPrevYear} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
        </button>
        <h2 className="text-xl font-semibold text-gray-700">{year}</h2>
        <button onClick={onNextYear} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
        </button>
    </div>
);

const Timeline: React.FC<TimelineProps> = ({ currentDate, setCurrentDate, leaveDays, leaveTypes, holidays }) => {
  const year = getYear(currentDate);
  const months = Array.from({ length: 12 }, (_, i) => i);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  const handlePrevYear = () => setCurrentDate(subYears(currentDate, 1));
  const handleNextYear = () => setCurrentDate(addYears(currentDate, 1));

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg">
      <div className="overflow-x-auto relative" style={{maxHeight: 'calc(100vh - 250px)'}}>
        <TimelineHeader year={year} onPrevYear={handlePrevYear} onNextYear={handleNextYear} />
        
        <div className="grid" style={{ gridTemplateColumns: '5rem repeat(31, minmax(2rem, 1fr))' }}>
          {/* Day Header */}
          <div className="font-semibold text-gray-500 sticky top-16 bg-white z-20 border-b-2 border-gray-200"></div>
          {days.map(day => (
            <div key={day} className="font-semibold text-gray-500 p-1 text-center text-xs sticky top-16 bg-white z-20 border-b-2 border-gray-200">{day}</div>
          ))}
          
          {/* Month Rows */}
          {months.map(monthIndex => {
            const monthName = format(new Date(year, monthIndex), 'MMMM', { locale: ca });
            const daysInMonth = getDaysInMonth(new Date(year, monthIndex));
            
            return (
              <React.Fragment key={monthIndex}>
                <div className="capitalize font-bold text-gray-700 p-2 text-sm sticky left-0 bg-gray-50 z-10 flex items-center justify-center border-t border-gray-200">{monthName}</div>
                {days.map(day => {
                  if (day > daysInMonth) {
                    return <div key={day} className="bg-gray-50 border-t border-l border-gray-200"></div>;
                  }
                  
                  const date = new Date(year, monthIndex, day);
                  const dateString = format(date, 'yyyy-MM-dd');
                  const dayOfWeek = date.getDay();
                  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                  const holidayInfo = holidays[dateString];
                  const leaveDaysOnDay = leaveDays[dateString];

                  let cellClass = 'h-8 border-t border-l border-gray-200';
                  let tooltip = '';
                  let cellStyle: React.CSSProperties = {};

                  if (leaveDaysOnDay && leaveDaysOnDay.length > 0) {
                      if (leaveDaysOnDay.length === 1) {
                          const leaveInfo = leaveTypes[leaveDaysOnDay[0].type];
                          cellClass += ` ${leaveInfo?.color || 'bg-gray-400'}`;
                          tooltip = `${leaveDaysOnDay[0].user.name}: ${leaveInfo?.label}`;
                      } else {
                          // Multiple users, create a striped background
                          const colors = leaveDaysOnDay.map(ld => leaveTypes[ld.type]?.color).map(c => `var(--tw-color-${c.split('-')[1]}-${c.split('-')[2]})`);
                          cellStyle.background = `repeating-linear-gradient(45deg, ${colors[0]}, ${colors[0]} 10px, ${colors[1] || '#E5E7EB'} 10px, ${colors[1] || '#E5E7EB'} 20px)`;
                          tooltip = leaveDaysOnDay.map(ld => `${ld.user.name}: ${leaveTypes[ld.type]?.label}`).join('\n');
                      }
                  } else if (holidayInfo) {
                      cellClass += ' bg-yellow-200';
                      tooltip = holidayInfo.name;
                  } else if (isWeekend) {
                      cellClass += ' bg-gray-200';
                  } else {
                      cellClass += ' bg-white'
                  }

                  return (
                    <div key={day} className={cellClass} title={tooltip} style={cellStyle}></div>
                  );
                })}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Timeline;

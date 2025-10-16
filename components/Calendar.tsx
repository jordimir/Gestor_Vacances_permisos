import React from 'react';
import { useDrop } from 'react-dnd';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, eachDayOfInterval, getDay, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { ca } from 'date-fns/locale';
import { LeaveDay, LeaveTypeInfo } from '../types';
import { HOLIDAYS_2025, Holiday } from '../constants';

interface CalendarProps {
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  leaveDays: Record<string, LeaveDay>;
  onSetLeaveDay: (date: string, type: string | null) => void;
  onApproveDay: (date: string) => void;
  leaveTypes: Record<string, LeaveTypeInfo>;
}

const CalendarHeader: React.FC<{ currentDate: Date; onPrevMonth: () => void; onNextMonth: () => void; }> = ({ currentDate, onPrevMonth, onNextMonth }) => (
  <div className="flex items-center justify-between mb-4">
    <button onClick={onPrevMonth} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
    </button>
    <h2 className="text-xl font-semibold text-gray-700 capitalize">
      {format(currentDate, 'MMMM yyyy', { locale: ca })}
    </h2>
    <button onClick={onNextMonth} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  </div>
);

const Day: React.FC<{ day: Date; isCurrentMonth: boolean; leaveDay?: LeaveDay; onSetLeaveDay: (date: string, type: string | null) => void; onApproveDay: (date: string) => void; leaveTypes: Record<string, LeaveTypeInfo> }> = ({ day, isCurrentMonth, leaveDay, onSetLeaveDay, onApproveDay, leaveTypes }) => {
  const dateString = format(day, 'yyyy-MM-dd');
  const holidayInfo = HOLIDAYS_2025[dateString];
  const isWeekend = getDay(day) === 0 || getDay(day) === 6;

  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'LEAVE_TYPE',
    canDrop: () => !leaveDay,
    drop: (item: { type: string }) => onSetLeaveDay(dateString, item.type),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  }), [dateString, onSetLeaveDay, leaveDay]);

  const leaveInfo = leaveDay ? leaveTypes[leaveDay.type] : null;

  const borderStyle = leaveDay?.status === 'requested' ? 'border-dashed border-orange-400' : 'border-solid border-green-500';

  const holidayColorClasses: Record<Holiday['type'], string> = {
    national: 'text-red-700',
    catalan: 'text-red-700',
    local: 'text-purple-700',
    patron: 'text-green-700',
  };
  const holidayColor = holidayInfo ? holidayColorClasses[holidayInfo.type] : '';

  return (
    <div
      ref={drop}
      className={`relative h-28 border flex flex-col p-2 transition-all duration-200
        ${isCurrentMonth ? 'bg-white' : 'bg-gray-50 text-gray-400'}
        ${isOver && canDrop ? 'bg-blue-100' : ''}
        ${isOver && !canDrop ? 'bg-red-200 cursor-not-allowed' : ''}
        ${leaveDay ? borderStyle + ' border-2' : 'border-gray-200'}
        ${isSameDay(day, new Date()) && !leaveDay ? 'border-2 border-blue-500' : ''}
      `}
    >
      <time dateTime={dateString} className={`font-medium ${holidayInfo || isWeekend ? 'text-red-600' : 'text-gray-600'}`}>{format(day, 'd')}</time>
      {holidayInfo && <span className={`text-xs ${holidayColor} mt-1 truncate font-semibold`}>{holidayInfo.name}</span>}
      
      {leaveInfo && (
        <div className={`mt-auto p-1 rounded-md text-xs font-semibold flex items-center justify-between ${leaveInfo.color} ${leaveInfo.textColor}`}>
          <span className="truncate flex-1">{leaveInfo.label}</span>
          <button onClick={() => onSetLeaveDay(dateString, null)} className="ml-1 opacity-75 hover:opacity-100 flex-shrink-0">
            &times;
          </button>
        </div>
      )}

      {leaveDay && (
          <div className="absolute top-1 right-1">
              {leaveDay.status === 'requested' ? (
                  <button onClick={() => onApproveDay(dateString)} title="Aprovar dia" className="w-5 h-5 bg-orange-400 rounded-full flex items-center justify-center text-white hover:bg-orange-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                  </button>
              ) : (
                  <div title="Dia aprovat" className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                  </div>
              )}
          </div>
      )}
    </div>
  );
};


const Calendar: React.FC<CalendarProps> = ({ currentDate, setCurrentDate, leaveDays, onSetLeaveDay, onApproveDay, leaveTypes }) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
  
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <CalendarHeader currentDate={currentDate} onPrevMonth={prevMonth} onNextMonth={nextMonth} />
      <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200">
        {['Dl', 'Dt', 'Dc', 'Dj', 'Dv', 'Ds', 'Dg'].map(day => (
          <div key={day} className="text-center font-semibold text-sm text-gray-500 py-2 bg-gray-100">{day}</div>
        ))}
        {days.map(day => (
          <Day
            key={day.toString()}
            day={day}
            isCurrentMonth={isSameMonth(day, monthStart)}
            leaveDay={leaveDays[format(day, 'yyyy-MM-dd')]}
            onSetLeaveDay={onSetLeaveDay}
            onApproveDay={onApproveDay}
            leaveTypes={leaveTypes}
          />
        ))}
      </div>
    </div>
  );
};

export default Calendar;
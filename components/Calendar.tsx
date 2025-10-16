import React from 'react';
import { useDrop } from 'react-dnd';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, eachDayOfInterval, getDay, isSameMonth, isSameDay, addMonths, subMonths, getYear, setYear } from 'date-fns';
import { ca } from 'date-fns/locale';
import { LeaveTypeInfo, Holiday, LeaveDay } from '../types';

interface CalendarProps {
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  leaveDays: Record<string, LeaveDay>;
  onSetLeaveDay: (date: string, type: string | null) => void;
  onApproveDay: (date: string) => void;
  leaveTypes: Record<string, LeaveTypeInfo>;
  holidays: Record<string, Holiday>;
  workDays: boolean[];
}

const CalendarHeader: React.FC<{ currentDate: Date; onPrevMonth: () => void; onNextMonth: () => void; onPrevYear: () => void; onNextYear: () => void; }> = ({ currentDate, onPrevMonth, onNextMonth, onPrevYear, onNextYear }) => (
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center">
      <button onClick={onPrevYear} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
      </button>
      <button onClick={onPrevMonth} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
      </button>
    </div>
    <h2 className="text-xl font-semibold text-gray-700 capitalize">
      {format(currentDate, 'MMMM yyyy', { locale: ca })}
    </h2>
    <div className="flex items-center">
      <button onClick={onNextMonth} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
      </button>
      <button onClick={onNextYear} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
      </button>
    </div>
  </div>
);

const Day: React.FC<{
  day: Date;
  isCurrentMonth: boolean;
  leaveDay: LeaveDay | undefined;
  onSetLeaveDay: (date: string, type: string | null) => void;
  onApproveDay: (date: string) => void;
  leaveTypes: Record<string, LeaveTypeInfo>;
  holiday?: Holiday;
  workDays: boolean[];
}> = ({ day, isCurrentMonth, leaveDay, onSetLeaveDay, onApproveDay, leaveTypes, holiday, workDays }) => {
  const dateString = format(day, 'yyyy-MM-dd');
  const dayOfWeek = getDay(day); // Sunday = 0, Monday = 1...
  const isCustomNonWorkDay = !workDays[dayOfWeek === 0 ? 6 : dayOfWeek - 1];
  const isNonWorkDay = holiday || isCustomNonWorkDay;

  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'LEAVE_TYPE',
    canDrop: () => !leaveDay && !isNonWorkDay && isCurrentMonth,
    drop: (item: { type: string }) => onSetLeaveDay(dateString, item.type),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  }), [dateString, onSetLeaveDay, leaveDay, isNonWorkDay, isCurrentMonth]);

  const holidayColorClasses: Record<Holiday['type'], string> = {
    national: 'text-red-700',
    catalan: 'text-red-700',
    local: 'text-purple-700',
    patron: 'text-green-700',
  };
  const holidayColor = holiday ? holidayColorClasses[holiday.type] : '';

  let baseBgClass = 'bg-white';
  let stripedBg = isCustomNonWorkDay ? 'bg-[repeating-linear-gradient(45deg,rgba(0,0,0,0.05),rgba(0,0,0,0.05)_10px,transparent_10px,transparent_20px)]' : '';

  if (!isCurrentMonth) {
    baseBgClass = 'bg-gray-50 text-gray-400';
    stripedBg = '';
  } else if (holiday) {
    baseBgClass = 'bg-gray-100';
  }


  return (
    <div
      ref={drop}
      className={`relative min-h-[7rem] border border-gray-200 flex flex-col p-1.5 transition-all duration-200 ${baseBgClass} ${stripedBg}
        ${isOver && canDrop ? 'bg-blue-100' : ''}
        ${isOver && !canDrop ? 'bg-red-200 cursor-not-allowed' : ''}
        ${isSameDay(day, new Date()) ? 'border-2 border-blue-500' : ''}
      `}
    >
      <time dateTime={dateString} className={`text-sm font-medium ${isNonWorkDay ? 'text-red-600' : 'text-gray-600'}`}>{format(day, 'd')}</time>
      {holiday && <span className={`text-xs ${holidayColor} mt-1 truncate font-semibold`}>{holiday.name}</span>}
      
      <div className="mt-1 space-y-1 overflow-y-auto">
        {leaveDay && leaveTypes[leaveDay.type] && (() => {
          const leaveInfo = leaveTypes[leaveDay.type];
          const borderStyle = leaveDay.status === 'requested' ? 'border-dashed border-orange-400' : 'border-solid border-green-500';

          return (
            <div title={leaveInfo.label} className={`p-2 rounded-md text-xs font-semibold flex items-center justify-between border-2 ${leaveInfo.color} ${leaveInfo.textColor} ${borderStyle}`}>
              <span className="truncate flex-1">{leaveInfo.label}</span>
              <button onClick={() => onSetLeaveDay(dateString, null)} className="ml-1 opacity-75 hover:opacity-100 flex-shrink-0">
                &times;
              </button>
              {leaveDay.status === 'requested' ? (
                  <button onClick={() => onApproveDay(dateString)} title="Aprovar dia" className="w-4 h-4 bg-orange-400 rounded-full flex items-center justify-center text-white hover:bg-orange-500 ml-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-2 w-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                  </button>
              ) : (
                  <div title="Dia aprovat" className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-white ml-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-2 w-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                  </div>
              )}
            </div>
          );
        })()}
      </div>
    </div>
  );
};

const Calendar: React.FC<CalendarProps> = ({ currentDate, setCurrentDate, leaveDays, onSetLeaveDay, onApproveDay, leaveTypes, holidays, workDays }) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
  
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextYear = () => setCurrentDate(setYear(currentDate, getYear(currentDate) + 1));
  const prevYear = () => setCurrentDate(setYear(currentDate, getYear(currentDate) - 1));

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <CalendarHeader 
        currentDate={currentDate} 
        onPrevMonth={prevMonth} 
        onNextMonth={nextMonth} 
        onPrevYear={prevYear}
        onNextYear={nextYear}
      />
      <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200">
        {['Dl', 'Dt', 'Dc', 'Dj', 'Dv', 'Ds', 'Dg'].map(day => (
          <div key={day} className="text-center font-semibold text-sm text-gray-500 py-2 bg-gray-100">{day}</div>
        ))}
        {days.map(day => {
          const dateString = format(day, 'yyyy-MM-dd');
          return (
            <Day
              key={day.toString()}
              day={day}
              isCurrentMonth={isSameMonth(day, monthStart)}
              leaveDay={leaveDays[dateString]}
              onSetLeaveDay={onSetLeaveDay}
              onApproveDay={onApproveDay}
              leaveTypes={leaveTypes}
              holiday={holidays[dateString]}
              workDays={workDays}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;

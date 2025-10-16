

import React from 'react';
import { format, startOfYear, addDays, getDay, differenceInCalendarWeeks } from 'date-fns';
import { ca } from 'date-fns/locale';

interface YearlyHeatmapProps {
  year: number;
  stats: Record<string, number>;
}

const YearlyHeatmap: React.FC<YearlyHeatmapProps> = ({ year, stats }) => {
  const startDate = startOfYear(new Date(year, 0, 1));
  const daysInYear = Array.from({ length: 366 }, (_, i) => {
      const day = addDays(startDate, i);
      return day.getFullYear() === year ? day : null;
  }).filter(Boolean) as Date[];

  const maxCount = Math.max(...(Object.values(stats) as number[]), 0);

  const getColor = (count: number) => {
    if (count === 0) return 'bg-gray-200';
    if (maxCount === 0) return 'bg-gray-200';
    const intensity = Math.min(count / (maxCount * 0.8), 1); // Cap intensity to avoid overly dark colors for outliers
    if (intensity < 0.25) return 'bg-green-200';
    if (intensity < 0.5) return 'bg-green-400';
    if (intensity < 0.75) return 'bg-green-600';
    return 'bg-green-800';
  };
  
  const weekDays = ['Dg', 'Dl', 'Dt', 'Dc', 'Dj', 'Dv', 'Ds'];
  const months = Array.from({ length: 12 }, (_, i) => format(new Date(year, i, 1), 'MMM', { locale: ca }));

  // Calculate grid positions
  const dayPositions = daysInYear.map(day => {
      const dayOfWeek = getDay(day); // 0=Sun, 6=Sat
      const weekOfYear = differenceInCalendarWeeks(day, startDate, { weekStartsOn: 0 });
      return {
          gridRow: `${dayOfWeek + 1} / span 1`,
          gridColumn: `${weekOfYear + 1} / span 1`,
      };
  });
  
  return (
    <div className="overflow-x-auto p-1">
        <div className="grid gap-px" style={{ gridTemplateColumns: 'auto repeat(53, 1fr)', gridTemplateRows: 'auto repeat(7, 1fr)', gridAutoFlow: 'column' }}>
           {/* Month Headers */}
           <div style={{ gridColumn: '1', gridRow: '1' }}></div>
           {months.map((month, i) => {
                const monthStartWeek = differenceInCalendarWeeks(new Date(year, i, 1), startDate, { weekStartsOn: 0 });
                return (
                    <div key={month} className="text-xs text-center font-semibold" style={{ gridColumn: `${monthStartWeek + 2} / span 4`, gridRow: '1' }}>
                       {month}
                    </div>
                );
           })}

           {/* Weekday labels */}
            <div className="text-xs text-gray-500 text-right pr-1" style={{gridRow: '2', gridColumn: '1'}}>Dl</div>
            <div className="text-xs text-gray-500 text-right pr-1" style={{gridRow: '4', gridColumn: '1'}}>Dc</div>
            <div className="text-xs text-gray-500 text-right pr-1" style={{gridRow: '6', gridColumn: '1'}}>Dv</div>

            {daysInYear.map((day, i) => {
                const dateString = format(day, 'yyyy-MM-dd');
                const count = stats[dateString] || 0;
                return (
                <div 
                    key={dateString}
                    className={`w-4 h-4 rounded-sm ${getColor(count)}`}
                    style={{ gridRow: `${getDay(day) + 2}`, gridColumn: `${differenceInCalendarWeeks(day, startDate, { weekStartsOn: 1 }) + 2}` }}
                    title={`${format(day, 'd MMM')}: ${count} absències`}
                ></div>
                );
            })}
        </div>
    </div>
  );
};

export default YearlyHeatmap;
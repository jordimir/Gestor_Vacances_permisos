

import React from 'react';
import { UserProfile } from '../../types';

interface UsersBarChartProps {
  stats: Record<string, number>;
  users: UserProfile[];
}

const UsersBarChart: React.FC<UsersBarChartProps> = ({ stats, users }) => {
  const chartData = React.useMemo(() => {
    const userMap = users.reduce((acc, user) => {
      acc[user.id] = user.name;
      return acc;
    }, {} as Record<string, string>);

    return (Object.entries(stats) as [string, number][])
      .map(([userId, count]) => ({
        name: userMap[userId] || 'Desconegut',
        count
      }))
      .sort((a, b) => b.count - a.count);
  }, [stats, users]);
  
  const maxCount = Math.max(...chartData.map(d => d.count), 0);

  if (chartData.length === 0) {
    return <p className="text-center text-gray-500 mt-8">No hi ha dades per mostrar.</p>
  }

  return (
    <div className="w-full h-full overflow-y-auto pr-2">
      <ul className="space-y-3">
        {chartData.map(({ name, count }) => (
          <li key={name} className="flex items-center gap-3 text-sm">
            <span className="w-28 truncate text-gray-600 text-right" title={name}>{name}</span>
            <div className="flex-1 bg-gray-200 rounded-full h-5">
              <div 
                className="bg-blue-500 h-5 rounded-full flex items-center justify-end pr-2 text-white font-bold text-xs"
                style={{ width: maxCount > 0 ? `${(count / maxCount) * 100}%` : '0%' }}
              >
                {count}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UsersBarChart;
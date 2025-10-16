

import React, { useMemo } from 'react';
import { LeaveTypeInfo } from '../../types';

interface TypePieChartProps {
  stats: Record<string, number>;
  leaveTypes: Record<string, LeaveTypeInfo>;
}

const TypePieChart: React.FC<TypePieChartProps> = ({ stats, leaveTypes }) => {
  const chartData = useMemo(() => {
    // FIX: Add explicit types to reducer arguments to handle 'unknown' type inference.
    const total = Object.values(stats).reduce((sum: number, count: number) => sum + count, 0);
    if (total === 0) return { gradient: 'bg-gray-200', legend: [] };

    let cumulativePercentage = 0;
    const gradientParts: string[] = [];
    const legend: { label: string; color: string; value: number, percentage: string }[] = [];

    // FIX: Cast `Object.entries` result to the correct tuple type to resolve downstream type errors.
    const sortedStats = (Object.entries(stats) as [string, number][]).sort((a, b) => b[1] - a[1]);

    sortedStats.forEach(([type, count]) => {
      const info = leaveTypes[type];
      if (!info) return;

      const percentage = (count / total) * 100;
      const colorVar = `var(--color-${info.color.replace('bg-', '')})`;
      
      gradientParts.push(`${colorVar} ${cumulativePercentage}% ${cumulativePercentage + percentage}%`);
      cumulativePercentage += percentage;

      legend.push({
        label: info.label,
        color: info.color,
        value: count,
        percentage: percentage.toFixed(1)
      });
    });

    return {
      gradient: `conic-gradient(${gradientParts.join(', ')})`,
      legend
    };
  }, [stats, leaveTypes]);

  if (chartData.legend.length === 0) {
    return <p className="text-center text-gray-500 mt-8">No hi ha dades per mostrar.</p>
  }

  return (
    <div className="flex flex-col md:flex-row items-center gap-6 h-full">
      <div
        className="w-40 h-40 rounded-full flex-shrink-0"
        style={{ background: chartData.gradient }}
        role="img"
        aria-label="Gràfic de pastís de distribució de permisos"
      ></div>
      <div className="w-full overflow-y-auto">
        <ul className="space-y-2">
          {chartData.legend.map(item => (
            <li key={item.label} className="flex justify-between items-center text-sm">
              <div className="flex items-center">
                <span className={`w-3 h-3 rounded-full mr-2 ${item.color}`}></span>
                <span className="text-gray-600">{item.label}</span>
              </div>
              <span className="font-semibold text-gray-800">{item.value} <span className="text-gray-400 font-normal">({item.percentage}%)</span></span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

// This is a trick to make Tailwind recognize the dynamic color classes
const TailwindColorHack = () => <div className="bg-blue-500 bg-green-500 bg-yellow-500 bg-red-500 bg-purple-500 bg-pink-500 bg-indigo-500 bg-teal-500 bg-gray-500 text-white text-gray-800"></div>

// Define CSS variables for colors to be used in the conic-gradient
const colorVars = {
    '--color-blue-500': '#3b82f6',
    '--color-green-500': '#22c55e',
    '--color-yellow-500': '#eab308',
    '--color-red-500': '#ef4444',
    '--color-purple-500': '#a855f7',
    '--color-pink-500': '#ec4899',
    '--color-indigo-500': '#6366f1',
    '--color-teal-500': '#14b8a6',
    '--color-gray-500': '#6b7280',
};

const StyleInjector: React.FC = () => {
    const css = `:root { ${Object.entries(colorVars).map(([key, val]) => `${key}: ${val};`).join(' ')} }`;
    return <style>{css}</style>;
};

const PieChartWithStyles: React.FC<TypePieChartProps> = (props) => (
    <>
        <StyleInjector />
        <TypePieChart {...props} />
    </>
);

export default PieChartWithStyles;
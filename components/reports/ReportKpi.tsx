
import React from 'react';

interface ReportKpiProps {
  title: string;
  value: string;
  description?: string;
}

const ReportKpi: React.FC<ReportKpiProps> = ({ title, value, description }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
      {description && <p className="text-xs text-gray-400 mt-1">{description}</p>}
    </div>
  );
};

export default ReportKpi;


import React, { useState, useMemo } from 'react';
import { UserProfile, LeaveTypeInfo } from '../types';

interface FilterBarProps {
  allUsers: UserProfile[];
  allLeaveTypes: Record<string, LeaveTypeInfo>;
  filters: { selectedTypes: string[]; selectedUserIds: string[] };
  onFilterChange: (newFilters: { selectedTypes: string[]; selectedUserIds: string[] }) => void;
}

const DropdownMultiSelect: React.FC<{
    label: string;
    options: { value: string; label: string; group?: string }[];
    selected: string[];
    onChange: (selected: string[]) => void;
}> = ({ label, options, selected, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);

    const groupedOptions = useMemo(() => {
        const groups: Record<string, { value: string; label: string; group?: string }[]> = {};
        options.forEach(opt => {
            const groupName = opt.group || 'general';
            if (!groups[groupName]) groups[groupName] = [];
            groups[groupName].push(opt);
        });
        return groups;
    }, [options]);

    const handleSelect = (value: string) => {
        const newSelected = selected.includes(value)
            ? selected.filter(s => s !== value)
            : [...selected, value];
        onChange(newSelected);
    };

    return (
        <div className="relative">
            <button onClick={() => setIsOpen(!isOpen)} className="px-3 py-1.5 text-sm border rounded-md flex items-center gap-2">
                {label} ({selected.length})
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-md shadow-lg z-30 border max-h-80 overflow-y-auto">
                    <div className="p-2">
                         <button onClick={() => onChange([])} className="text-xs text-blue-600 hover:underline mb-2">Netejar selecció</button>
                    </div>
                    {/* FIX: Add explicit types to destructuring assignment from Object.entries to fix type inference issue on `groupOptions`. This resolves error on line 50. */}
                    {Object.entries(groupedOptions).map(([groupName, groupOptions]: [string, { value: string; label: string; group?: string }[]]) => (
                        <div key={groupName}>
                            {groupName !== 'general' && <h4 className="font-bold text-xs uppercase text-gray-500 px-3 pt-2">{groupName}</h4>}
                            {groupOptions.map(option => (
                                <label key={option.value} className="flex items-center px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={selected.includes(option.value)}
                                        onChange={() => handleSelect(option.value)}
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="ml-3 text-gray-700">{option.label}</span>
                                </label>
                            ))}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};


const FilterBar: React.FC<FilterBarProps> = ({ allUsers, allLeaveTypes, filters, onFilterChange }) => {
  // FIX: Add explicit types to destructuring assignment from Object.entries to fix type inference issue on `info`. This resolves error on line 73.
  const leaveTypeOptions = useMemo(() => Object.entries(allLeaveTypes).map(([key, info]: [string, LeaveTypeInfo]) => ({
    value: key,
    label: info.label,
  })), [allLeaveTypes]);

  const userOptions = useMemo(() => allUsers.map(user => ({
    value: user.id,
    label: user.name,
    group: user.department,
  })), [allUsers]);

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-semibold text-gray-600">Filtres:</span>
      <DropdownMultiSelect
        label="Tipus de Permís"
        options={leaveTypeOptions}
        selected={filters.selectedTypes}
        onChange={(selected) => onFilterChange({ ...filters, selectedTypes: selected })}
      />
      <DropdownMultiSelect
        label="Persona / Dept."
        options={userOptions}
        selected={filters.selectedUserIds}
        onChange={(selected) => onFilterChange({ ...filters, selectedUserIds: selected })}
      />
    </div>
  );
};

export default FilterBar;
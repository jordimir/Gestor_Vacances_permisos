import React, { useState } from 'react';
import { LeaveTypeInfo } from '../types';

interface ManageLeaveTypesModalProps {
  leaveTypes: Record<string, LeaveTypeInfo>;
  onSave: (updatedLeaveTypes: Record<string, LeaveTypeInfo>) => void;
  onClose: () => void;
}

const colors = [
  'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500',
  'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500', 'bg-gray-500'
];
const textColors = ['text-white', 'text-gray-800'];

const ManageLeaveTypesModal: React.FC<ManageLeaveTypesModalProps> = ({ leaveTypes, onSave, onClose }) => {
  const [types, setTypes] = useState<Record<string, LeaveTypeInfo>>(JSON.parse(JSON.stringify(leaveTypes)));

  const handleUpdate = (key: string, field: keyof LeaveTypeInfo, value: string | number) => {
    setTypes(prev => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  };

  const handleAdd = () => {
    const newKey = `NOU_TIPUS_${Date.now()}`;
    setTypes(prev => ({
      ...prev,
      [newKey]: { label: 'Nou Tipus', color: 'bg-gray-500', textColor: 'text-white', total: 0 },
    }));
  };

  const handleDelete = (key: string) => {
    if (key === 'VACANCES' || key === 'ASSUMPTES_PROPIS') {
      alert(`No es pot eliminar el tipus de permís '${leaveTypes[key].label}'.`);
      return;
    }
    setTypes(prev => {
        const newTypes = { ...prev };
        delete newTypes[key];
        return newTypes;
    });
  };

  const isCalculatedType = (key: string) => key === 'VACANCES' || key === 'ASSUMPTES_PROPIS';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <header className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">Gestionar Tipus de Permís</h2>
          <button onClick={onClose} className="px-3 py-1 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">&times;</button>
        </header>
        <main className="p-6 overflow-auto space-y-4">
          <div className="grid grid-cols-12 gap-3 font-semibold text-sm text-gray-600 px-2">
            <span className="col-span-3">Etiqueta</span>
            <span className="col-span-2">Dies Totals</span>
            <span className="col-span-3">Color Fons</span>
            <span className="col-span-2">Color Text</span>
            <span className="col-span-1">Vista</span>
            <span className="col-span-1"></span>
          </div>
          
          {Object.entries(types).map(([key, info]: [string, LeaveTypeInfo]) => (
            <div key={key} className="grid grid-cols-12 gap-3 items-center p-2 border rounded-md">
              <input value={info.label} onChange={e => handleUpdate(key, 'label', e.target.value)} className="col-span-3 border p-1 rounded-md" />
              <input 
                type="number" 
                value={info.total} 
                onChange={e => handleUpdate(key, 'total', parseInt(e.target.value, 10) || 0)} 
                className="col-span-2 border p-1 rounded-md"
                title={isCalculatedType(key) ? 'Valor inicial calculat per antiguitat. Es pot ajustar manualment.' : ''}
              />
              <select value={info.color} onChange={e => handleUpdate(key, 'color', e.target.value)} className="col-span-3 border p-1 rounded-md">
                {colors.map(c => <option key={c} value={c}>{c.replace('bg-', '')}</option>)}
              </select>
              <select value={info.textColor} onChange={e => handleUpdate(key, 'textColor', e.target.value)} className="col-span-2 border p-1 rounded-md">
                {textColors.map(c => <option key={c} value={c}>{c.replace('text-','')}</option>)}
              </select>
              <div className={`col-span-1 p-1 rounded-md text-center text-xs font-bold ${info.color} ${info.textColor}`}>Test</div>
              <button onClick={() => handleDelete(key)} className="col-span-1 text-red-500 hover:text-red-700 font-bold text-lg">&times;</button>
            </div>
          ))}
          <button onClick={handleAdd} className="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 mt-4">+ Afegir nou tipus</button>
        </main>
        <footer className="p-4 border-t flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">Cancel·lar</button>
          <button onClick={() => onSave(types)} className="px-4 py-2 bg-green-600 text-white rounded-md">Desar Canvis</button>
        </footer>
      </div>
    </div>
  );
};

export default ManageLeaveTypesModal;
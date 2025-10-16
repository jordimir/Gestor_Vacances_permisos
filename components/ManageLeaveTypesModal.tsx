import React, { useState, useEffect } from 'react';
import { LeaveTypeInfo, LeaveDay } from '../types';

interface ManageLeaveTypesModalProps {
  leaveTypes: Record<string, LeaveTypeInfo>;
  setLeaveTypes: (newTypes: Record<string, LeaveTypeInfo>) => void;
  leaveDays: Record<string, LeaveDay>;
  onClose: () => void;
}

const COLORS = [
  { bg: 'bg-blue-500', text: 'text-white' },
  { bg: 'bg-green-500', text: 'text-white' },
  { bg: 'bg-yellow-500', text: 'text-gray-800' },
  { bg: 'bg-red-500', text: 'text-white' },
  { bg: 'bg-purple-500', text: 'text-white' },
  { bg: 'bg-pink-500', text: 'text-white' },
  { bg: 'bg-indigo-500', text: 'text-white' },
  { bg: 'bg-teal-500', text: 'text-white' },
  { bg: 'bg-gray-500', text: 'text-white' },
];

const ManageLeaveTypesModal: React.FC<ManageLeaveTypesModalProps> = ({ leaveTypes, setLeaveTypes, leaveDays, onClose }) => {
  const [label, setLabel] = useState('');
  const [total, setTotal] = useState<number | string>(0);
  const [color, setColor] = useState(COLORS[0].bg);
  const [textColor, setTextColor] = useState(COLORS[0].text);
  const [editingKey, setEditingKey] = useState<string | null>(null);

  useEffect(() => {
    if (editingKey && leaveTypes[editingKey]) {
      const { label, color, textColor, total } = leaveTypes[editingKey];
      setLabel(label);
      setColor(color);
      setTextColor(textColor);
      setTotal(total);
    }
  }, [editingKey, leaveTypes]);

  const resetForm = () => {
    setLabel('');
    setTotal(0);
    setColor(COLORS[0].bg);
    setTextColor(COLORS[0].text);
    setEditingKey(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label) return;

    const totalAsNumber = typeof total === 'string' ? parseInt(total, 10) : total;
    if (isNaN(totalAsNumber) || totalAsNumber < 0) {
      alert("El nombre total de dies ha de ser un número positiu.");
      return;
    }

    const newInfo = { label, color, textColor, total: totalAsNumber };

    if (editingKey) {
      // Update
      setLeaveTypes({
        ...leaveTypes,
        [editingKey]: newInfo,
      });
    } else {
      // Add new
      const newKey = label.toUpperCase().replace(/\s+/g, '_');
      if (leaveTypes[newKey]) {
        alert('Ja existeix un tipus de permís amb un nom similar.');
        return;
      }
      setLeaveTypes({
        ...leaveTypes,
        [newKey]: newInfo,
      });
    }
    resetForm();
  };
  
  const isTypeInUse = (typeKey: string) => {
    return Object.values(leaveDays).some((day: LeaveDay) => day.type === typeKey);
  }

  const handleDelete = (typeKey: string) => {
    if (isTypeInUse(typeKey)) {
        alert("No es pot eliminar aquest tipus de permís perquè està sent utilitzat al calendari.");
        return;
    }
    if (window.confirm(`Segur que vols eliminar el tipus de permís "${leaveTypes[typeKey].label}"?`)) {
      const { [typeKey]: _, ...newTypes } = leaveTypes;
      setLeaveTypes(newTypes);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <header className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">Gestionar Tipus de Permís</h2>
          <button onClick={onClose} className="px-3 py-1 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">&times;</button>
        </header>
        
        <main className="p-6 overflow-auto">
          <form onSubmit={handleSubmit} className="mb-6 pb-6 border-b">
            <h3 className="font-semibold text-lg mb-3">{editingKey ? 'Editar Tipus' : 'Afegir Nou Tipus'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="mb-4">
                <label htmlFor="type-label" className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <input
                  id="type-label"
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: Vacances"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="type-total" className="block text-sm font-medium text-gray-700 mb-1">Total Dies Anuals</label>
                <input
                  id="type-total"
                  type="number"
                  min="0"
                  value={total}
                  onChange={(e) => setTotal(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map(({ bg, text }) => (
                  <button
                    key={bg}
                    type="button"
                    onClick={() => { setColor(bg); setTextColor(text); }}
                    className={`w-8 h-8 rounded-full ${bg} transition-transform transform hover:scale-110 ${color === bg ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
                    aria-label={`Color ${bg}`}
                  />
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              {editingKey && <button type="button" onClick={resetForm} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel·lar Edició</button>}
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                {editingKey ? 'Guardar Canvis' : 'Afegir Tipus'}
              </button>
            </div>
          </form>

          <div className="space-y-3">
            {Object.keys(leaveTypes).map((key) => {
              const info = leaveTypes[key];
              return (
                <div key={key} className="flex items-center justify-between p-2 rounded-md bg-gray-50 border">
                  <div className="flex items-center">
                    <span className={`w-4 h-4 rounded-full mr-3 ${info.color}`} />
                    <div>
                        <span className="font-medium text-gray-800">{info.label}</span>
                        <span className="text-xs text-gray-500 ml-2">({info.total} dies)</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setEditingKey(key)} className="text-sm text-blue-600 hover:underline">Editar</button>
                    <button 
                      onClick={() => handleDelete(key)} 
                      className={`text-sm ${isTypeInUse(key) ? 'text-gray-400 cursor-not-allowed' : 'text-red-600 hover:underline'}`}
                      disabled={isTypeInUse(key)}
                      title={isTypeInUse(key) ? "No es pot eliminar un tipus en ús" : ""}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ManageLeaveTypesModal;

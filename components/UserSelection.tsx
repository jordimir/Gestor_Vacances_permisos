import React, { useState } from 'react';
import { UserProfile } from '../types';

interface UserSelectionProps {
  users: UserProfile[];
  setUsers: (users: UserProfile[]) => void;
  onUserSelect: (user: UserProfile) => void;
}

const UserSelection: React.FC<UserSelectionProps> = ({ users, setUsers, onUserSelect }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [dni, setDni] = useState('');
  const [department, setDepartment] = useState('');

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && dni && department) {
      const newUser: UserProfile = {
        id: `user-${Date.now()}`,
        name: name.trim(),
        dni: dni.trim().toUpperCase(),
        department: department.trim()
      };
      const updatedUsers = [...users, newUser];
      setUsers(updatedUsers);
      onUserSelect(newUser);
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm("Segur que vols eliminar aquest usuari i totes les seves dades? Aquesta acció no es pot desfer.")) {
        const updatedUsers = users.filter(user => user.id !== userId);
        setUsers(updatedUsers);
        // Also remove user-specific data from localStorage
        localStorage.removeItem(`leaveDays-${userId}`);
        localStorage.removeItem(`leaveTypes-${userId}`);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Selecciona o Crea un Perfil</h1>
        
        <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
            {users.length > 0 ? users.map(user => (
                <div key={user.id} className="group flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <button onClick={() => onUserSelect(user)} className="flex-1 text-left">
                        <p className="font-semibold text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.department}</p>
                    </button>
                    <button onClick={() => handleDeleteUser(user.id)} className="ml-4 p-2 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                </div>
            )) : <p className="text-center text-gray-500">No hi ha perfils. Crea'n un per començar.</p>}
        </div>

        {isCreating ? (
          <form onSubmit={handleCreateUser} className="space-y-4">
            <input type="text" placeholder="Nom i Cognoms" value={name} onChange={e => setName(e.target.value)} required className="w-full px-4 py-2 border rounded-md" />
            <input type="text" placeholder="DNI" value={dni} onChange={e => setDni(e.target.value)} required className="w-full px-4 py-2 border rounded-md" />
            <input type="text" placeholder="Departament" value={department} onChange={e => setDepartment(e.target.value)} required className="w-full px-4 py-2 border rounded-md" />
            <div className="flex gap-2">
              <button type="button" onClick={() => setIsCreating(false)} className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel·lar</button>
              <button type="submit" className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Crear Perfil</button>
            </div>
          </form>
        ) : (
          <button onClick={() => setIsCreating(true)} className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
            + Crear Nou Perfil
          </button>
        )}
      </div>
    </div>
  );
};

export default UserSelection;

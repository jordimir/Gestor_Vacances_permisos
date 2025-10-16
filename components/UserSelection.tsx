import React, { useState } from 'react';
import { UserProfile } from '../types';

interface UserSelectionProps {
  users: UserProfile[];
  setUsers: React.Dispatch<React.SetStateAction<UserProfile[]>>;
  onUserSelect: (userId: string) => void;
}

const UserSelection: React.FC<UserSelectionProps> = ({ users, setUsers, onUserSelect }) => {
  const [newUser, setNewUser] = useState({ name: '', dni: '', department: '', hireDate: '' });
  const [error, setError] = useState('');

  const handleCreateUser = () => {
    if (!newUser.name || !newUser.dni || !newUser.department || !newUser.hireDate) {
      setError('Tots els camps són obligatoris.');
      return;
    }
    const newProfile: UserProfile = {
      id: `user-${Date.now()}`,
      ...newUser,
    };
    const updatedUsers = [...users, newProfile];
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    setNewUser({ name: '', dni: '', department: '', hireDate: '' });
    setError('');
    onUserSelect(newProfile.id);
  };

  const handleDeleteUser = (userId: string) => {
      const updatedUsers = users.filter(u => u.id !== userId);
      setUsers(updatedUsers);
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      localStorage.removeItem(`userData_${userId}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl p-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-center text-gray-800">Gestor de Vacances i Permisos</h1>
          <p className="text-center text-gray-500 mt-2">Selecciona un perfil o crea'n un de nou per començar.</p>
        </div>

        {/* User List */}
        <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-700 border-b pb-2">Selecciona un Perfil</h2>
            {users.length > 0 ? (
                <ul className="max-h-60 overflow-y-auto space-y-2 pr-2">
                    {users.map(user => (
                        <li key={user.id} className="flex items-center justify-between p-3 bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors">
                            <button onClick={() => onUserSelect(user.id)} className="text-left flex-1">
                                <p className="font-bold text-blue-700">{user.name}</p>
                                <p className="text-sm text-gray-500">{user.department} - DNI: {user.dni}</p>
                            </button>
                            <button onClick={() => handleDeleteUser(user.id)} className="ml-4 text-red-500 hover:text-red-700 font-bold text-xl px-2">&times;</button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-center text-gray-500 p-4 bg-gray-50 rounded-md">No hi ha perfils. Crea el primer per començar.</p>
            )}
        </div>

        {/* New User Form */}
        <div className="space-y-4 pt-6 border-t">
          <h2 className="text-xl font-semibold text-gray-700">Crear Nou Perfil</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Nom i Cognoms"
              value={newUser.name}
              onChange={e => setNewUser({ ...newUser, name: e.target.value })}
              className="p-2 border rounded-md"
            />
            <input
              type="text"
              placeholder="DNI"
              value={newUser.dni}
              onChange={e => setNewUser({ ...newUser, dni: e.target.value })}
              className="p-2 border rounded-md"
            />
            <input
              type="text"
              placeholder="Departament"
              value={newUser.department}
              onChange={e => setNewUser({ ...newUser, department: e.target.value })}
              className="p-2 border rounded-md"
            />
            <div>
                <label className="block text-sm font-medium text-gray-500">Data d'Antiguitat</label>
                <input
                  type="date"
                  value={newUser.hireDate}
                  onChange={e => setNewUser({ ...newUser, hireDate: e.target.value })}
                  className="p-2 border rounded-md w-full"
                />
            </div>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            onClick={handleCreateUser}
            className="w-full py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors"
          >
            Crear i Entrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserSelection;


import React, { useState } from 'react';
import { useAuth } from '../App';
import { dataService } from '../services/dataService';
import { Role } from '../types';

const Login: React.FC = () => {
  const { login } = useAuth();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>(Role.Student);
  const [grade, setGrade] = useState<number>(11);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('El nombre no puede estar vacío.');
      return;
    }
    setError('');
    // Password is for UI simulation only, not used in login logic
    const user = dataService.login(name, role, role === Role.Student ? grade : undefined);
    login(user);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-brand-gray dark:bg-gray-900 p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
        <div className="text-center">
          <i className="fas fa-school text-5xl text-brand-blue dark:text-white"></i>
          <h1 className="mt-4 text-3xl font-bold text-brand-blue dark:text-white">INMODOSA</h1>
          <p className="text-gray-600 dark:text-gray-400">Instituto Moderno Domingo Savio</p>
        </div>
        <form className="space-y-6" onSubmit={handleLogin}>
          <div>
            <label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">Nombre Completo</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-blue focus:border-brand-blue"
              placeholder="p. ej., Alice"
              required
            />
          </div>
           <div>
            <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-blue focus:border-brand-blue"
              placeholder="••••••••"
            />
             <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Campo simulado. No se requiere contraseña.</p>
          </div>
          <div>
            <label htmlFor="role" className="text-sm font-medium text-gray-700 dark:text-gray-300">Rol</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="mt-1 block w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue"
            >
              <option value={Role.Student}>Alumno</option>
              <option value={Role.Teacher}>Docente</option>
              <option value={Role.Director}>Director</option>
            </select>
          </div>
          {role === Role.Student && (
            <div>
              <label htmlFor="grade" className="text-sm font-medium text-gray-700 dark:text-gray-300">Grado</label>
              <select
                id="grade"
                value={grade}
                onChange={(e) => setGrade(parseInt(e.target.value))}
                className="mt-1 block w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue"
              >
                {Array.from({ length: 6 }, (_, i) => 6 + i).map(g => (
                  <option key={g} value={g}>{g}° Grado</option>
                ))}
              </select>
            </div>
          )}
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div>
            <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-blue hover:bg-brand-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue transition-colors">
              Ingresar a la Plataforma
            </button>
          </div>
        </form>
      </div>
      <footer className="w-full max-w-md mt-6 text-center text-xs text-gray-500 dark:text-gray-400 space-y-2">
        <p className="flex items-center justify-center"><i className="fas fa-map-marker-alt mr-2"></i>Orihueca, Magdalena, Colombia</p>
        <p className="flex items-center justify-center"><i className="fas fa-envelope mr-2"></i>INMODOSA@GMAIL.COM</p>
        <p className="flex items-center justify-center"><i className="fab fa-whatsapp mr-2"></i>+57 321 814 0296</p>
      </footer>
    </div>
  );
};

export default Login;

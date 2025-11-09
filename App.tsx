
import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { User } from './types';
import { dataService } from './services/dataService';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

// --- Auth Context ---
interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}
const AuthContext = createContext<AuthContextType>(null!);
export const useAuth = () => useContext(AuthContext);

// --- Theme Context ---
interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}
const ThemeContext = createContext<ThemeContextType>(null!);
export const useTheme = () => useContext(ThemeContext);

// --- Toast Context ---
type ToastMessage = { id: number; message: string; type: 'success' | 'error' };
interface ToastContextType {
  toasts: ToastMessage[];
  addToast: (message: string, type: 'success' | 'error') => void;
}
const ToastContext = createContext<ToastContextType>(null!);
export const useToast = () => useContext(ToastContext);


// Fix: Changed to a named export to resolve circular dependency issue.
export const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(dataService.getLoggedInUser());
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('inmodosa_theme') as 'light' | 'dark') || 'light';
  });
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('inmodosa_theme', theme);
  }, [theme]);

  const login = (user: User) => setUser(user);
  
  const logout = () => {
    dataService.logout();
    setUser(null);
  };

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const addToast = useCallback((message: string, type: 'success' | 'error') => {
    const id = Date.now();
    setToasts(prevToasts => [...prevToasts, { id, message, type }]);
    setTimeout(() => {
      setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
    }, 3000);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <ThemeContext.Provider value={{ theme, toggleTheme }}>
        <ToastContext.Provider value={{ toasts, addToast }}>
          <div className="bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 min-h-screen">
            {user ? <Dashboard /> : <Login />}
          </div>
        </ToastContext.Provider>
      </ThemeContext.Provider>
    </AuthContext.Provider>
  );
};

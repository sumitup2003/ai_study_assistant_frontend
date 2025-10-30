import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
useEffect(() => {
// Check if user is logged in
const token = localStorage.getItem('token');
const savedUser = localStorage.getItem('user');
if (token && savedUser) {
  setUser(JSON.parse(savedUser));
  loadUserData();
}
setLoading(false);
}, []);
const loadUserData = async () => {
try {
const { data } = await api.get('/auth/me');
setUser(data.user);
localStorage.setItem('user', JSON.stringify(data.user));
} catch (error) {
console.error('Failed to load user data:', error);
logout();
}
};
const login = async (email, password) => {
try {
const { data } = await api.post('/auth/login', { email, password });
localStorage.setItem('token', data.token);
localStorage.setItem('user', JSON.stringify(data.user));
setUser(data.user);
toast.success('Welcome back!');
return data;
} catch (error) {
const message = error.response?.data?.message || 'Login failed';
toast.error(message);
throw error;
}
};
const register = async (name, email, password) => {
try {
const { data } = await api.post('/auth/register', { name, email, password });
localStorage.setItem('token', data.token);
localStorage.setItem('user', JSON.stringify(data.user));
setUser(data.user);
toast.success('Account created successfully!');
return data;
} catch (error) {
const message = error.response?.data?.message || 'Registration failed';
toast.error(message);
throw error;
}
};
const logout = () => {
localStorage.removeItem('token');
localStorage.removeItem('user');
setUser(null);
toast.success('Logged out successfully');
};
const updateUser = (userData) => {
setUser(userData);
localStorage.setItem('user', JSON.stringify(userData));
};
const value = {
user,
loading,
login,
register,
logout,
updateUser,
isAuthenticated: !!user
};
return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
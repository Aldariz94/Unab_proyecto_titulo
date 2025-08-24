import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false); // Estado para la vista de login

  const setupUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
          try {
              const decoded = jwtDecode(token);
              if (decoded.exp * 1000 > Date.now()) {
                  api.defaults.headers.common['x-auth-token'] = token;
                  const res = await api.get('/users/me');
                  setUser(res.data);
              } else {
                  localStorage.removeItem('token');
                  setUser(null);
              }
          } catch (error) {
              console.error("Error al configurar el usuario:", error);
              localStorage.removeItem('token');
              setUser(null);
          }
      }
      setLoading(false);
  };

  useEffect(() => {
    setupUser();
  }, []);

  const login = async (correo, password) => {
    try {
      const response = await api.post('/auth/login', { correo, password });
      const { token } = response.data;
      localStorage.setItem('token', token);
      await setupUser();
      setShowLogin(false); // Ocultar el login después de un inicio de sesión exitoso
      return true;
    } catch (error) {
      console.error('Error en el inicio de sesión:', error.response?.data?.msg || 'Error de red');
      throw new Error(error.response?.data?.msg || 'Error al iniciar sesión');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['x-auth-token'];
    setUser(null);
    setShowLogin(false); // Asegurarse de que no se muestre el login al cerrar sesión
  };

  if (loading) {
    return (
        <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
            <div className="text-xl text-gray-800 dark:text-gray-200">Cargando...</div>
        </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, showLogin, setShowLogin }}>
      {children}
    </AuthContext.Provider>
  );
};
/*
 * ----------------------------------------------------------------
 * Configuración central de Axios para las llamadas a la API.
 * ----------------------------------------------------------------
 */
import axios from 'axios';

const api = axios.create({
  // proveerá la variable de entorno para producción, y usará la de localhost para desarrollo.
  //baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  baseURL: process.env.REACT_APP_API_URL || '/api',
});

// Interceptor para añadir el token a todas las peticiones protegidas
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;


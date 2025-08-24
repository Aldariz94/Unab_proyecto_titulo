/*
 * ----------------------------------------------------------------
 * Punto de entrada de la aplicación React.
 * ----------------------------------------------------------------
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// Opcional: importa un archivo de CSS para estilos globales
 import './index.css'; 

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
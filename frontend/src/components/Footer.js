// frontend/src/components/Footer.js
import React from 'react';

const Footer = () => {
  // Obtenemos el año actual dinámicamente
  const currentYear = new Date().getFullYear();
  
  // Versión de la aplicación (explicación abajo)
  /**
 * Versionado Semántico (SemVer) - Formato: MAYOR.MENOR.PARCHE
 * - MAYOR: Se incrementa para cambios incompatibles que rompen la API.
 * - MENOR: Se incrementa al añadir nueva funcionalidad de forma retrocompatible.
 * - PARCHE: Se incrementa para correcciones de bugs de forma retrocompatible.
 */
  const appVersion = "1.0.0";

  return (
    <footer className="bg-white dark:bg-zinc-800 border-t border-gray-200 dark:border-zinc-700 mt-auto py-4">
      <div className="container mx-auto px-6 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex flex-col sm:flex-row justify-between items-center text-center">
          
          {/* Columna Izquierda: Copyright */}
          <p className="mb-2 sm:mb-0">
              &copy; {currentYear} Biblioteca Escolar, por Daniel Carreño.
          </p>
          
          {/* Columna Central: Nombre del Colegio */}
          <p className="mb-2 sm:mb-0 font-semibold">
            Colegio Inmaculada de Lourdes
          </p>
          
          {/* Columna Derecha: Versión */}
          <p>
            Versión {appVersion}
          </p>

        </div>
      </div>
    </footer>
  );
};

export default Footer;
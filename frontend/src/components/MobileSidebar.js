import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid'; // Usamos el ícono sólido para mejor visibilidad

const MobileSidebar = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
        // Contenedor principal que ocupa toda la pantalla
        <div className="fixed inset-0 z-50 flex" aria-modal="true" role="dialog">
            {/* Fondo oscuro semitransparente */}
            <div 
                className="absolute inset-0 bg-black bg-opacity-50" 
                onClick={onClose}
                aria-hidden="true"
            ></div>
            
            {/* Contenido del Sidebar (el menú en sí) */}
            <div className="relative h-full">
                {children}
            </div>

            {/* --- INICIO DE LA MODIFICACIÓN --- */}
            {/* Botón de cierre posicionado en la esquina superior derecha de la pantalla */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white rounded-full p-1 hover:bg-white/20 transition-colors"
                aria-label="Cerrar menú"
            >
                <XMarkIcon className="w-8 h-8" />
            </button>
            {/* --- FIN DE LA MODIFICACIÓN --- */}
        </div>
    );
};

export default MobileSidebar;
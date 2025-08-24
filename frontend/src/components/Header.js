import React from 'react';
import { useTheme } from '../context';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

const Header = ({ onLoginClick }) => {
    const { theme, toggleTheme } = useTheme();

    return (
        <header className="bg-white shadow-md dark:bg-zinc-800">
            <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                    Biblioteca Escolar - Catálogo
                </h1>
                <div className="flex items-center gap-4">
                    <button 
                        onClick={toggleTheme} 
                        // Se eliminó la clase w-full de la siguiente línea
                        className="flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-800 dark:text-white bg-gray-200 dark:bg-zinc-700 rounded-md hover:bg-gray-300 dark:hover:bg-zinc-600 transition-colors duration-300"
                    >
                        {theme === 'light' ? <MoonIcon className="w-5 h-5 mr-2" /> : <SunIcon className="w-5 h-5 mr-2" />}
                        Modo {theme === 'light' ? 'Oscuro' : 'Claro'}
                    </button>
                    
                    <button 
                        onClick={onLoginClick} 
                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                    >
                        Iniciar Sesión
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
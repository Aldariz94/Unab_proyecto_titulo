import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import { 
    BookOpenIcon,
    CubeIcon,
    ClipboardDocumentCheckIcon,
    InboxArrowDownIcon,
    DocumentChartBarIcon,
    ArrowLeftStartOnRectangleIcon,
    SunIcon,
    MoonIcon,
} from '@heroicons/react/24/outline';

const UserSidebar = ({ onNavigate, currentPage, onCloseRequest }) => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();

    // --- INICIO DE LA MODIFICACIÓN ---

    // 1. Definimos TODOS los posibles elementos de navegación con los roles que pueden verlos.
    const allNavItems = [
        { key: 'catalog-books', label: 'Catálogo de Libros', icon: BookOpenIcon, roles: ['profesor', 'alumno', 'personal'] },
        { key: 'catalog-resources', label: 'Catálogo de Recursos', icon: CubeIcon, roles: ['profesor', 'personal'] },
        { key: 'my-loans', label: 'Mis Préstamos', icon: ClipboardDocumentCheckIcon, roles: ['profesor', 'alumno', 'personal'] },
        { key: 'my-reservations', label: 'Mis Reservas', icon: InboxArrowDownIcon, roles: ['profesor', 'alumno', 'personal'] },
        { key: 'reports', label: 'Reportes', icon: DocumentChartBarIcon, roles: ['profesor'] }, // Solo los profesores (y admins, que usan otra barra)
    ];

    // 2. Filtramos la lista basándonos en el rol del usuario actual.
    const navItems = allNavItems.filter(item => user && item.roles.includes(user.rol));

    // --- FIN DE LA MODIFICACIÓN ---

    const getInitials = (name, lastName) => {
        if (!name || !lastName) return '..';
        return `${name.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    };

    return (
        <div className="sticky top-0 self-start flex flex-col w-64 h-dvh px-4 py-8 bg-white border-r dark:bg-zinc-800 dark:border-zinc-700 overflow-y-auto">
            <div className="flex justify-between items-center">
            <h2 className="text-3xl font-semibold text-center text-gray-800 dark:text-white">Biblioteca Escolar</h2>
            </div>
            
            <div className="flex flex-col items-center mt-6 -mx-2">
                <div className="w-[36px] h-[36px] mx-2 bg-indigo-500 rounded-full flex items-center justify-center">
                    <span className="text-[21px] font-bold text-white">
                        {getInitials(user?.primerNombre, user?.primerApellido)}
                    </span>
                </div>
                <h4 className="mx-2 mt-2 font-medium text-gray-800 dark:text-gray-200 capitalize">{user ? `${user.primerNombre} ${user.primerApellido}` : 'Cargando...'}</h4>
                <p className="mx-2 mt-1 text-sm font-medium text-gray-600 dark:text-gray-400">{user ? user.correo : ''}</p>
            </div>
            <nav className="flex-grow mt-6 overflow-y-auto pr-2">
                {navItems.map((item) => {
                    const IconComponent = item.icon;
                    return (
<button
  key={item.key}
  type="button"
  className={`flex items-center w-full px-4 py-2 mt-2 text-gray-600 transition-colors duration-300 transform rounded-md dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-700 dark:hover:text-zinc-200 hover:text-gray-700 ${
    currentPage === item.key ? 'bg-gray-200 dark:bg-zinc-700 text-gray-800 dark:text-zinc-200' : ''
  }`}
  onClick={() => onNavigate(item.key)}
>
                            <IconComponent className="w-5 h-5" />
                            <span className="mx-4 font-medium">{item.label}</span>
                        </button>
                    )
                })}
            </nav>
            <div className="mt-auto">
                <button onClick={toggleTheme} className="flex items-center justify-center w-full px-4 py-2 mb-2 text-sm font-medium text-gray-800 dark:text-white bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-300">
                    {theme === 'light' ? <MoonIcon className="w-5 h-5 mr-2" /> : <SunIcon className="w-5 h-5 mr-2" />}
                    Modo {theme === 'light' ? 'Oscuro' : 'Claro'}
                </button>
                <button onClick={logout} className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors duration-300">
                    <ArrowLeftStartOnRectangleIcon className="w-5 h-5 mr-2" />
                    Cerrar Sesión
                </button>
            </div>
        </div>
    );
};

export default UserSidebar;
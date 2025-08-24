// frontend/src/components/CreateLoanForm.js

import React, { useState } from 'react';
import api from '../services/api';
import { useNotification } from '../hooks'; // 1. Importar el hook

const CreateLoanForm = ({ onSubmit, onCancel }) => {
    const [userSearch, setUserSearch] = useState('');
    const [userResults, setUserResults] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);

    const [itemSearch, setItemSearch] = useState('');
    const [itemResults, setItemResults] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    
    const { showNotification } = useNotification(); // 2. Instanciar el hook

    const handleUserSearch = async (e) => {
        const query = e.target.value;
        setUserSearch(query);
        setSelectedUser(null);
        if (query.length > 2) {
            const res = await api.get(`/search/users?q=${query}`);
            setUserResults(res.data);
        } else {
            setUserResults([]);
        }
    };

    const handleItemSearch = async (e) => {
        const query = e.target.value;
        setItemSearch(query);
        setSelectedItem(null);
        if (query.length > 2) {
            const res = await api.get(`/search/items?q=${query}`);
            setItemResults(res.data);
        } else {
            setItemResults([]);
        }
    };

    const selectUser = (user) => {
        setSelectedUser(user);
        setUserSearch(`${user.primerNombre} ${user.primerApellido} (${user.rut})`);
        setUserResults([]);
    };

    const selectItem = (item) => {
        setSelectedItem(item);
        setItemSearch(item.name);
        setItemResults([]);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedUser || !selectedItem) {
            // 3. Reemplazar alert() con showNotification
            showNotification('Por favor, selecciona un usuario y un ítem válidos.', 'error');
            return;
        }
        onSubmit({
            usuarioId: selectedUser._id,
            itemId: selectedItem._id,
            itemModel: selectedItem.type,
        });
    };

    const inputClass = "w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white";
    const labelClass = "block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300";

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
                <label className={labelClass}>1. Buscar Usuario (por nombre o RUT)</label>
                <input type="text" value={userSearch} onChange={handleUserSearch} placeholder="Escribe para buscar..." className={inputClass} />
                {userResults.length > 0 && (
                    <ul className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg dark:bg-gray-800 dark:border-gray-600 max-h-40 overflow-y-auto">
                        {userResults.map(user => (
                            <li key={user._id} onClick={() => selectUser(user)} className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white">
                                {user.primerNombre} {user.primerApellido} - {user.rut}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="relative">
                <label className={labelClass}>2. Buscar Ítem Disponible (por título o nombre)</label>
                <input type="text" value={itemSearch} onChange={handleItemSearch} placeholder="Escribe para buscar..." className={inputClass} disabled={!selectedUser} />
                {itemResults.length > 0 && (
                    <ul className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg dark:bg-gray-800 dark:border-gray-600 max-h-40 overflow-y-auto">
                        {itemResults.map(item => (
                            <li key={item._id} onClick={() => selectItem(item)} className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white">
                                {item.name}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="flex justify-end pt-4 space-x-2">
                <button type="button" onClick={onCancel} className="px-4 py-2 font-medium text-gray-600 bg-gray-200 rounded-md dark:bg-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500">
                    Cancelar
                </button>
                <button type="submit" className="px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-300" disabled={!selectedUser || !selectedItem}>
                    Confirmar Préstamo
                </button>
            </div>
        </form>
    );
};

export default CreateLoanForm;
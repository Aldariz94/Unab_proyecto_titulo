import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import { Modal, UserForm, UserDetails, ImportComponent, Notification } from '../components';
import { ArrowUpTrayIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useNotification } from '../hooks';

const UserManagementPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [viewingUser, setViewingUser] = useState(null);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const { notification, showNotification } = useNotification();

    // Estados para búsqueda y paginación
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    // Estado para el modal de eliminación
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingUser, setDeletingUser] = useState(null);

    const fetchUsers = useCallback(async (page, search) => {
        try {
            setLoading(true);
            const params = new URLSearchParams({ page, limit: 10 });
            if (search) {
                params.append('search', search);
            }
            const response = await api.get(`/users?${params.toString()}`);
            setUsers(response.data.docs);
            setTotalPages(response.data.totalPages);
            setCurrentPage(response.data.page);
        } catch (err) {
            showNotification('No se pudo cargar la lista de usuarios.', 'error');
        } finally {
            setLoading(false);
        }
    }, [showNotification]);

    // Efecto para el "debounce" de la búsqueda
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm !== debouncedSearchTerm) {
                setCurrentPage(1);
                setDebouncedSearchTerm(searchTerm);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm, debouncedSearchTerm]);

    // Efecto para llamar a la API cuando cambia la página o la búsqueda
    useEffect(() => {
        fetchUsers(currentPage, debouncedSearchTerm);
    }, [currentPage, debouncedSearchTerm, fetchUsers]);

    const handleOpenCreateModal = () => {
        setEditingUser(null);
        setIsFormModalOpen(true);
    };

    const handleOpenEditModal = (user) => {
        setEditingUser(user);
        setIsFormModalOpen(true);
    };
    
    const handleOpenViewModal = (user) => {
        setViewingUser(user);
        setIsViewModalOpen(true);
    };

    const handleCloseModals = () => {
        setIsFormModalOpen(false);
        setIsViewModalOpen(false);
        setIsDeleteModalOpen(false);
        setEditingUser(null);
        setViewingUser(null);
        setDeletingUser(null);
    };

    const handleSubmit = async (userData) => {
        try {
            if (editingUser) {
                await api.put(`/users/${editingUser._id}`, userData);
                showNotification('Usuario actualizado exitosamente.');
            } else {
                await api.post('/users', userData);
                showNotification('Usuario creado exitosamente.');
            }
            handleCloseModals();
            fetchUsers(currentPage, debouncedSearchTerm);
        } catch (err) {
            showNotification(err.response?.data?.msg || 'Error al guardar el usuario.', 'error');
        }
    };

    const handleDeleteClick = (user) => {
        setDeletingUser(user);
        setIsDeleteModalOpen(true);
    };

    const executeDelete = async () => {
        if (!deletingUser) return;
        try {
            await api.delete(`/users/${deletingUser._id}`);
            showNotification('Usuario eliminado exitosamente.');
            if (users.length === 1 && currentPage > 1) {
                fetchUsers(currentPage - 1, debouncedSearchTerm);
            } else {
                fetchUsers(currentPage, debouncedSearchTerm);
            }
        } catch (err) {
            showNotification(err.response?.data?.msg || 'Error al eliminar el usuario.', 'error');
        } finally {
            handleCloseModals();
        }
    };
    
return (
        <div>
            <Notification {...notification} />
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Gestión de Usuarios</h1>
                <div className="flex items-center gap-4">
                    <input type="text" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full md:w-64 px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                    <button onClick={() => setIsImportModalOpen(true)} className="flex items-center px-4 py-2 font-medium text-white bg-green-600 rounded-md hover:bg-green-700 whitespace-nowrap">
                        <ArrowUpTrayIcon className="w-5 h-5 mr-2" />
                        Importar
                    </button>
                    <button onClick={handleOpenCreateModal} className="flex items-center px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 whitespace-nowrap">
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Crear Usuario
                    </button>
                </div>
            </div>

            <Modal isOpen={isFormModalOpen} onClose={handleCloseModals} title={editingUser ? "Editar Usuario" : "Crear Nuevo Usuario"}>
                <UserForm onSubmit={handleSubmit} onCancel={handleCloseModals} initialData={editingUser} />
            </Modal>
            
            <Modal isOpen={isViewModalOpen} onClose={handleCloseModals} title="Detalles del Usuario">
                <UserDetails user={viewingUser} />
            </Modal>

            <Modal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} title="Importar Usuarios desde Excel">
                <ImportComponent 
                    importType="users" 
                    onImportSuccess={(successMessage) => {
                        setIsImportModalOpen(false);
                        fetchUsers(1, '');
                        showNotification(successMessage);
                    }} 
                />
            </Modal>

            <Modal isOpen={isDeleteModalOpen} onClose={handleCloseModals} title="Confirmar Eliminación">
                <div className="space-y-4">
                    <p className="dark:text-gray-300">
                        ¿Estás seguro de que deseas eliminar al usuario <strong className="dark:text-white">{deletingUser?.primerNombre} {deletingUser?.primerApellido}</strong>?
                    </p>
                    <p className="text-sm text-red-600 dark:text-red-400">
                        Esta acción es irreversible.
                    </p>
                    <div className="flex justify-end pt-4 space-x-2">
                        <button type="button" onClick={handleCloseModals} className="px-4 py-2 font-medium text-gray-600 bg-gray-200 rounded-md dark:bg-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500">
                            Cancelar
                        </button>
                        <button type="button" onClick={executeDelete} className="px-4 py-2 font-medium text-white bg-red-600 rounded-md hover:bg-red-700">
                            Sí, Eliminar
                        </button>
                    </div>
                </div>
            </Modal>

            <div className="mt-6 overflow-x-auto bg-white rounded-lg shadow dark:bg-gray-800">
                {loading ? (
                     <div className="p-6 text-center dark:text-gray-300">Cargando usuarios...</div>
                ) : (
                    <table className="min-w-full text-sm divide-y divide-gray-200 dark:divide-gray-700 responsive-table">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Nombre</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">RUT</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Correo</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Rol</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Curso</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {users.map(user => (
                                <tr key={user._id} className="hover:bg-gray-100 dark:hover:bg-gray-600">
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">{user.primerNombre} {user.primerApellido}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-300">{user.rut}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-300">{user.correo}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-300 capitalize">{user.rol}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-300">{user.rol === 'alumno' ? user.curso : 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-4">
                                        <button onClick={() => handleOpenViewModal(user)} className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300">Ver</button>
                                        <button onClick={() => handleOpenEditModal(user)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">Editar</button>
                                        <button onClick={() => handleDeleteClick(user)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">Eliminar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {!loading && totalPages > 1 && (
                <div className="flex items-center justify-end mt-4 text-sm">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 mr-2 text-gray-700 bg-gray-200 rounded-md dark:bg-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Anterior
                    </button>
                    <span className="text-gray-700 dark:text-gray-300">
                        Página {currentPage} de {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 ml-2 text-gray-700 bg-gray-200 rounded-md dark:bg-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Siguiente
                    </button>
                </div>
            )}
        </div>
    );
};

export default UserManagementPage;
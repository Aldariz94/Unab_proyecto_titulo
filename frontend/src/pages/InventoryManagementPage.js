// frontend/src/pages/InventoryManagementPage.js

import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useNotification } from '../hooks';
import { Notification, Modal } from '../components';

const InventoryManagementPage = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const { notification, showNotification } = useNotification();

    // Estados para la paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    // Estado unificado para manejar el modal
    const [modalState, setModalState] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: null,
        confirmText: '',
        confirmColor: 'bg-green-600'
    });

    const fetchItems = useCallback(async (page) => {
        try {
            setLoading(true);
            const { data } = await api.get(`/inventory/attention?page=${page}&limit=10`);
            setItems(data.docs);
            setTotalPages(data.totalPages);
            setCurrentPage(data.page);
        } catch (err) {
            showNotification('No se pudieron cargar los ítems.', 'error');
        } finally {
            setLoading(false);
        }
    }, [showNotification]);

    useEffect(() => {
        fetchItems(currentPage);
    }, [currentPage, fetchItems]);

    // Función que CIERRA el modal y resetea su estado
    const handleCloseModal = () => {
        setModalState({ isOpen: false, title: '', message: '', onConfirm: null });
    };

    // --- Handlers para ABRIR el modal ---

    const handleStatusChangeClick = (item, newStatus) => {
        setModalState({
            isOpen: true,
            title: 'Confirmar Cambio de Estado',
            message: `¿Estás seguro de que quieres cambiar el estado de este ítem a "${newStatus}"?`,
            onConfirm: () => executeStatusChange(item, newStatus),
            confirmText: 'Sí, Cambiar Estado',
            confirmColor: 'bg-green-600 hover:bg-green-700'
        });
    };
    
    const handleDeleteClick = (item) => {
        setModalState({
            isOpen: true,
            title: 'Confirmar Eliminación',
            message: `ADVERTENCIA: Estás a punto de eliminar permanentemente el registro de esta copia (${item.numeroCopia ? `Copia N° ${item.numeroCopia}` : item.codigoInterno}). ¿Deseas continuar?`,
            onConfirm: () => executeDelete(item),
            confirmText: 'Sí, Dar de Baja',
            confirmColor: 'bg-red-600 hover:bg-red-700'
        });
    };

    // --- Funciones que EJECUTAN la lógica de la API ---

    const executeStatusChange = async (item, newStatus) => {
        const endpoint = item.itemType === 'Libro' 
            ? `/books/exemplars/${item._id}` 
            : `/resources/instances/${item._id}`;
        try {
            await api.put(endpoint, { estado: newStatus });
            showNotification('Estado actualizado correctamente.');
            fetchItems(currentPage);
        } catch (err) {
            showNotification(err.response?.data?.msg || 'Error al actualizar el estado.', 'error');
        } finally {
            handleCloseModal();
        }
    };
    
    const executeDelete = async (item) => {
        try {
            await api.delete(`/inventory/item/${item.itemType}/${item._id}`);
            showNotification('Ítem dado de baja exitosamente.');
             if (items.length === 1 && currentPage > 1) {
                fetchItems(currentPage - 1);
            } else {
                fetchItems(currentPage);
            }
        } catch (err) {
            showNotification(err.response?.data?.msg || 'Error al dar de baja el ítem.', 'error');
        } finally {
            handleCloseModal();
        }
    };

    return (
        <div>
            <Notification {...notification} />

            <Modal isOpen={modalState.isOpen} onClose={handleCloseModal} title={modalState.title}>
                <div className="space-y-4">
                    <p className="dark:text-gray-300">{modalState.message}</p>
                    <div className="flex justify-end pt-4 space-x-2">
                        <button type="button" onClick={handleCloseModal} className="px-4 py-2 font-medium text-gray-600 bg-gray-200 rounded-md dark:bg-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500">Cancelar</button>
                        <button type="button" onClick={modalState.onConfirm} className={`px-4 py-2 font-medium text-white rounded-md ${modalState.confirmColor}`}>
                            {modalState.confirmText}
                        </button>
                    </div>
                </div>
            </Modal>

            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Mantenimiento de Inventario</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
                Ítems que están marcados como deteriorados, extraviados o en mantenimiento.
            </p>

            <div className="mt-6 overflow-x-auto bg-white rounded-lg shadow dark:bg-gray-800">
                {loading ? (
                    <div className="p-6 text-center dark:text-gray-300">Cargando inventario...</div>
                ) : (
                    <table className="min-w-full text-sm divide-y divide-gray-200 dark:divide-gray-700 responsive-table">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase dark:text-gray-300">Título</th>
                                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase dark:text-gray-300">Tipo</th>
                                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase dark:text-gray-300">Identificador</th>
                                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase dark:text-gray-300">Estado Actual</th>
                                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase dark:text-gray-300">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {items.length > 0 ? (
                                items.map(item => (
                                    <tr key={item._id} className="hover:bg-gray-100 dark:hover:bg-gray-600">
                                        <td className="px-6 py-4 text-gray-900 dark:text-white">{item.libroId?.titulo || item.resourceId?.nombre || 'N/A'}</td>
                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-300">{item.itemType}</td>
                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-300">{item.numeroCopia ? `Copia N° ${item.numeroCopia}` : item.codigoInterno}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 capitalize dark:bg-yellow-900 dark:text-yellow-300">
                                                {item.estado}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium space-x-4">
                                            {item.estado === 'deteriorado' && (
                                                <button onClick={() => handleStatusChangeClick(item, 'disponible')} className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300">
                                                    Marcar Reparado
                                                </button>
                                            )}
                                            {item.estado === 'extraviado' && (
                                                <button onClick={() => handleStatusChangeClick(item, 'disponible')} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                                                    Encontrado/Repuesto
                                                </button>
                                            )}
                                            {(item.estado === 'deteriorado' || item.estado === 'extraviado') && (
                                                <button onClick={() => handleDeleteClick(item)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                                                    Dar de Baja
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                        No hay ítems que requieran atención en este momento.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Controles de Paginación */}
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

export default InventoryManagementPage;
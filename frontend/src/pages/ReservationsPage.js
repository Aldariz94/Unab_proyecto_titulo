import React, { useEffect, useState, useMemo, useCallback } from 'react';
import api from '../services/api';
import { Modal, CreateLoanForm, Notification } from '../components';
import { useNotification } from '../hooks';
import { PlusIcon } from '@heroicons/react/24/outline';

const ReservationsPage = () => {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { notification, showNotification } = useNotification();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    
    const [selectedReservation, setSelectedReservation] = useState(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    const fetchReservations = useCallback(async (page) => {
        try {
            setLoading(true);
            const response = await api.get(`/reservations?page=${page}&limit=10`);
            setReservations(response.data.docs);
            setTotalPages(response.data.totalPages);
            setCurrentPage(response.data.page);
        } catch (err) {
            showNotification('No se pudo cargar la lista de reservas.', 'error');
        } finally {
            setLoading(false);
        }
    }, [showNotification]);

    useEffect(() => {
        fetchReservations(currentPage);
    }, [currentPage, fetchReservations]);

    const filteredReservations = useMemo(() => {
        const cleanReservations = reservations.filter(res => res && res.usuarioId);

        if (!searchTerm) return cleanReservations;
        
        const lowerCaseSearch = searchTerm.toLowerCase();
        return cleanReservations.filter(res => {
            const userName = `${res.usuarioId.primerNombre} ${res.usuarioId.primerApellido}`.toLowerCase();
            const itemName = (res.itemDetails?.name || '').toLowerCase();
            return userName.includes(lowerCaseSearch) || itemName.includes(lowerCaseSearch);
        });
    }, [reservations, searchTerm]);

    const handleCreateReservation = async (reservationData) => {
        try {
            await api.post('/reservations', reservationData);
            showNotification('Reserva manual creada exitosamente.');
            fetchReservations(1);
        } catch (err) {
            showNotification(err.response?.data?.msg || 'Error al crear la reserva.', 'error');
        } finally {
            setIsCreateModalOpen(false);
        }
    };
    
    const handleOpenConfirmModal = (reservation) => {
        setSelectedReservation(reservation);
        setIsConfirmModalOpen(true);
    };

    const handleOpenCancelModal = (reservation) => {
        setSelectedReservation(reservation);
        setIsCancelModalOpen(true);
    };

    const handleCloseModals = () => {
        setIsConfirmModalOpen(false);
        setIsCancelModalOpen(false);
        setIsCreateModalOpen(false);
        setSelectedReservation(null);
    };

    const executeConfirm = async () => {
        if (!selectedReservation) return;
        try {
            await api.post(`/reservations/${selectedReservation._id}/confirm`);
            showNotification('Reserva confirmada y préstamo creado.');
            if (reservations.length === 1 && currentPage > 1) {
                fetchReservations(currentPage - 1);
            } else {
                fetchReservations(currentPage);
            }
        } catch (err) {
            showNotification(err.response?.data?.msg || 'Error al confirmar la reserva.', 'error');
        } finally {
            handleCloseModals();
        }
    };

    const executeCancel = async () => {
        if (!selectedReservation) return;
        try {
            await api.post(`/reservations/${selectedReservation._id}/cancel`);
            showNotification('Reserva cancelada.');
            if (reservations.length === 1 && currentPage > 1) {
                fetchReservations(currentPage - 1);
            } else {
                fetchReservations(currentPage);
            }
        } catch (err) {
            showNotification(err.response?.data?.msg || 'Error al cancelar la reserva.', 'error');
        } finally {
            handleCloseModals();
        }
    };

    return (
        <div>
            <Notification {...notification} />
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Gestión de Reservas</h1>
                <div className="flex items-center gap-4">
                    <input type="text" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full md:w-64 px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                     <button onClick={() => setIsCreateModalOpen(true)} className="flex items-center px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 whitespace-nowrap">
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Crear Reserva
                    </button>
                </div>
            </div>

            <Modal isOpen={isCreateModalOpen} onClose={handleCloseModals} title="Crear Nueva Reserva Manual">
                <CreateLoanForm onSubmit={handleCreateReservation} onCancel={handleCloseModals} usageContext="reservation" />
            </Modal>
            
            <Modal isOpen={isConfirmModalOpen} onClose={handleCloseModals} title="Confirmar Retiro">
                <div className="space-y-4">
                    <p className="dark:text-gray-300">
                        ¿Estás seguro de que deseas confirmar el retiro del ítem <strong className="dark:text-white">{selectedReservation?.itemDetails?.name}</strong> para el usuario <strong className="dark:text-white">{selectedReservation?.usuarioId?.primerNombre} {selectedReservation?.usuarioId?.primerApellido}</strong>?
                    </p>
                    <p className="text-sm text-yellow-600 dark:text-yellow-400">Esta acción creará un nuevo préstamo y no se puede deshacer.</p>
                    <div className="flex justify-end pt-4 space-x-2">
                        <button type="button" onClick={handleCloseModals} className="px-4 py-2 font-medium text-gray-600 bg-gray-200 rounded-md dark:bg-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500">
                            No, volver
                        </button>
                        <button type="button" onClick={executeConfirm} className="px-4 py-2 font-medium text-white bg-green-600 rounded-md hover:bg-green-700">
                            Sí, confirmar retiro
                        </button>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={isCancelModalOpen} onClose={handleCloseModals} title="Cancelar Reserva">
                <div className="space-y-4">
                    <p className="dark:text-gray-300">
                        ¿Estás seguro de que deseas cancelar esta reserva? El ítem volverá a estar disponible para otros usuarios.
                    </p>
                    <div className="flex justify-end pt-4 space-x-2">
                        <button type="button" onClick={handleCloseModals} className="px-4 py-2 font-medium text-gray-600 bg-gray-200 rounded-md dark:bg-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500">
                            No, volver
                        </button>
                        <button type="button" onClick={executeCancel} className="px-4 py-2 font-medium text-white bg-red-600 rounded-md hover:bg-red-700">
                            Sí, cancelar reserva
                        </button>
                    </div>
                </div>
            </Modal>

            <h2 className="mt-10 text-2xl font-bold text-gray-800 dark:text-white">Reservas Activas</h2>
            <div className="mt-6 overflow-x-auto bg-white rounded-lg shadow dark:bg-gray-800">
                {loading ? (
                    <div className="p-6 text-center dark:text-gray-300">Cargando reservas...</div>
                ) : (
                    <table className="min-w-full text-sm divide-y divide-gray-200 dark:divide-gray-700 responsive-table">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase dark:text-gray-300">Usuario</th>
                                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase dark:text-gray-300">Ítem</th>
                                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase dark:text-gray-300">Fecha Límite de Retiro</th>
                                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase dark:text-gray-300">Estado</th>
                                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase dark:text-gray-300">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredReservations.length > 0 ? (
                                filteredReservations.map(res => (
                                    <tr key={res._id} className="hover:bg-gray-100 dark:hover:bg-gray-600">
                                        <td className="px-6 py-4 text-gray-900 dark:text-white">{res.usuarioId ? `${res.usuarioId.primerNombre} ${res.usuarioId.primerApellido}` : 'Usuario Eliminado'}</td>
                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-300">{res.itemDetails?.name || 'N/A'}</td>
                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-300">
                                            {res.expiraEn ? new Date(res.expiraEn).toLocaleDateString('es-CL') : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300">
                                                {res.estado}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium space-x-4">
                                            <button onClick={() => handleOpenConfirmModal(res)} className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300">Confirmar Retiro</button>
                                            <button onClick={() => handleOpenCancelModal(res)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">Cancelar Reserva</button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                        No hay reservas activas que coincidan con la búsqueda.
                                    </td>
                                </tr>
                            )}
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

export default ReservationsPage;
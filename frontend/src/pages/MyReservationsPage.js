// frontend/src/pages/MyReservationsPage.js

import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useNotification } from '../hooks';
import { Notification, Modal } from '../components'; // 1. Importar Modal

const MyReservationsPage = () => {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const { notification, showNotification } = useNotification();

    // 2. Añadir estado para el modal de confirmación
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [reservationToCancel, setReservationToCancel] = useState(null);

    const fetchReservations = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/reservations/my-reservations');
            setReservations(data);
        } catch (err) {
            showNotification('No se pudieron cargar las reservas.', 'error');
        } finally {
            setLoading(false);
        }
    }, [showNotification]);

    useEffect(() => {
        fetchReservations();
    }, [fetchReservations]);

    // 3. Modificar el handler para que abra el modal
    const handleCancelClick = (reservation) => {
        setReservationToCancel(reservation);
        setIsCancelModalOpen(true);
    };

    // 4. Crear la función que ejecuta la cancelación
    const executeCancel = async () => {
        if (!reservationToCancel) return;
        try {
            await api.delete(`/reservations/${reservationToCancel._id}`);
            showNotification('Reserva cancelada exitosamente.');
            fetchReservations();
        } catch (err) {
            showNotification(err.response?.data?.msg || 'Error al cancelar la reserva.', 'error');
        } finally {
            setIsCancelModalOpen(false); // Cerrar el modal
            setReservationToCancel(null);
        }
    };

    if (loading) return <div className="text-center text-gray-800 dark:text-gray-200">Cargando tus reservas...</div>;

    return (
        <div>
            <Notification {...notification} />
            
            {/* 5. Añadir el componente Modal al JSX */}
            <Modal isOpen={isCancelModalOpen} onClose={() => setIsCancelModalOpen(false)} title="Confirmar Cancelación">
                <div className="space-y-4">
                    <p className="dark:text-gray-300">
                        ¿Estás seguro de que quieres cancelar la reserva para <strong className="dark:text-white">"{reservationToCancel?.itemDetails?.name}"</strong>? El ítem volverá a estar disponible.
                    </p>
                    <div className="flex justify-end pt-4 space-x-2">
                        <button type="button" onClick={() => setIsCancelModalOpen(false)} className="px-4 py-2 font-medium text-gray-600 bg-gray-200 rounded-md dark:bg-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500">
                            Volver
                        </button>
                        <button type="button" onClick={executeCancel} className="px-4 py-2 font-medium text-white bg-red-600 rounded-md hover:bg-red-700">
                            Sí, Cancelar Reserva
                        </button>
                    </div>
                </div>
            </Modal>
            
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Mis Reservas</h1>
            <div className="mt-6 overflow-x-auto bg-white rounded-lg shadow dark:bg-gray-800">
                <table className="min-w-full text-sm divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Ítem Reservado</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Expira el</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Estado</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {reservations.length > 0 ? (
                            reservations.map(res => (
                                <tr key={res._id} className="hover:bg-gray-100 dark:hover:bg-gray-600">
                <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">
                    {res.itemDetails?.titulo || res.itemDetails?.nombre || 'N/A'}
                </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-300">{res.expiraEn}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300">
                                            Pendiente
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        {/* 6. Actualizar el onClick del botón */}
                                        <button onClick={() => handleCancelClick(res)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                                            Cancelar
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                    No tienes reservas activas.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MyReservationsPage;
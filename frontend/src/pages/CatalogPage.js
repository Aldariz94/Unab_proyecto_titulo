import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import { useAuth, useNotification } from '../hooks';
import { Notification, Modal } from '../components';

const CatalogPage = ({ isUserView = false, itemType = 'book' }) => {
    const [catalog, setCatalog] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const { notification, showNotification } = useNotification();
    
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    const [isReserveModalOpen, setIsReserveModalOpen] = useState(false);
    const [itemToReserve, setItemToReserve] = useState(null);

    const fetchCatalog = useCallback(async (page, search) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page,
                limit: 16,
            });
            if (search) {
                params.append('search', search);
            }

            let endpoint = '/public/catalog';
            if (isUserView) {
                endpoint = itemType === 'book' ? '/public/user-catalog/books' : '/public/user-catalog/resources';
            }
            
            const response = await api.get(`${endpoint}?${params.toString()}`);
            
            setCatalog(response.data.docs);
            setTotalPages(response.data.totalPages);
            setCurrentPage(response.data.page);
        } catch (err) {
            showNotification('No se pudo cargar el catálogo.', 'error');
        } finally {
            setLoading(false);
        }
    }, [isUserView, itemType, showNotification]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm !== debouncedSearchTerm) {
                setCurrentPage(1);
                setDebouncedSearchTerm(searchTerm);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm, debouncedSearchTerm]);

    useEffect(() => {
        fetchCatalog(currentPage, debouncedSearchTerm);
    }, [currentPage, debouncedSearchTerm, fetchCatalog]);

    const handleReserveClick = (item) => {
        if (!user) {
            showNotification("Debes iniciar sesión para poder reservar.", "error");
            return;
        }
        setItemToReserve(item);
        setIsReserveModalOpen(true);
    };
    
    const executeReserve = async () => {
        if (!itemToReserve) return;

        const itemTypeForAPI = itemToReserve.itemType === 'Libro' ? 'Book' : 'Resource';
        const itemModelForDB = itemToReserve.itemType === 'Libro' ? 'Exemplar' : 'ResourceInstance';

        try {
            const res = await api.get(`/search/find-available-copy/${itemTypeForAPI}/${itemToReserve._id}`);
            const { copyId } = res.data;

            await api.post('/reservations', {
                itemId: copyId,
                itemModel: itemModelForDB
            });

            showNotification(`¡Has reservado "${itemToReserve.titulo}" exitosamente!`);
            fetchCatalog(currentPage, debouncedSearchTerm);
        } catch (err) {
            showNotification(err.response?.data?.msg || "No se pudo completar la reserva.", "error");
        } finally {
            setIsReserveModalOpen(false);
            setItemToReserve(null);
        }
    };

    return (
        <div>
            <Notification {...notification} />

            <Modal isOpen={isReserveModalOpen} onClose={() => setIsReserveModalOpen(false)} title="Confirmar Reserva">
                <div className="space-y-4">
                    <p className="dark:text-gray-300">
                        ¿Deseas reservar el ítem <strong className="dark:text-white">"{itemToReserve?.titulo}"</strong>?
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Una vez reservado, tendrás 2 días hábiles para retirarlo en la biblioteca.
                    </p>
                    <div className="flex justify-end pt-4 space-x-2">
                        <button type="button" onClick={() => setIsReserveModalOpen(false)} className="px-4 py-2 font-medium text-gray-600 bg-gray-200 rounded-md dark:bg-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500">
                            Cancelar
                        </button>
                        <button type="button" onClick={executeReserve} className="px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                            Sí, Reservar
                        </button>
                    </div>
                </div>
            </Modal>

            <div className="mb-8">
                <input
                    type="text"
                    placeholder={itemType === 'book' ? "Buscar por título o autor..." : "Buscar por nombre del recurso..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 text-gray-700 bg-white border rounded-lg dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-600 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse">
                    {Array.from({ length: 16 }).map((_, i) => (
                        <div key={i} className="h-64 bg-gray-200 dark:bg-zinc-700 rounded-lg"></div>
                    ))}
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {catalog.length > 0 ? (
                            catalog.map(item => (
                                <div key={item._id} className="flex flex-col p-4 bg-white rounded-lg shadow-md dark:bg-zinc-800">
                                    <div className="flex-grow">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${item.itemType === 'Libro' ? 'bg-blue-200 text-blue-800 dark:bg-blue-900 dark:text-blue-300' : 'bg-purple-200 text-purple-800 dark:bg-purple-900 dark:text-purple-300'}`}>
                                            {item.itemType}
                                        </span>
                                        <h3 className="mt-2 text-xl font-bold text-gray-800 dark:text-white">{item.titulo}</h3>
                                        {item.autor && <p className="text-sm text-gray-600 dark:text-zinc-400">{item.autor}</p>}
                                    </div>
                                    <div className="mt-4">
                                        <div className="flex justify-between items-center text-sm text-gray-600 dark:text-zinc-300">
                                            <span>Sede: <strong>{item.sede}</strong></span>
                                            <span>Disponibles: <strong>{item.availableStock}</strong></span>
                                        </div>
                                        {isUserView && (
                                            <button
                                                onClick={() => handleReserveClick(item)}
                                                disabled={item.availableStock === 0}
                                                className="w-full mt-4 px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed"
                                            >
                                                {item.availableStock > 0 ? 'Reservar' : 'No disponible'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full text-center text-gray-500 dark:text-zinc-400 py-10">
                                No se encontraron ítems que coincidan con la búsqueda.
                            </div>
                        )}
                    </div>

                    {!loading && totalPages > 1 && (
                        <div className="flex items-center justify-center mt-8 text-sm">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 mx-1 font-medium text-gray-700 bg-gray-200 rounded-md dark:bg-zinc-700 dark:text-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Anterior
                            </button>
                            <span className="text-gray-700 dark:text-zinc-300 mx-4">
                                Página {currentPage} de {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 mx-1 font-medium text-gray-700 bg-gray-200 rounded-md dark:bg-zinc-700 dark:text-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Siguiente
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default CatalogPage;
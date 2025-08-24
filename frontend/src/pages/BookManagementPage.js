import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import { Modal, BookForm, BookDetails, ImportComponent, Notification } from '../components';
import { ArrowUpTrayIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useNotification } from '../hooks';

const BookManagementPage = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [editingBook, setEditingBook] = useState(null);
    const [viewingBook, setViewingBook] = useState(null);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const { notification, showNotification } = useNotification();

    // Estados para búsqueda y paginación
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    // Estado para el modal de eliminación
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingBook, setDeletingBook] = useState(null);

    const fetchBooks = useCallback(async (page, search) => {
        try {
            setLoading(true);
            const params = new URLSearchParams({ page, limit: 10 });
            if (search) {
                params.append('search', search);
            }
            const response = await api.get(`/books?${params.toString()}`);
            setBooks(response.data.docs);
            setTotalPages(response.data.totalPages);
            setCurrentPage(response.data.page);
        } catch (err) {
            showNotification('No se pudo cargar la lista de libros.', 'error');
        } finally {
            setLoading(false);
        }
    }, [showNotification]);

    // Efecto para "debounce"
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm !== debouncedSearchTerm) {
                setCurrentPage(1);
                setDebouncedSearchTerm(searchTerm);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm, debouncedSearchTerm]);

    // Efecto para llamar a la API
    useEffect(() => {
        fetchBooks(currentPage, debouncedSearchTerm);
    }, [currentPage, debouncedSearchTerm, fetchBooks]);

    const handleOpenCreateModal = () => {
        setEditingBook(null);
        setIsFormModalOpen(true);
    };

    const handleOpenEditModal = (book) => {
        setEditingBook(book);
        setIsFormModalOpen(true);
    };

    const handleOpenViewModal = (book) => {
        setViewingBook(book);
        setIsViewModalOpen(true);
    };

    const handleCloseModals = () => {
        setIsFormModalOpen(false);
        setIsViewModalOpen(false);
        setIsDeleteModalOpen(false);
        setEditingBook(null);
        setViewingBook(null);
        setDeletingBook(null);
    };

    const handleSubmit = async (payload) => {
        try {
            if (editingBook) {
                await api.put(`/books/${editingBook._id}`, payload.libroData);
                if (payload.additionalExemplars > 0) {
                    await api.post(`/books/${editingBook._id}/exemplars`, { quantity: payload.additionalExemplars });
                }
                showNotification('Libro actualizado exitosamente.');
            } else {
                await api.post('/books', payload);
                showNotification('Libro creado exitosamente.');
            }
            handleCloseModals();
            fetchBooks(currentPage, debouncedSearchTerm);
        } catch (err) {
            showNotification(err.response?.data?.msg || 'Error al guardar el libro.', 'error');
        }
    };

    const handleDeleteClick = (book) => {
        setDeletingBook(book);
        setIsDeleteModalOpen(true);
    };

    const executeDelete = async () => {
        if (!deletingBook) return;
        try {
            await api.delete(`/books/${deletingBook._id}`);
            showNotification('Libro eliminado exitosamente.');
            if (books.length === 1 && currentPage > 1) {
                fetchBooks(currentPage - 1, debouncedSearchTerm);
            } else {
                fetchBooks(currentPage, debouncedSearchTerm);
            }
        } catch (err) {
            showNotification(err.response?.data?.msg || 'Error al eliminar el libro.', 'error');
        } finally {
            handleCloseModals();
        }
    };

    return (
        <div>
            <Notification {...notification} />
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Gestión de Libros</h1>
                <div className="flex items-center gap-4">
                    <input type="text" placeholder="Buscar por título, autor..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full md:w-64 px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                    <button onClick={() => setIsImportModalOpen(true)} className="flex items-center px-4 py-2 font-medium text-white bg-green-600 rounded-md hover:bg-green-700 whitespace-nowrap">
                        <ArrowUpTrayIcon className="w-5 h-5 mr-2" />
                        Importar
                    </button>
                    <button onClick={handleOpenCreateModal} className="flex items-center px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 whitespace-nowrap">
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Crear Libro
                    </button>
                </div>
            </div>

            <Modal isOpen={isFormModalOpen} onClose={handleCloseModals} title={editingBook ? "Editar Libro" : "Crear Nuevo Libro"}>
                <BookForm onSubmit={handleSubmit} onCancel={handleCloseModals} initialData={editingBook} />
            </Modal>

            <Modal isOpen={isViewModalOpen} onClose={handleCloseModals} title="Detalles del Libro">
                <BookDetails book={viewingBook} />
            </Modal>

            <Modal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} title="Importar Libros desde Excel">
                <ImportComponent 
                    importType="books" 
                    onImportSuccess={(successMessage) => {
                        setIsImportModalOpen(false);
                        fetchBooks(1, '');
                        showNotification(successMessage);
                    }} 
                />
            </Modal>

            <Modal isOpen={isDeleteModalOpen} onClose={handleCloseModals} title="Confirmar Eliminación">
                <div className="space-y-4">
                    <p className="dark:text-gray-300">
                        ¿Estás seguro de que deseas eliminar el libro <strong className="dark:text-white">"{deletingBook?.titulo}"</strong>?
                    </p>
                    <p className="text-sm text-red-600 dark:text-red-400">
                        Esta acción es irreversible y eliminará también todos sus ejemplares.
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
                    <div className="p-6 text-center dark:text-gray-300">Cargando libros...</div>
                ) : (
                    <table className="min-w-full text-sm divide-y divide-gray-200 dark:divide-gray-700 responsive-table">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Título</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Autor</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Sede</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Ejemplares</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {books.map(book => (
                                <tr key={book._id} className="hover:bg-gray-100 dark:hover:bg-gray-600">
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">{book.titulo}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-300">{book.autor}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-300">{book.sede}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-300">{`${book.availableExemplars} / ${book.totalExemplars}`}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-4">
                                        <button onClick={() => handleOpenViewModal(book)} className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300">Ver</button>
                                        <button onClick={() => handleOpenEditModal(book)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">Editar</button>
                                        <button onClick={() => handleDeleteClick(book)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">Eliminar</button>
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

export default BookManagementPage;
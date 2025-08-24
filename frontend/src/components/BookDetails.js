// frontend/src/components/BookDetails.js
import React, { useState, useEffect } from 'react';
import api from '../services/api';

const DetailRow = ({ label, value }) => (
    <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4">
        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</dt>
        <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">{value || 'No especificado'}</dd>
    </div>
);

// Componente para la etiqueta de estado, igual que en ResourceDetails
const StatusBadge = ({ status }) => {
    const statusStyles = {
        disponible: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        prestado: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        reservado: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300',
        deteriorado: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        extraviado: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    };

    return (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
            {status}
        </span>
    );
};


const BookDetails = ({ book }) => {
    const [exemplars, setExemplars] = useState([]);

    useEffect(() => {
        if (book) {
            // La función para obtener los ejemplares ya existe
            api.get(`/books/${book._id}/exemplars`).then(res => setExemplars(res.data));
        }
    }, [book]);

    // La función handleStatusChange ya no se necesita aquí, se ha eliminado

    if (!book) return null;

    return (
        <div>
            <dl>
                <DetailRow label="Título" value={book.titulo} />
                <DetailRow label="Autor" value={book.autor} />
                <DetailRow label="Editorial" value={book.editorial} />
                <DetailRow label="Sede" value={book.sede} />
                <DetailRow label="Lugar de Publicación" value={book.lugarPublicacion} />
                <DetailRow label="Año de Publicación" value={book.añoPublicacion} />
                <DetailRow label="Tipo de Documento" value={book.tipoDocumento} />
                <DetailRow label="ISBN" value={book.isbn} />
                <DetailRow label="Edición" value={book.edicion} />
                <DetailRow label="N° de Páginas" value={book.numeroPaginas} />
                <DetailRow label="Idioma" value={book.idioma} />
                <DetailRow label="País" value={book.pais} />
                <DetailRow label="CDD" value={book.cdd} />
                <DetailRow label="Ubicación en Estantería" value={book.ubicacionEstanteria} />
                <DetailRow label="Descriptores" value={(book.descriptores || []).join(', ')} />
            </dl>
            <h4 className="mt-6 mb-2 font-bold dark:text-white">Ejemplares</h4>
            <div className="max-h-48 overflow-y-auto pr-2">
                {exemplars.map(ex => (
                    <div key={ex._id} className="flex items-center justify-between py-2 border-b dark:border-gray-700">
                        <span className="dark:text-gray-300">Copia N° {ex.numeroCopia}</span>
                        {/* Reemplazamos el <select> por la etiqueta de estado */}
                        <StatusBadge status={ex.estado} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BookDetails;
// frontend/src/components/ResourceDetails.js
import React, { useState, useEffect } from 'react';
import api from '../services/api';

const DetailRow = ({ label, value }) => (
    <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4">
        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</dt>
        <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">{value || 'No especificado'}</dd>
    </div>
);

const StatusBadge = ({ status }) => {
    const statusStyles = {
        disponible: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        prestado: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        mantenimiento: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        reservado: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300',
    };

    return (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
            {status}
        </span>
    );
};

const ResourceDetails = ({ resource }) => {
    const [instances, setInstances] = useState([]);

    useEffect(() => {
        if (resource) {
            api.get(`/resources/${resource._id}/instances`).then(res => setInstances(res.data));
        }
    }, [resource]);

    // La función handleStatusChange ha sido eliminada ya que no se usa.

    if (!resource) return null;

    return (
        <div>
            <dl>
                <DetailRow label="Nombre" value={resource.nombre} />
                <DetailRow label="Sede" value={resource.sede} />
                <DetailRow label="Categoría" value={resource.categoria} />
                <DetailRow label="Ubicación" value={resource.ubicacion} />
                <DetailRow label="Descripción" value={resource.descripcion} />
            </dl>
            <h4 className="mt-6 mb-2 font-bold dark:text-white">Unidades</h4>
            <div className="max-h-48 overflow-y-auto pr-2">
                {instances.map(inst => (
                    <div key={inst._id} className="flex items-center justify-between py-2 border-b dark:border-gray-700">
                        <span className="dark:text-gray-300">{inst.codigoInterno}</span>
                        <StatusBadge status={inst.estado} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ResourceDetails;
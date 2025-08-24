import React from 'react';

const DetailRow = ({ label, value }) => (
    <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4">
        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</dt>
        <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">{value || 'No especificado'}</dd>
    </div>
);

const UserDetails = ({ user }) => {
    if (!user) return null;

    const fullName = [user.primerNombre, user.segundoNombre, user.primerApellido, user.segundoApellido].filter(Boolean).join(' ');

    return (
        <dl>
            <DetailRow label="Nombre Completo" value={fullName} />
            <DetailRow label="RUT" value={user.rut} />
            <DetailRow label="Correo Electrónico" value={user.correo} />
            <DetailRow label="Rol" value={user.rol} />
            {user.rol === 'alumno' && <DetailRow label="Curso" value={user.curso} />}
            <DetailRow label="Fecha de Creación" value={new Date(user.createdAt).toLocaleString('es-CL')} />
            <DetailRow label="Última Actualización" value={new Date(user.updatedAt).toLocaleString('es-CL')} />
        </dl>
    );
};

export default UserDetails;
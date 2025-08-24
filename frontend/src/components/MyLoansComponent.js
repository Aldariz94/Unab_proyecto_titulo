import React, { useState, useEffect } from 'react'; // <-- Importaciones añadidas
import api from '../services/api'; // <-- Importaciones añadidas
import { useAuth } from '../hooks/useAuth'; // <-- Importaciones añadidas

const MyLoansComponent = () => {
    const [myLoans, setMyLoans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useAuth();

    useEffect(() => {
        const fetchMyLoans = async () => {
            try {
                const response = await api.get('/loans/my-loans');
                setMyLoans(response.data);
            } catch (err) {
                setError('No se pudo cargar tu historial de préstamos.');
            } finally {
                setLoading(false);
            }
        };
        fetchMyLoans();
    }, []);

    if (loading) return <div className="text-center text-gray-800 dark:text-gray-200">Cargando tus préstamos...</div>;
    if (error) return <div className="text-center text-red-500">{error}</div>;

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Mis Préstamos</h1>
            {user && user.sancionHasta && new Date(user.sancionHasta) > new Date() && (
                <div className="mt-4 p-4 text-yellow-800 bg-yellow-100 border border-yellow-300 rounded-lg dark:bg-yellow-900 dark:text-yellow-300 dark:border-yellow-800">
                    <strong>Atención:</strong> Tienes una sanción activa hasta el {new Date(user.sancionHasta).toLocaleDateString('es-CL')}. No podrás solicitar nuevos préstamos hasta esa fecha.
                </div>
            )}
            <div className="mt-6 overflow-x-auto bg-white rounded-lg shadow dark:bg-gray-800">
                <table className="min-w-full text-sm divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Ítem Prestado</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Fecha de Préstamo</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Fecha de Vencimiento</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Estado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {myLoans.length > 0 ? (
                            myLoans.map(loan => (
                                <tr key={loan._id} className="hover:bg-gray-100 dark:hover:bg-gray-600">
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">{loan.itemDetails?.name || 'N/A'}</td>
                                    {/* CORRECCIÓN: Usamos la fecha ya formateada del backend */}
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-300">{loan.fechaPrestamo}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-300">{loan.fechaVencimiento}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
                                            loan.estado === 'atrasado' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                                        }`}>
                                            {loan.estado}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                             <tr>
                                <td colSpan="4" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                    No tienes préstamos activos.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MyLoansComponent;
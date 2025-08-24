// frontend/src/pages/DashboardPage.js
import React, { useState, useEffect } from 'react';
import api from '../services/api';

const StatCard = ({ title, value, colorClass }) => (
    <div className={`p-6 rounded-lg shadow-lg ${colorClass}`}>
        <h4 className="text-lg font-semibold text-white uppercase">{title}</h4>
        <p className="mt-2 text-3xl font-bold text-white">{value}</p>
    </div>
);

const DashboardPage = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/dashboard/stats');
                setStats(data);
            } catch (error) {
                console.error("Error al cargar las estadísticas", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return <div className="text-center text-gray-800 dark:text-gray-200">Cargando estadísticas...</div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Dashboard</h1>
            <p className="mt-2 mb-6 text-gray-600 dark:text-gray-400">Resumen de la actividad de la biblioteca.</p>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <StatCard title="Préstamos Hoy" value={stats?.loansToday} colorClass="bg-blue-500" />
                <StatCard title="Reservas Hoy" value={stats?.reservationsToday} colorClass="bg-green-500" />
                <StatCard title="Préstamos Atrasados" value={stats?.overdueLoans} colorClass="bg-yellow-500" />
                <StatCard title="Usuarios Sancionados" value={stats?.sanctionedUsers} colorClass="bg-red-500" />
                <StatCard title="Ítems con Problemas" value={stats?.itemsForAttention} colorClass="bg-purple-500" />
            </div>
        </div>
    );
};

export default DashboardPage;
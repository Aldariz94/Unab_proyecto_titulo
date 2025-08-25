import React, { useState } from 'react';
import { useAuth, useNotification } from '../hooks';
import { Notification } from '../components';

const LoginPage = () => {
    const [correo, setCorreo] =useState('');
    const [password, setPassword] = useState('');
    const { login, setShowLogin } = useAuth();
    const { notification, showNotification } = useNotification();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(correo, password);
        } catch (error) {
            showNotification(error.message || 'Error al iniciar sesión', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-zinc-900">
            <div className="w-full max-w-md">
                <Notification {...notification} />
                <div className="bg-white shadow-lg rounded-lg px-8 pt-6 pb-8 mb-4 dark:bg-zinc-800">
                    <form 
                        onSubmit={handleSubmit} 
                    >
                        <div className="flex justify-center mb-6">
                            <img src="/images/logo_colegio.png" alt="Logo Colegio" className="h-32" />
                        </div>
                        <h1 className="text-center text-2xl font-bold mb-8 text-gray-800 dark:text-white">
                            Biblioteca Escolar
                        </h1>
                        <div className="mb-4">
                            <label 
                                className="block text-gray-700 text-sm font-bold mb-2 dark:text-zinc-300" 
                                htmlFor="correo"
                            >
                                Correo Electrónico
                            </label>
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline dark:bg-zinc-700 dark:text-zinc-200 dark:border-zinc-600"
                                id="correo"
                                type="email"
                                placeholder="usuario@ejemplo.com"
                                value={correo}
                                onChange={(e) => setCorreo(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-6">
                            <label 
                                className="block text-gray-700 text-sm font-bold mb-2 dark:text-zinc-300" 
                                htmlFor="password"
                            >
                                Contraseña
                            </label>
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline dark:bg-zinc-700 dark:text-zinc-200 dark:border-zinc-600"
                                id="password"
                                type="password"
                                placeholder="******************"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <button
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-indigo-400"
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? 'Ingresando...' : 'Iniciar Sesión'}
                            </button>
                        </div>
                    </form>
                    <div className="text-center mt-6">
                        <button 
                            onClick={() => setShowLogin(false)} 
                            className="inline-block align-baseline font-bold text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                            ← Volver al Catálogo
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;

import React, { useState } from 'react';

const RenewLoanForm = ({ onSubmit, onCancel }) => {
    const [days, setDays] = useState(5); // Valor por defecto

    const handleSubmit = (e) => {
        e.preventDefault();
        if (days > 0) {
            onSubmit(days);
        } else {
            alert('Por favor, ingresa un número válido de días.');
        }
    };

    const inputClass = "w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white";
    const labelClass = "block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300";

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="days" className={labelClass}>
                    Días hábiles a extender
                </label>
                <input
                    id="days"
                    type="number"
                    value={days}
                    onChange={(e) => setDays(parseInt(e.target.value))}
                    min="1"
                    className={inputClass}
                    required
                />
            </div>
            <div className="flex justify-end pt-4 space-x-2">
                <button type="button" onClick={onCancel} className="px-4 py-2 font-medium text-gray-600 bg-gray-200 rounded-md dark:bg-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500">
                    Cancelar
                </button>
                <button type="submit" className="px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                    Confirmar Renovación
                </button>
            </div>
        </form>
    );
};

export default RenewLoanForm;
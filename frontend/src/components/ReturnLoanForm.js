// frontend/src/components/ReturnLoanForm.js
import React, { useState } from 'react';

const ReturnLoanForm = ({ onSubmit, onCancel }) => {
    const [status, setStatus] = useState('disponible');
    const [observaciones, setObservaciones] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ newStatus: status, observaciones });
    };

    const inputClass = "w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white";
    const labelClass = "block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300";

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className={labelClass}>
                    Selecciona el estado final del ítem:
                </label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass}>
                    <option value="disponible">Buen estado (Disponible para préstamo)</option>
                    <option value="deteriorado">Deteriorado (Necesita reparación)</option>
                    <option value="extraviado">Extraviado (No se devolvió)</option>
                </select>
            </div>
            <div>
                <label className={labelClass}>
                    Observaciones (Opcional)
                </label>
                <textarea
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    placeholder="Ej: Tapa suelta, páginas manchadas, etc."
                    className={inputClass + " h-24"}
                />
            </div>
            <div className="flex justify-end pt-4 space-x-2">
                <button type="button" onClick={onCancel} className="px-4 py-2 font-medium text-gray-600 bg-gray-200 rounded-md dark:bg-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500">
                    Cancelar
                </button>
                <button type="submit" className="px-4 py-2 font-medium text-white bg-green-600 rounded-md hover:bg-green-700">
                    Confirmar Devolución
                </button>
            </div>
        </form>
    );
};

export default ReturnLoanForm;
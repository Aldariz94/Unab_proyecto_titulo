// frontend/src/components/ResourceForm.js
import React, { useState, useEffect } from 'react';

const ResourceForm = ({ onSubmit, onCancel, initialData }) => {
    const [resourceData, setResourceData] = useState({
        nombre: '', categoria: 'tecnologia',
        descripcion: '', ubicacion: '', sede: 'Media',
    });
    const [cantidadInstancias, setCantidadInstancias] = useState(1);
    const [additionalInstances, setAdditionalInstances] = useState(0);
    const isEditing = !!initialData;

    useEffect(() => {
        if (isEditing) {
            setResourceData({
                nombre: initialData.nombre || '',
                categoria: initialData.categoria || 'tecnologia',
                descripcion: initialData.descripcion || '',
                ubicacion: initialData.ubicacion || '',
                sede: initialData.sede || 'Media',
            });
        }
    }, [initialData, isEditing]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setResourceData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = isEditing ? { resourceData, additionalInstances } : { resourceData, cantidadInstancias };
        onSubmit(payload);
    };

    const inputClass = "w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white";
    const labelClass = "block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300";

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className={labelClass}>Nombre del Recurso (Obligatorio)</label>
                <input name="nombre" value={resourceData.nombre} onChange={handleChange} placeholder="Proyector Epson" required className={inputClass} />
            </div>
            
            {/* --- CAMPO DE CÓDIGO INTERNO ELIMINADO --- */}
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                    <label className={labelClass}>Categoría (Obligatorio)</label>
                    <select name="categoria" value={resourceData.categoria} onChange={handleChange} required className={inputClass}>
                        <option value="tecnologia">Tecnología</option>
                        <option value="juego">Juego Didáctico</option>
                        <option value="pedagogico">Material Pedagógico</option>
                        <option value="otro">Otro</option>
                    </select>
                </div>
                <div>
                    <label className={labelClass}>Sede (Obligatorio)</label>
                    <select name="sede" value={resourceData.sede} onChange={handleChange} required className={inputClass}>
                        <option value="Media">Sede Media</option>
                        <option value="Basica">Sede Básica</option>
                    </select>
                </div>
            </div>
            <div>
                <label className={labelClass}>Ubicación (Opcional)</label>
                <input name="ubicacion" value={resourceData.ubicacion} onChange={handleChange} placeholder="Bodega CRA" className={inputClass} />
            </div>
            <div>
                <label className={labelClass}>Descripción (Opcional)</label>
                <textarea name="descripcion" value={resourceData.descripcion} onChange={handleChange} placeholder="Proyector para salas de clases" className={inputClass + " h-24"} />
            </div>
            
            {isEditing && (
                 <div>
                    <label className={labelClass}>Añadir más Recursos</label>
                    <input type="number" value={additionalInstances} onChange={(e) => setAdditionalInstances(Number(e.target.value))} min="0" className={inputClass} />
                </div>
            )}
            
            {!isEditing && (
                <div>
                    <label className={labelClass}>Cantidad de Instancias a Crear (Obligatorio)</label>
                    <input type="number" value={cantidadInstancias} onChange={(e) => setCantidadInstancias(Number(e.target.value))} min="1" required className={inputClass} />
                </div>
            )}

            <div className="flex justify-end pt-4 space-x-2">
                <button type="button" onClick={onCancel} className="px-4 py-2 font-medium text-gray-600 bg-gray-200 rounded-md dark:bg-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500">
                    Cancelar
                </button>
                <button type="submit" className="px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                    Guardar
                </button>
            </div>
        </form>
    );
};

export default ResourceForm;
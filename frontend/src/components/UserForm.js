import React, { useState, useEffect } from 'react';

// Lista de cursos predefinida
const courseList = [
    "Pre-Kínder", "Kínder", "1° Básico", "2° Básico", "3° Básico", "4° Básico",
    "5° Básico", "6° Básico", "7° Básico", "8° Básico", "1° Medio", "2° Medio",
    "3° Medio", "4° Medio"
];

const UserForm = ({ onSubmit, onCancel, initialData }) => {
    const [formData, setFormData] = useState({
        primerNombre: '', segundoNombre: '', primerApellido: '', segundoApellido: '',
        rut: '', correo: '', password: '', rol: 'alumno', curso: courseList[0], // Valor por defecto
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                primerNombre: initialData.primerNombre || '', segundoNombre: initialData.segundoNombre || '',
                primerApellido: initialData.primerApellido || '', segundoApellido: initialData.segundoApellido || '',
                rut: initialData.rut || '', correo: initialData.correo || '',
                password: '', rol: initialData.rol || 'alumno', curso: initialData.curso || courseList[0],
            });
        } else {
            setFormData({
                primerNombre: '', segundoNombre: '', primerApellido: '', segundoApellido: '',
                rut: '', correo: '', password: '', rol: 'alumno', curso: courseList[0],
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };
    
    const inputClass = "w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white";
    const labelClass = "block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300";

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                    <label htmlFor="primerNombre" className={labelClass}>Primer Nombre (Obligatorio)</label>
                    <input id="primerNombre" name="primerNombre" value={formData.primerNombre} onChange={handleChange} placeholder="Juan" required className={inputClass} />
                </div>
                <div>
                    <label htmlFor="segundoNombre" className={labelClass}>Segundo Nombre (Opcional)</label>
                    <input id="segundoNombre" name="segundoNombre" value={formData.segundoNombre} onChange={handleChange} placeholder="Carlos" className={inputClass} />
                </div>
                <div>
                    <label htmlFor="primerApellido" className={labelClass}>Primer Apellido (Obligatorio)</label>
                    <input id="primerApellido" name="primerApellido" value={formData.primerApellido} onChange={handleChange} placeholder="Pérez" required className={inputClass} />
                </div>
                <div>
                    <label htmlFor="segundoApellido" className={labelClass}>Segundo Apellido (Opcional)</label>
                    <input id="segundoApellido" name="segundoApellido" value={formData.segundoApellido} onChange={handleChange} placeholder="González" className={inputClass} />
                </div>
            </div>
            <div>
                <label htmlFor="rut" className={labelClass}>RUT (Obligatorio)</label>
                <input id="rut" name="rut" value={formData.rut} onChange={handleChange} placeholder="12345678-9" required className={inputClass} />
            </div>
            <div>
                <label htmlFor="correo" className={labelClass}>Correo Electrónico (Obligatorio)</label>
                <input id="correo" name="correo" type="email" value={formData.correo} onChange={handleChange} placeholder="usuario@ejemplo.com" required className={inputClass} />
            </div>
            <div>
                <label htmlFor="password" className={labelClass}>Contraseña (Opcional)</label>
                <input id="password" name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Dejar en blanco para no cambiar" className={inputClass} />
            </div>
            <div>
                <label htmlFor="rol" className={labelClass}>Rol (Obligatorio)</label>
                <select id="rol" name="rol" value={formData.rol} onChange={handleChange} required className={inputClass}>
                    <option value="alumno">Alumno</option>
                    <option value="profesor">Profesor</option>
                    <option value="personal">Personal no docente</option>
                    <option value="admin">Administrador</option>
                </select>
            </div>
            {formData.rol === 'alumno' && (
                <div>
                    <label htmlFor="curso" className={labelClass}>Curso (Obligatorio para alumnos)</label>
                    {/* CAMBIO: Se reemplaza input por select */}
                    <select id="curso" name="curso" value={formData.curso} onChange={handleChange} required className={inputClass}>
                        {courseList.map(course => (
                            <option key={course} value={course}>{course}</option>
                        ))}
                    </select>
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

export default UserForm;
import React, { useState, useEffect } from 'react';

const BookForm = ({ onSubmit, onCancel, initialData }) => {
    const [libroData, setLibroData] = useState({
        titulo: '', autor: '', editorial: '', lugarPublicacion: '', añoPublicacion: '',
        tipoDocumento: 'Libro', isbn: '', pais: 'Chile', numeroPaginas: '',
        descriptores: '', idioma: '', cdd: '', edicion: '', ubicacionEstanteria: '',
        sede: 'Media'
    });
    const [cantidadEjemplares, setCantidadEjemplares] = useState(1);
    const [additionalExemplars, setAdditionalExemplars] = useState(0);
    const isEditing = !!initialData;

    useEffect(() => {
        if (isEditing) {
            setLibroData({
                titulo: initialData.titulo || '', autor: initialData.autor || '',
                editorial: initialData.editorial || '', lugarPublicacion: initialData.lugarPublicacion || '',
                añoPublicacion: initialData.añoPublicacion || '', tipoDocumento: initialData.tipoDocumento || 'Libro',
                isbn: initialData.isbn || '', pais: initialData.pais || 'Chile',
                numeroPaginas: initialData.numeroPaginas || '', descriptores: (initialData.descriptores || []).join(', '),
                idioma: initialData.idioma || '', cdd: initialData.cdd || '',
                edicion: initialData.edicion || '', ubicacionEstanteria: initialData.ubicacionEstanteria || '',
                sede: initialData.sede || 'Media'
            });
        }
    }, [initialData, isEditing]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLibroData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const finalData = {
            ...libroData,
            descriptores: libroData.descriptores.split(',').map(d => d.trim()).filter(Boolean)
        };
        const payload = isEditing ? { libroData: finalData, additionalExemplars } : { libroData: finalData, cantidadEjemplares };
        onSubmit(payload);
    };

    const inputClass = "w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white";
    const labelClass = "block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300";

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            <h4 className="font-bold dark:text-white">Datos Principales (Obligatorios)</h4>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                    <label className={labelClass}>Título</label>
                    <input name="titulo" value={libroData.titulo} onChange={handleChange} placeholder="Sapiens: De animales a dioses" required className={inputClass} />
                </div>
                <div>
                    <label className={labelClass}>Autor</label>
                    <input name="autor" value={libroData.autor} onChange={handleChange} placeholder="Yuval Noah Harari" required className={inputClass} />
                </div>
                <div>
                    <label className={labelClass}>Editorial</label>
                    <input name="editorial" value={libroData.editorial} onChange={handleChange} placeholder="Debate" required className={inputClass} />
                </div>
                <div>
                    <label className={labelClass}>Lugar de Publicación</label>
                    <input name="lugarPublicacion" value={libroData.lugarPublicacion} onChange={handleChange} placeholder="Madrid" required className={inputClass} />
                </div>
                <div>
                    <label className={labelClass}>Año de Publicación</label>
                    <input name="añoPublicacion" type="number" value={libroData.añoPublicacion} onChange={handleChange} placeholder="2014" required className={inputClass} />
                </div>
                 <div>
                    <label className={labelClass}>Sede</label>
                    <select name="sede" value={libroData.sede} onChange={handleChange} required className={inputClass}>
                        <option value="Media">Sede Media</option>
                        <option value="Basica">Sede Básica</option>
                    </select>
                </div>
            </div>
            <h4 className="font-bold dark:text-white pt-4">Datos Adicionales (Opcionales)</h4>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                 <div>
                    <label className={labelClass}>Tipo de Documento</label>
                    <input name="tipoDocumento" value={libroData.tipoDocumento} onChange={handleChange} placeholder="Ensayo" className={inputClass} />
                </div>
                <div>
                    <label className={labelClass}>ISBN</label>
                    <input name="isbn" value={libroData.isbn} onChange={handleChange} placeholder="978-8499926223" className={inputClass} />
                </div>
                <div>
                    <label className={labelClass}>Edición</label>
                    <input name="edicion" value={libroData.edicion} onChange={handleChange} placeholder="1ª" className={inputClass} />
                </div>
                <div>
                    <label className={labelClass}>N° de Páginas</label>
                    <input name="numeroPaginas" type="number" value={libroData.numeroPaginas} onChange={handleChange} placeholder="496" className={inputClass} />
                </div>
                <div>
                    <label className={labelClass}>Idioma</label>
                    <input name="idioma" value={libroData.idioma} onChange={handleChange} placeholder="Español" className={inputClass} />
                </div>
                <div>
                    <label className={labelClass}>País</label>
                    <input name="pais" value={libroData.pais} onChange={handleChange} placeholder="España" className={inputClass} />
                </div>
                 <div>
                    <label className={labelClass}>CDD</label>
                    <input name="cdd" value={libroData.cdd} onChange={handleChange} placeholder="909" className={inputClass} />
                </div>
            </div>
            <div>
                <label className={labelClass}>Ubicación en Estantería</label>
                <input name="ubicacionEstanteria" value={libroData.ubicacionEstanteria} onChange={handleChange} placeholder="Pasillo 3, Estante A" className={inputClass} />
            </div>
            <div>
                <label className={labelClass}>Descriptores (separados por coma)</label>
                <input name="descriptores" value={libroData.descriptores} onChange={handleChange} placeholder="historia, antropologia, evolucion" className={inputClass} />
            </div>
            
            {isEditing && (
                <div>
                    <label className={labelClass}>Añadir más ejemplares</label>
                    <input type="number" value={additionalExemplars} onChange={(e) => setAdditionalExemplars(Number(e.target.value))} min="0" className={inputClass} />
                </div>
            )}

            {!isEditing && (
                <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Cantidad de Ejemplares a Crear (Obligatorio)
                    </label>
                    <input type="number" value={cantidadEjemplares} onChange={(e) => setCantidadEjemplares(Number(e.target.value))} min="1" required className={inputClass} />
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

export default BookForm;
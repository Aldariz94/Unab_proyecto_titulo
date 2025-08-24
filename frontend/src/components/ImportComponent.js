import React, { useState, useRef } from 'react';
import api from '../services/api';
import { ArrowUpTrayIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

const ImportComponent = ({ importType, onImportSuccess }) => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
        }
        setResult(null);
    };

    const handleUpload = async () => {
        if (!file) {
            setResult({ msg: 'Por favor, selecciona un archivo de Excel.', errors: 'No se seleccionó ningún archivo.' });
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        setLoading(true);

        try {
            const response = await api.post(`/import/${importType}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setResult(response.data);

            if (response.data.successCount > 0) {
                onImportSuccess(response.data.msg);
            }
        } catch (error) {
            const errorData = error.response?.data;
            if (errorData) {
                setResult(errorData);
            } else {
                setResult({ msg: 'Error de red al subir el archivo.' });
            }
        } finally {
            setLoading(false);
            setFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = null;
            }
        }
    };

    const getTemplateUrl = () => {
        switch (importType) {
            case 'users':
                return '/templates/plantilla_usuarios.xlsx';
            case 'books':
                return '/templates/plantilla_libros.xlsx';
            case 'resources':
                return '/templates/plantilla_recursos.xlsx';
            default:
                return '#';
        }
    };

    const renderInstructions = () => {
        let mandatoryFields = [];
        let optionalFields = [];

        switch (importType) {
            case 'users':
                mandatoryFields = ['primerNombre', 'primerApellido', 'rut', 'correo', 'rol'];
                optionalFields = ['segundoNombre', 'segundoApellido', 'curso (obligatorio para rol alumno)', 'password (si se omite, se usa el rut)'];
                break;
            case 'books':
                mandatoryFields = ['titulo', 'autor', 'sede', 'tipoDocumento', 'lugarPublicacion', 'editorial', 'añoPublicacion'];
                optionalFields = ['cantidadEjemplares (si se omite, es 1)', 'isbn', 'pais', 'numeroPaginas', 'descriptores', 'idioma', 'cdd', 'edicion', 'ubicacionEstanteria'];
                break;
            case 'resources':
                mandatoryFields = ['nombre', 'categoria', 'sede'];
                optionalFields = ['cantidadInstancias (si se omite, es 1)', 'descripcion', 'ubicacion'];
                break;
            default:
                return null;
        }

        return (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 p-3 bg-gray-50 dark:bg-zinc-800 rounded-md border dark:border-zinc-700">
                <p className="font-bold mb-1 text-gray-700 dark:text-gray-200">Campos Obligatorios:</p>
                <ul className="list-disc list-inside pl-2 mb-2">
                    {mandatoryFields.map(field => <li key={field}>{field}</li>)}
                </ul>
                <p className="font-bold mb-1 text-gray-700 dark:text-gray-200">Campos Opcionales:</p>
                <ul className="list-disc list-inside pl-2">
                    {optionalFields.map(field => <li key={field}>{field}</li>)}
                </ul>
            </div>
        );
    };

    return (
        <div className="space-y-4">
            <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    El archivo debe tener las columnas correctas. Descarga la plantilla para ver un ejemplo.
                    <strong className="text-red-500"> Recuerda borrar la fila de ejemplo antes de subir tu archivo.</strong>
                </p>
                <a 
                    href={getTemplateUrl()} 
                    download 
                    className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 dark:hover:bg-yellow-800"
                >
                    <ArrowDownTrayIcon className="w-4 h-4" />
                    <span>Descargar Plantilla</span>
                </a>
                {renderInstructions()}
            </div>

            <div className="flex flex-col items-center">
                <input 
                    ref={fileInputRef}
                    type="file" 
                    id="file-upload"
                    className="sr-only"
                    onChange={handleFileChange} 
                    accept=".xlsx, .xls"
                />

                <label 
                    htmlFor="file-upload" 
                    className="cursor-pointer flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-700 bg-green-100 border border-green-300 rounded-md hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-700 dark:hover:bg-green-800"
                >
                    <ArrowUpTrayIcon className="w-5 h-5" />
                    <span>Seleccionar Archivo</span>
                </label>

                {file && (
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{file.name}</p>
                )}
            </div>
            
            <button 
                onClick={handleUpload} 
                disabled={!file || loading}
                className="w-full px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-300"
            >
                {loading ? 'Procesando...' : 'Importar Datos'}
            </button>

            {result && (
                <div className={`mt-4 p-4 rounded-md text-sm ${
                    result.successCount > 0 
                        ? 'bg-green-100 dark:bg-green-900' 
                        : 'bg-yellow-100 dark:bg-yellow-900'
                }`}>
                    <p className={`font-semibold ${
                        result.successCount > 0 
                            ? 'text-green-800 dark:text-green-200'
                            : 'text-yellow-800 dark:text-yellow-200'
                    }`}>
                        {result.msg}
                    </p>
                    {result.errors && (
                        <pre className="mt-2 text-yellow-700 dark:text-yellow-300 whitespace-pre-wrap font-sans text-xs">{
                            Array.isArray(result.errors) ? result.errors.join('\n') : result.errors
                        }</pre>
                    )}
                </div>
            )}
        </div>
    );
};

export default ImportComponent;
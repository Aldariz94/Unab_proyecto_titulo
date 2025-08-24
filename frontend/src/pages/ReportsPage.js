import React, { useState, useEffect } from 'react';
import api from '../services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useNotification, useAuth } from '../hooks';
import { Notification } from '../components';

const courseList = [
    "Pre-Kínder", "Kínder", "1° Básico", "2° Básico", "3° Básico", "4° Básico",
    "5° Básico", "6° Básico", "7° Básico", "8° Básico", "1° Medio", "2° Medio",
    "3° Medio", "4° Medio"
];

const initialFilters = { startDate: '', endDate: '', status: '', course: '', role: '' };

const ReportsPage = () => {
    const [filters, setFilters] = useState(initialFilters);
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);
    const { notification, showNotification } = useNotification();
    const { user } = useAuth();

    const [studentSearch, setStudentSearch] = useState('');
    const [studentResults, setStudentResults] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);

    const [bookSearch, setBookSearch] = useState('');
    const [bookResults, setBookResults] = useState([]);
    const [selectedBook, setSelectedBook] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    const handleResetFilters = () => {
        setFilters(initialFilters);
        setReportData([]);
        setBookSearch('');
        setSelectedBook(null);
        setStudentSearch('');
        setSelectedStudent(null);
        setCurrentPage(1);
        setTotalPages(0);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        
        setFilters(prev => ({ ...prev, [name]: value }));

        if (name === 'role') {
            setSelectedStudent(null);
            setStudentSearch('');
            if (value === 'profesor') {
                setFilters(prev => ({ ...prev, course: '' }));
            }
        }
    };

    const handleBookSearch = async (e) => {
        const query = e.target.value;
        setBookSearch(query);
        setSelectedBook(null);
        if (query.length > 2) {
            const res = await api.get(`/search/all-books?q=${query}`);
            setBookResults(res.data);
        } else {
            setBookResults([]);
        }
    };

    const selectBook = (book) => {
        setSelectedBook(book);
        setBookSearch(book.titulo);
        setBookResults([]);
    };

    const handleStudentSearch = async (e) => {
        const query = e.target.value;
        setStudentSearch(query);
        setSelectedStudent(null);
        if (query.length > 2) {
            const res = await api.get(`/search/students?q=${query}`);
            setStudentResults(res.data);
        } else {
            setStudentResults([]);
        }
    };

    const selectStudent = (student) => {
        setSelectedStudent(student);
        setStudentSearch(`${student.primerNombre} ${student.primerApellido} (${student.rut})`);
        setStudentResults([]);
    };

    const handleGenerateReport = async (pageToFetch) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);
            if (filters.status) params.append('status', filters.status);
            if (filters.course) params.append('course', filters.course);
            if (selectedBook) params.append('bookId', selectedBook._id);
            if (filters.role) params.append('role', filters.role);

            if (selectedStudent) {
                params.delete('role');
                params.delete('course');
                params.append('userId', selectedStudent._id);
            }

            params.append('page', pageToFetch);
            params.append('limit', 15);

            const response = await api.get(`/reports/loans?${params.toString()}`);
            setReportData(response.data.docs);
            setTotalPages(response.data.totalPages);
            setCurrentPage(response.data.page);

            if(response.data.docs.length === 0 && pageToFetch === 1) { // Solo mostrar si es la primera página
                showNotification("No se encontraron resultados para los filtros aplicados.", "error");
            }
        } catch (err) {
            showNotification(err.response?.data?.msg || 'Error al generar el reporte.', 'error');
        } finally {
            setLoading(false);
        }
    };

const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Reporte de Préstamos - Biblioteca Escolar", 14, 16);
    
    const tableColumn = ["Usuario", "Ítem Prestado", "Fecha Préstamo", "Vencimiento", "Estado"];
    const tableRows = reportData.map(loan => [
        loan.usuarioId ? `${loan.usuarioId.primerNombre} ${loan.usuarioId.primerApellido}` : 'Usuario Eliminado',
        loan.itemDetails?.titulo || loan.itemDetails?.nombre || 'Ítem Eliminado',
        new Date(loan.fechaInicio).toLocaleDateString('es-CL'),
        new Date(loan.fechaVencimiento).toLocaleDateString('es-CL'),
        loan.estado === 'enCurso' ? 'En Préstamo' : loan.estado,
    ]);

    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 20,
    });

    const date = new Date().toISOString().split('T')[0];
    doc.save(`Reporte_Prestamos_${date}.pdf`);
};

    useEffect(() => {
        setCurrentPage(1);
    }, [filters, selectedBook, selectedStudent]);


    return (
        <div>
            <Notification {...notification} />
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Generar Reportes</h1>
            
            <div className="mt-6 p-4 bg-white rounded-lg shadow dark:bg-gray-800">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fecha de Inicio</label>
                        <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="mt-1 block w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fecha de Fin</label>
                        <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="mt-1 block w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                    </div>
                     <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Filtrar por Libro</label>
                        <input type="text" value={bookSearch} onChange={handleBookSearch} placeholder="Buscar libro..." className="mt-1 block w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                        {bookResults.length > 0 && (
                            <ul className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg dark:bg-gray-800 dark:border-gray-600 max-h-40 overflow-y-auto">{bookResults.map(book => (<li key={book._id} onClick={() => selectBook(book)} className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white">{book.titulo}</li>))}</ul>
                        )}
                    </div>
                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Filtrar por Alumno</label>
                        <input type="text" value={studentSearch} onChange={handleStudentSearch} placeholder="Buscar por nombre..." className="mt-1 block w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                        {studentResults.length > 0 && (
                            <ul className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg dark:bg-gray-800 dark:border-gray-600 max-h-40 overflow-y-auto">{studentResults.map(student => (<li key={student._id} onClick={() => selectStudent(student)} className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white">{student.primerNombre} {student.primerApellido}</li>))}</ul>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Filtrar por Rol</label>
                        <select 
                            name="role" 
                            value={filters.role} 
                            onChange={handleFilterChange} 
                            className="mt-1 block w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                            {user.rol === 'admin' ? (
                                <>
                                    <option value="">Todos los Roles</option>
                                    <option value="alumno">Alumnos</option>
                                    <option value="profesor">Profesores</option>
                                    <option value="personal">Personal</option>
                                </>
                            ) : (
                                <>
                                    <option value="alumno">Alumnos</option>
                                    <option value="profesor">Mis Préstamos</option>
                                </>
                            )}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Curso (solo alumnos)</label>
                        <select 
                            name="course" 
                            value={filters.course} 
                            onChange={handleFilterChange} 
                            className="mt-1 block w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            disabled={!!selectedStudent || (user.rol === 'profesor' && filters.role === 'profesor')}
                        >
                            <option value="">Todos los Cursos</option>
                            {courseList.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Estado del Préstamo</label>
                        <select name="status" value={filters.status} onChange={handleFilterChange} className="mt-1 block w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                            <option value="">Todos</option>
                            <option value="enCurso">En Préstamo</option>
                            <option value="devuelto">Devuelto</option>
                            <option value="atrasado">Atrasado</option>
                        </select>
                    </div>
                </div>
                <div className="mt-4 flex flex-col sm:flex-row justify-end gap-2">
                    <button onClick={handleResetFilters} className="px-6 py-2 font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500">
                        Reiniciar Filtros
                    </button>
                    <button onClick={() => handleGenerateReport(1)} disabled={loading} className="px-6 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400">
                        {loading ? 'Generando...' : 'Generar Reporte'}
                    </button>
                </div>
            </div>

            {reportData.length > 0 && (
                <div className="mt-8 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Resultados del Reporte</h2>
                    <button onClick={handleExportPDF} className="px-4 py-2 font-medium text-white bg-green-600 rounded-md hover:bg-green-700">
                        Exportar a PDF
                    </button>
                </div>
            )}

            <div className="mt-4 overflow-x-auto bg-white rounded-lg shadow dark:bg-gray-800">
                <table className="min-w-full text-sm divide-y divide-gray-200 dark:divide-gray-700 responsive-table">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Usuario</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Ítem Prestado</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Fecha Préstamo</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Vencimiento</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Estado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {reportData.length > 0 ? (
                            reportData.map(loan => (
                                <tr key={loan._id} className="hover:bg-gray-100 dark:hover:bg-gray-600">
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">{loan.usuarioId?.primerNombre} {loan.usuarioId?.primerApellido}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-300">{loan.itemDetails?.titulo || loan.itemDetails?.nombre || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-300">{new Date(loan.fechaInicio).toLocaleDateString('es-CL')}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-300">{new Date(loan.fechaVencimiento).toLocaleDateString('es-CL')}</td>
                                    <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${loan.estado === 'atrasado' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' : loan.estado === 'devuelto' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'}`}>{loan.estado === 'enCurso' ? 'En Préstamo' : loan.estado}</span></td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                    { "Aplica los filtros y presiona 'Generar Reporte' para ver los resultados."}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {!loading && totalPages > 1 && (
                <div className="flex items-center justify-end mt-4 text-sm">
                    <button
                        onClick={() => handleGenerateReport(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 mr-2 text-gray-700 bg-gray-200 rounded-md dark:bg-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Anterior
                    </button>
                    <span className="text-gray-700 dark:text-gray-300">
                        Página {currentPage} de {totalPages}
                    </span>
                    <button
                        onClick={() => handleGenerateReport(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 ml-2 text-gray-700 bg-gray-200 rounded-md dark:bg-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Siguiente
                    </button>
                </div>
            )}
        </div>
    );
};

export default ReportsPage;
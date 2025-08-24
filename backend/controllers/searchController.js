const User = require('../models/User');
const Exemplar = require('../models/Exemplar');
const ResourceInstance = require('../models/ResourceInstance');
const Book = require('../models/Book');
const ResourceCRA = require('../models/ResourceCRA');

// @route   GET api/search/users?q=...
// @desc    Buscar usuarios por nombre, rut o correo
exports.searchUsers = async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) {
            return res.json([]);
        }
        const users = await User.find({
            $or: [
                { primerNombre: { $regex: query, $options: 'i' } },
                { primerApellido: { $regex: query, $options: 'i' } },
                { rut: { $regex: query, $options: 'i' } },
                { correo: { $regex: query, $options: 'i' } }
            ]
        }).select('primerNombre primerApellido rut').limit(10); // Limitar a 10 resultados
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
};

// @route   GET api/search/items?q=...
// @desc    Buscar ítems (libros o recursos) disponibles
exports.searchAvailableItems = async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) {
            return res.json([]);
        }

        // Buscar en Libros (a través de sus ejemplares)
        const availableExemplars = await Exemplar.find({ estado: 'disponible' })
            .populate({
                path: 'libroId',
                match: { titulo: { $regex: query, $options: 'i' } },
                select: 'titulo autor'
            });

        // Buscar en Recursos (a través de sus instancias)
        const availableInstances = await ResourceInstance.find({ estado: 'disponible' })
            .populate({
                path: 'resourceId',
                match: { nombre: { $regex: query, $options: 'i' } },
                select: 'nombre'
            });
        
        // Formatear resultados para el frontend
        const bookResults = availableExemplars
            .filter(e => e.libroId) // Filtrar los que no coincidieron con el título
            .map(e => ({
                _id: e._id,
                type: 'Exemplar',
                name: `${e.libroId.titulo} (Copia #${e.numeroCopia})`
            }));
        
        const resourceResults = availableInstances
            .filter(i => i.resourceId) // Filtrar los que no coincidieron con el nombre
            .map(i => ({
                _id: i._id,
                type: 'ResourceInstance',
                name: `${i.resourceId.nombre} (${i.codigoInterno})`
            }));

        res.json([...bookResults, ...resourceResults].slice(0, 15)); // Limitar resultados combinados

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
};

// @route   GET api/search/all-books?q=...
// @desc    Buscar en todos los libros (no solo los disponibles)
exports.searchAllBooks = async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) {
            return res.json([]);
        }
        const books = await Book.find({
            titulo: { $regex: query, $options: 'i' }
        }).select('titulo autor').limit(10);
        res.json(books);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
};


// @route   GET /api/search/find-available-copy/:itemType/:baseItemId
// @desc    Encontrar el ID de una copia (ejemplar o instancia) disponible
exports.findAvailableCopy = async (req, res) => {
    try {
        const { itemType, baseItemId } = req.params;

        let availableCopy = null;

        if (itemType === 'Book') {
            availableCopy = await Exemplar.findOne({
                libroId: baseItemId,
                estado: 'disponible'
            });
        } else if (itemType === 'Resource') {
            availableCopy = await ResourceInstance.findOne({
                resourceId: baseItemId,
                estado: 'disponible'
            });
        }

        if (!availableCopy) {
            return res.status(404).json({ msg: 'No se encontraron copias disponibles para este ítem.' });
        }

        res.json({ copyId: availableCopy._id });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
};

// @route   GET api/search/students?q=...
// @desc    Buscar solo usuarios con el rol de alumno
// @access  Private (Admin, Profesor)
exports.searchStudents = async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) {
            return res.json([]);
        }
        const students = await User.find({
            rol: 'alumno', // <-- La clave: filtramos solo por alumnos
            $or: [
                { primerNombre: { $regex: query, $options: 'i' } },
                { primerApellido: { $regex: query, $options: 'i' } },
                { rut: { $regex: query, $options: 'i' } }
            ]
        }).select('primerNombre primerApellido rut').limit(10);
        res.json(students);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
};
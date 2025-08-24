const Book = require('../models/Book');
const ResourceCRA = require('../models/ResourceCRA');
const Exemplar = require('../models/Exemplar');
const ResourceInstance = require('../models/ResourceInstance');

// Función de ayuda reutilizable para construir los pipelines de consulta
const buildCatalogPipeline = (Model, page, limit, search = '', itemType = 'Libro') => {
    const skip = (page - 1) * limit;
    
    let searchMatch = {};
    if (search) {
        if (itemType === 'Libro') {
            searchMatch = { $match: { $or: [{ titulo: { $regex: search, $options: 'i' } }, { autor: { $regex: search, $options: 'i' } }] } };
        } else {
            searchMatch = { $match: { nombre: { $regex: search, $options: 'i' } } };
        }
    } else {
        searchMatch = { $match: {} };
    }

    const lookupStage = itemType === 'Libro'
        ? { from: Exemplar.collection.name, localField: '_id', foreignField: 'libroId', as: 'instancesInfo' }
        : { from: ResourceInstance.collection.name, localField: '_id', foreignField: 'resourceId', as: 'instancesInfo' }; // <-- CORRECCIÓN LÓGICA: localField era 'id'

    const addFieldsStage = itemType === 'Libro'
        ? { itemType: 'Libro', totalStock: { $size: '$instancesInfo' }, availableStock: { $size: { $filter: { input: '$instancesInfo', as: 'e', cond: { $eq: ['$$e.estado', 'disponible'] } } } } }
        : { itemType: 'Recurso', titulo: '$nombre', totalStock: { $size: '$instancesInfo' }, availableStock: { $size: { $filter: { input: '$instancesInfo', as: 'i', cond: { $eq: ['$$i.estado', 'disponible'] } } } } } ;

    return [
        searchMatch,
        {
            $facet: {
                metadata: [{ $count: "total" }],
                data: [
                    { $sort: { [itemType === 'Libro' ? 'titulo' : 'nombre']: 1 } },
                    { $skip: skip },
                    { $limit: limit },
                    { $lookup: lookupStage },
                    { $addFields: addFieldsStage },
                    { $project: { instancesInfo: 0, nombre: 0, __v: 0 } }
                ]
            }
        }
    ]
};

exports.getPublicCatalog = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 16;
        const search = req.query.search || '';

        const pipeline = buildCatalogPipeline(Book, page, limit, search, 'Libro');
        const results = await Book.aggregate(pipeline);

        const docs = results[0].data;
        const totalDocs = results[0].metadata[0] ? results[0].metadata[0].total : 0;
        const totalPages = Math.ceil(totalDocs / limit);

        res.json({ docs, totalDocs, totalPages, page });
    } catch (err) {
        console.error("Error al obtener el catálogo público:", err.message);
        res.status(500).send('Error del servidor');
    }
};

exports.getUserBookCatalog = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 16;
        const search = req.query.search || '';

        const pipeline = buildCatalogPipeline(Book, page, limit, search, 'Libro');
        const results = await Book.aggregate(pipeline);
        
        const docs = results[0].data;
        const totalDocs = results[0].metadata[0] ? results[0].metadata[0].total : 0;
        const totalPages = Math.ceil(totalDocs / limit);

        res.json({ docs, totalDocs, totalPages, page });
    } catch (err) {
        console.error("Error al obtener catálogo de libros de usuario:", err.message);
        res.status(500).send('Error del servidor');
    }
};

exports.getUserResourceCatalog = async (req, res) => {
    if (req.user.rol === 'alumno') {
        return res.status(403).json({ msg: 'Acceso no autorizado para este rol.' });
    }
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 16;
        const search = req.query.search || '';

        const pipeline = buildCatalogPipeline(ResourceCRA, page, limit, search, 'Recurso');
        const results = await ResourceCRA.aggregate(pipeline);
        
        const docs = results[0].data;
        const totalDocs = results[0].metadata[0] ? results[0].metadata[0].total : 0;
        const totalPages = Math.ceil(totalDocs / limit);

        res.json({ docs, totalDocs, totalPages, page });
    } catch (err) {
        console.error("Error al obtener catálogo de recursos de usuario:", err.message);
        res.status(500).send('Error del servidor');
    }
};
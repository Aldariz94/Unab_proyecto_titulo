// backend/controllers/resourceController.js
const ResourceCRA = require('../models/ResourceCRA');
const ResourceInstance = require('../models/ResourceInstance');
const mongoose = require('mongoose');

exports.createResource = async (req, res) => {
    const { resourceData, cantidadInstancias } = req.body;
    
    try {
        delete resourceData.codigoInterno; // Nos aseguramos de no usar el del formulario

        const newResource = new ResourceCRA(resourceData);
        const savedResource = await newResource.save();

        if (cantidadInstancias > 0) {
            // --- NUEVA LÓGICA DE GENERACIÓN DE CÓDIGO ---
            const sedePrefix = savedResource.sede === 'Basica' ? 'RBB' : 'RBM';

            // Contamos cuántas instancias ya existen con este prefijo para saber el número inicial
            const lastInstanceCount = await ResourceInstance.countDocuments({
                codigoInterno: { $regex: `^${sedePrefix}` }
            });
            
            const instances = [];
            for (let i = 1; i <= cantidadInstancias; i++) {
                // Generamos el número secuencial, rellenando con ceros a la izquierda hasta tener 3 dígitos
                const sequentialNumber = (lastInstanceCount + i).toString().padStart(3, '0');
                const codigoInternoInstancia = `${sedePrefix}-${sequentialNumber}`;
                
                instances.push({
                    resourceId: savedResource._id,
                    codigoInterno: codigoInternoInstancia,
                    estado: 'disponible'
                });
            }
            await ResourceInstance.insertMany(instances);
        }
        res.status(201).json({ msg: 'Recurso e instancias creados.', resource: savedResource });
    } catch (err) {
        console.error(err.message);
        if (err.code === 11000) {
            return res.status(400).json({ msg: 'Error de duplicado al crear instancias. Inténtelo de nuevo.' });
        }
        res.status(500).send('Error del servidor');
    }
};

// --- (El resto de las funciones del controlador no cambian) ---

// --- INICIO DE LA MODIFICACIÓN ---
exports.getResources = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const search = req.query.search || '';

        let query = {};
        if (search) {
            const searchRegex = new RegExp(search, 'i');
            query = {
                $or: [
                    { nombre: searchRegex },
                    { categoria: searchRegex },
                    { sede: searchRegex }
                ]
            };
        }

        const results = await ResourceCRA.aggregate([
            { $match: query },
            {
                $facet: {
                    metadata: [{ $count: "total" }],
                    data: [
                        { $sort: { createdAt: -1, _id: 1 } },
                        { $skip: skip },
                        { $limit: limit },
                        {
                            $lookup: {
                                from: 'resourceinstances',
                                localField: '_id',
                                foreignField: 'resourceId',
                                as: 'instancesInfo'
                            }
                        },
                        {
                            $addFields: {
                                totalInstances: { $size: '$instancesInfo' },
                                availableInstances: {
                                    $size: {
                                        $filter: {
                                            input: '$instancesInfo',
                                            as: 'instance',
                                            cond: { $eq: ['$$instance.estado', 'disponible'] }
                                        }
                                    }
                                }
                            }
                        },
                        { $project: { instancesInfo: 0 } }
                    ]
                }
            }
        ]);

        const resources = results[0].data;
        const totalResources = results[0].metadata[0] ? results[0].metadata[0].total : 0;
        const totalPages = Math.ceil(totalResources / limit);

        res.json({
            docs: resources,
            totalDocs: totalResources,
            totalPages,
            page
        });
    } catch (err) {
        console.error("Error en getResources:", err.message);
        res.status(500).send('Error del servidor al obtener recursos');
    }
};
// --- FIN DE LA MODIFICACIÓN ---

exports.updateResource = async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ msg: 'ID de recurso no válido.' });
    }
    try {
        const resource = await ResourceCRA.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );
        if (!resource) return res.status(404).json({ msg: 'Recurso no encontrado.' });
        res.json({ msg: 'Recurso actualizado.', resource });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
};

exports.deleteResource = async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ msg: 'ID de recurso no válido.' });
    }
    try {
        const resource = await ResourceCRA.findById(req.params.id);
        if (!resource) return res.status(404).json({ msg: 'Recurso no encontrado.' });
        await ResourceInstance.deleteMany({ resourceId: req.params.id });
        await ResourceCRA.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Recurso y todas sus instancias han sido eliminados.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
};

exports.addInstances = async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ msg: 'ID de recurso no válido.' });
    }
    const { quantity, codigoInternoBase } = req.body;
    try {
        const instanceCount = await ResourceInstance.countDocuments({ resourceId: req.params.id });
        
        const newInstances = [];
        for (let i = 0; i < quantity; i++) {
            const codigoInterno = `${codigoInternoBase}-${instanceCount + i + 1}`;
            newInstances.push({
                resourceId: req.params.id,
                codigoInterno: codigoInterno,
                estado: 'disponible'
            });
        }
        await ResourceInstance.insertMany(newInstances);
        res.status(201).json({ msg: `${quantity} nuevas instancias añadidas.` });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
};

exports.getInstancesForResource = async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ msg: 'ID de recurso no válido.' });
    }
    try {
        const instances = await ResourceInstance.find({ resourceId: req.params.id }).sort({ codigoInterno: 'asc' });
        res.json(instances);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
};

exports.updateInstanceStatus = async (req, res) => {
    const { estado } = req.body;
    const { instanceId } = req.params;

    const allowedStatus = ['disponible', 'prestado', 'mantenimiento', 'reservado'];
    if (!estado || !allowedStatus.includes(estado)) {
        return res.status(400).json({ msg: 'Estado no válido.' });
    }
    if (!mongoose.Types.ObjectId.isValid(instanceId)) {
        return res.status(400).json({ msg: 'ID de instancia no válido.' });
    }

    try {
        const instance = await ResourceInstance.findByIdAndUpdate(
            instanceId,
            { $set: { estado } },
            { new: true }
        );
        if (!instance) return res.status(404).json({ msg: 'Instancia no encontrada.' });
        res.json(instance);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
};
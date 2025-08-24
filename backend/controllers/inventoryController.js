// backend/controllers/inventoryController.js
const Exemplar = require('../models/Exemplar');
const ResourceInstance = require('../models/ResourceInstance');

// --- INICIO DE LA MODIFICACIÓN ---
exports.getItemsForAttention = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const problemStatus = ['deteriorado', 'extraviado', 'mantenimiento'];

        const exemplars = await Exemplar.find({ estado: { $in: problemStatus } }).populate('libroId', 'titulo').lean();
        const resourceInstances = await ResourceInstance.find({ estado: { $in: problemStatus } }).populate('resourceId', 'nombre').lean();

        const formattedExemplars = exemplars.map(e => ({ ...e, itemType: 'Libro' }));
        const formattedInstances = resourceInstances.map(i => ({ ...i, itemType: 'Recurso' }));

        const allItems = [...formattedExemplars, ...formattedInstances]
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)); // Ordenar por fecha de actualización

        const totalItems = allItems.length;
        const totalPages = Math.ceil(totalItems / limit);

        const paginatedItems = allItems.slice(skip, skip + limit);

        res.json({
            docs: paginatedItems,
            totalDocs: totalItems,
            totalPages,
            page
        });
    } catch (err) {
        console.error("Error al obtener ítems para atención:", err.message);
        res.status(500).send('Error del servidor');
    }
};
// --- FIN DE LA MODIFICACIÓN ---

exports.deleteItemInstance = async (req, res) => {
    try {
        const { itemModel, itemId } = req.params;

        const Model = itemModel === 'Libro' ? Exemplar : ResourceInstance;
        
        const deletedItem = await Model.findByIdAndDelete(itemId);

        if (!deletedItem) {
            return res.status(404).json({ msg: 'Instancia o ejemplar no encontrado.' });
        }

        res.json({ msg: 'Ítem dado de baja exitosamente.' });
    } catch (err) {
        console.error("Error al dar de baja el ítem:", err.message);
        res.status(500).send('Error del servidor');
    }
};